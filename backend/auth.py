import os
import uuid
from datetime import datetime, timezone, timedelta

import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models
from database import get_db
from security_protocol import is_jwt_token_revoked, log_security_event

SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # Assign unique JTI (JWT ID) for revocation tracking
    to_encode.update({
        "exp": expire,
        "jti": uuid.uuid4().hex,
        "iat": datetime.now(timezone.utc)
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Check if token was explicitly revoked via logout
    if is_jwt_token_revoked(token, db):
        log_security_event(
            event_type="UNAUTHORIZED_REVOKED_TOKEN_ACCESS",
            severity="WARNING",
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details="Attempted access using an explicitly invalidated/logged-out JWT token.",
            db=db
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked or logged out. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Decode and validate JWT payload
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError as e:
        log_security_event(
            event_type="UNAUTHORIZED_INVALID_TOKEN",
            severity="WARNING",
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details=f"Malformed or expired JWT token attempted: {str(e)}",
            db=db
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Retrieve user from database
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        log_security_event(
            event_type="UNAUTHORIZED_UNKNOWN_USER",
            severity="CRITICAL",
            user_id=int(user_id) if str(user_id).isdigit() else None,
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details=f"Token valid but associated user ID {user_id} does not exist in registry.",
            db=db
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists or has been deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

