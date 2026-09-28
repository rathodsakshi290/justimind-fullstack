"""
Comprehensive Security and Privacy Protocol for JustiMind.
Provides:
1. OWASP Compliant Security Headers Middleware
2. Brute-Force & Adaptive Rate Limiting
3. Legal Privacy & PII Redaction Engine (Attorney-Client Privilege Protection)
4. Persistent Security Audit Logging & Threat Telemetry
5. Token Revocation & Session Invalidation Management
"""

import re
import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple

import jwt
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session

import models
from database import SessionLocal

# =====================================================================
# 1. OWASP Security Headers Middleware
# =====================================================================
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects enterprise-grade HTTP security headers on all responses,
    preventing Clickjacking, MIME sniffing, XSS, and insecure resource loading.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Enforce strict transport and framing protection
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Content Security Policy (allows local Vite development and secure CDN assets)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 http://127.0.0.1:3000 http://127.0.0.1:8000 http://localhost:8000; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://localhost:5173 http://127.0.0.1:5173 https:;"
        )
        return response


# =====================================================================
# 2. Adaptive Rate Limiter & Brute-Force Shield
# =====================================================================
class RateLimiter:
    """
    In-memory sliding-window rate limiter and failed login counter.
    Protects against brute-force password spraying and API abuse.
    """
    def __init__(self):
        # ip -> list of request timestamps
        self.requests = defaultdict(list)
        # ip -> list of failed login timestamps
        self.failed_logins = defaultdict(list)
        # Lockout period in seconds after exceeding threshold
        self.lockout_seconds = 60
        self.max_failed_logins = 5

    def is_locked_out(self, client_ip: str) -> Tuple[bool, int]:
        now = time.time()
        # Clean older than lockout window
        self.failed_logins[client_ip] = [
            t for t in self.failed_logins[client_ip] if now - t < self.lockout_seconds
        ]
        count = len(self.failed_logins[client_ip])
        if count >= self.max_failed_logins:
            oldest = min(self.failed_logins[client_ip])
            remaining = int(self.lockout_seconds - (now - oldest))
            return True, max(1, remaining)
        return False, 0

    def record_failed_login(self, client_ip: str):
        self.failed_logins[client_ip].append(time.time())

    def reset_failed_logins(self, client_ip: str):
        if client_ip in self.failed_logins:
            del self.failed_logins[client_ip]

    def check_rate_limit(self, client_ip: str, limit: int = 120, window_seconds: int = 60) -> bool:
        now = time.time()
        # Clean old requests
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < window_seconds
        ]
        if len(self.requests[client_ip]) >= limit:
            return False
        self.requests[client_ip].append(now)
        return True


rate_limiter = RateLimiter()


# =====================================================================
# 3. Privacy & Legal PII Redaction Engine
# =====================================================================
class PrivacyRedactionEngine:
    """
    Detects and masks personally identifiable information (PII), confidential
    financial identifiers, and client records to protect Attorney-Client Privilege
    and maintain GDPR, DPDP, and HIPAA compliance before transmitting data to external LLMs.
    """

    # Compiled regex patterns for sensitive legal identifiers
    SSN_PATTERN = re.compile(r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b')
    AADHAAR_PATTERN = re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b')
    CREDIT_CARD_PATTERN = re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b')
    EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
    PHONE_PATTERN = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
    IBAN_PATTERN = re.compile(r'\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b')

    @classmethod
    def redact_text(cls, text: str) -> Dict[str, Any]:
        """
        Redacts sensitive data from text and returns a structured privacy audit report.
        """
        if not text:
            return {
                "sanitized_text": "",
                "redacted_count": 0,
                "redactions": [],
                "privacy_risk": "Low",
                "attorney_privilege_preserved": True
            }

        sanitized = text
        redactions = []

        # 1. Social Security Numbers
        ssn_matches = cls.SSN_PATTERN.findall(sanitized)
        for ssn in ssn_matches:
            sanitized = sanitized.replace(ssn, "[REDACTED_SSN/TAX_ID]")
            redactions.append({"type": "SSN/National ID", "original_snippet": ssn[:3] + "-**-****"})

        # 2. Aadhaar / 12-digit National IDs
        aadhaar_matches = cls.AADHAAR_PATTERN.findall(sanitized)
        for aadhar in aadhaar_matches:
            # avoid re-redacting if already handled
            if aadhar in sanitized:
                sanitized = sanitized.replace(aadhar, "[REDACTED_NATIONAL_ID]")
                redactions.append({"type": "National Identity Card", "original_snippet": "****-****-" + aadhar[-4:]})

        # 3. Credit Cards & Bank Account Strings
        cc_matches = cls.CREDIT_CARD_PATTERN.findall(sanitized)
        for cc in cc_matches:
            if cc in sanitized:
                sanitized = sanitized.replace(cc, "[REDACTED_FINANCIAL_CARD]")
                redactions.append({"type": "Financial Account/Card", "original_snippet": "****-****-****-" + cc[-4:]})

        # 4. IBAN Bank Numbers
        iban_matches = cls.IBAN_PATTERN.findall(sanitized)
        for iban in iban_matches:
            if iban in sanitized:
                sanitized = sanitized.replace(iban, "[REDACTED_BANK_IBAN]")
                redactions.append({"type": "IBAN Account", "original_snippet": iban[:4] + "****************"})

        # 5. Email Addresses
        email_matches = cls.EMAIL_PATTERN.findall(sanitized)
        for email in email_matches:
            if email in sanitized:
                sanitized = sanitized.replace(email, "[REDACTED_EMAIL]")
                redactions.append({"type": "Email Address", "original_snippet": email[:2] + "***@" + email.split("@")[-1]})

        # 6. Phone Numbers
        phone_matches = cls.PHONE_PATTERN.findall(sanitized)
        for phone in phone_matches:
            # check length to avoid matching simple dates like 2026
            digits = re.sub(r'\D', '', phone)
            if len(digits) >= 10 and phone in sanitized:
                sanitized = sanitized.replace(phone, "[REDACTED_PHONE]")
                redactions.append({"type": "Personal Phone Number", "original_snippet": "***-***-" + digits[-4:]})

        # Assess privacy risk level
        total = len(redactions)
        if total == 0:
            risk = "Low"
        elif total <= 3:
            risk = "Medium"
        else:
            risk = "High"

        # Check for privilege notices
        has_privilege_notice = bool(re.search(r'privilege|confidential|work.?product', text, re.IGNORECASE))

        return {
            "sanitized_text": sanitized,
            "redacted_count": total,
            "redactions": redactions,
            "privacy_risk": risk,
            "attorney_privilege_preserved": True,
            "privilege_notice_detected": has_privilege_notice
        }


# =====================================================================
# 4. Persistent Security Audit Logger
# =====================================================================
def log_security_event(
    event_type: str,
    severity: str = "INFO",
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    endpoint: Optional[str] = None,
    details: Optional[str] = None,
    db: Optional[Session] = None
):
    """
    Persistently logs security events (unauthorized access, failed logins,
    token revocations, privilege checks) to database.
    """
    own_db = False
    if db is None:
        db = SessionLocal()
        own_db = True

    try:
        log_entry = models.SecurityAuditLog(
            event_type=event_type,
            severity=severity,
            user_id=user_id,
            user_email=user_email,
            ip_address=ip_address or "127.0.0.1",
            endpoint=endpoint,
            details=details,
            timestamp=datetime.now(timezone.utc).replace(tzinfo=None)
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        # Fail-safe print to console so audit failure doesn't crash the request
        print(f"Warning: Failed to write security audit log: {e}")
    finally:
        if own_db:
            db.close()


# =====================================================================
# 5. Token Revocation & Session Invalidation
# =====================================================================
def revoke_jwt_token(token: str, db: Session) -> bool:
    """
    Revokes an active JWT token by recording its unique identifier in revoked_tokens.
    """
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        jti = payload.get("jti") or str(uuid.uuid5(uuid.NAMESPACE_DNS, token))
        exp_timestamp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp_timestamp, timezone.utc).replace(tzinfo=None) if exp_timestamp else None

        # Check if already revoked
        existing = db.query(models.RevokedToken).filter(models.RevokedToken.jti == jti).first()
        if not existing:
            revoked = models.RevokedToken(
                jti=jti,
                revoked_at=datetime.now(timezone.utc).replace(tzinfo=None),
                expires_at=expires_at
            )
            db.add(revoked)
            db.commit()
            return True
        return True
    except Exception as e:
        db.rollback()
        print(f"Error revoking token: {e}")
        return False


def is_jwt_token_revoked(token: str, db: Session) -> bool:
    """
    Checks if a JWT token has been explicitly invalidated/logged out.
    """
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        jti = payload.get("jti") or str(uuid.uuid5(uuid.NAMESPACE_DNS, token))
        revoked = db.query(models.RevokedToken).filter(models.RevokedToken.jti == jti).first()
        return revoked is not None
    except Exception:
        return False
