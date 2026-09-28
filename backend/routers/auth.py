from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

import models
import schemas
from auth import create_access_token, get_current_user, hash_password, verify_password, oauth2_scheme
from database import get_db
from security_protocol import rate_limiter, log_security_event, revoke_jwt_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.TokenResponse)
def signup(payload: schemas.SignupRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Enforce basic password strength for legal data security
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        log_security_event(
            event_type="SIGNUP_DUPLICATE_EMAIL_REJECTED",
            severity="INFO",
            user_email=payload.email,
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details=f"Signup registration rejected: email {payload.email} already exists.",
            db=db
        )
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_security_event(
        event_type="USER_REGISTERED",
        severity="INFO",
        user_id=user.id,
        user_email=user.email,
        ip_address=client_ip,
        endpoint=str(request.url.path),
        details=f"New user account created: {user.full_name} ({user.email}).",
        db=db
    )

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Check brute-force lockout status
    is_locked, remaining_secs = rate_limiter.is_locked_out(client_ip)
    if is_locked:
        log_security_event(
            event_type="RATE_LIMIT_BRUTE_FORCE_BLOCKED",
            severity="CRITICAL",
            user_email=payload.email,
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details=f"Brute-force lockout active. Connection throttled for {remaining_secs}s.",
            db=db
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. IP temporarily locked. Please retry in {remaining_secs} seconds."
        )

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        rate_limiter.record_failed_login(client_ip)
        log_security_event(
            event_type="UNAUTHORIZED_LOGIN_FAILED",
            severity="WARNING",
            user_id=user.id if user else None,
            user_email=payload.email,
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details=f"Invalid credentials submitted for account '{payload.email}'.",
            db=db
        )
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Reset failed attempts upon successful authentication
    rate_limiter.reset_failed_logins(client_ip)

    token = create_access_token({"sub": str(user.id)})

    log_security_event(
        event_type="LOGIN_SUCCESS",
        severity="INFO",
        user_id=user.id,
        user_email=user.email,
        ip_address=client_ip,
        endpoint=str(request.url.path),
        details=f"Successful authentication for {user.full_name} ({user.email}).",
        db=db
    )

    return {"access_token": token}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    revoke_jwt_token(token, db)
    log_security_event(
        event_type="LOGOUT_TOKEN_REVOKED",
        severity="INFO",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
        endpoint=str(request.url.path),
        details="User logged out; JWT invalidated.",
        db=db
    )
    return {"message": "Logged out successfully. Token invalidated."}
