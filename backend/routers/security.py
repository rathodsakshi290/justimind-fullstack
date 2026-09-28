from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import get_db
from auth import get_current_user, oauth2_scheme
from security_protocol import (
    PrivacyRedactionEngine,
    log_security_event,
    revoke_jwt_token,
    rate_limiter
)

router = APIRouter(prefix="/security", tags=["security"])


class RedactionRequest(BaseModel):
    text: str
    detect_privilege_notice: Optional[bool] = True


class RedactionResponse(BaseModel):
    sanitized_text: str
    redacted_count: int
    redactions: List[Dict[str, Any]]
    privacy_risk: str
    attorney_privilege_preserved: bool
    privilege_notice_detected: bool


class AuditLogOut(BaseModel):
    id: int
    timestamp: str
    event_type: str
    severity: str
    user_email: Optional[str] = None
    ip_address: Optional[str] = None
    endpoint: Optional[str] = None
    details: Optional[str] = None


@router.get("/status")
def get_security_posture(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns active zero-trust security controls, encryption posture,
    and privacy compliance layers safeguarding attorney-client confidentiality.
    """
    total_blocked = db.query(models.SecurityAuditLog).filter(
        models.SecurityAuditLog.severity.in_(["WARNING", "CRITICAL"])
    ).count()

    revoked_count = db.query(models.RevokedToken).count()

    client_ip = request.client.host if request.client else "127.0.0.1"

    return {
        "security_tier": "Zero-Trust Enterprise Legal Shield",
        "protocols": {
            "encryption_at_rest": "AES-256 GCM (Encrypted Sqlite/PostgreSQL Storage)",
            "encryption_in_transit": "TLS 1.3 / Strict HTTPS with HSTS Preload",
            "owasp_headers": "Active (CSP, X-Frame-Options DENY, nosniff, Referrer-Policy)",
            "token_specification": "Cryptographic JWT with JTI Nonce & Ephemeral Expiration",
            "brute_force_shield": "Sliding-Window IP Rate Limiter Active (5 attempts max)",
            "legal_pii_redactor": "Active (SSN, National IDs, Cards, IBAN, Phone, Email)",
            "audit_telemetry": "Active Persistent Append-Only Security Event Log"
        },
        "session": {
            "authenticated_as": current_user.email,
            "role": current_user.role,
            "client_ip": client_ip,
            "total_revoked_sessions": revoked_count,
            "total_blocked_intrusions": total_blocked
        }
    }


@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves recent security events and unauthorized access alerts.
    Admin users see all events across the firm; associates see their own session events.
    """
    query = db.query(models.SecurityAuditLog)
    if current_user.role != "Admin":
        query = query.filter(
            (models.SecurityAuditLog.user_id == current_user.id) |
            (models.SecurityAuditLog.user_email == current_user.email)
        )

    logs = query.order_by(models.SecurityAuditLog.timestamp.desc()).limit(limit).all()

    return [
        AuditLogOut(
            id=log.id,
            timestamp=log.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
            event_type=log.event_type,
            severity=log.severity,
            user_email=log.user_email or "Anonymous / Unauthenticated",
            ip_address=log.ip_address or "127.0.0.1",
            endpoint=log.endpoint or "N/A",
            details=log.details or ""
        )
        for log in logs
    ]


@router.post("/redact", response_model=RedactionResponse)
def redact_sensitive_pii(
    payload: RedactionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Sanitizes raw legal pleadings, contracts, or discovery documents by stripping
    confidential PII, national identification numbers, bank cards, and phone numbers.
    """
    result = PrivacyRedactionEngine.redact_text(payload.text)

    client_ip = request.client.host if request.client else "127.0.0.1"
    if result["redacted_count"] > 0:
        log_security_event(
            event_type="PII_SENSITIVE_DATA_MASKED",
            severity="INFO",
            user_id=current_user.id,
            user_email=current_user.email,
            ip_address=client_ip,
            endpoint=str(request.url.path),
            details=f"Masked {result['redacted_count']} sensitive identifiers under Attorney-Client Privilege protocol.",
            db=db
        )

    return result


@router.post("/simulate-unauthorized-attempt")
def simulate_unauthorized_attempt(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Diagnostic endpoint allowing security administrators to test and verify
    the intrusion detection and security logging mechanisms in real time.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    log_security_event(
        event_type="UNAUTHORIZED_ACCESS_BLOCKED",
        severity="WARNING",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
        endpoint="/api/v1/restricted/vault-access",
        details="Simulated unauthorized credential escalation blocked by Zero-Trust Access Controller.",
        db=db
    )
    return {
        "status": "blocked",
        "message": "Security Alert Triggered: Unauthorized access attempt intercepted and logged to immutable audit ledger.",
        "recorded_event": "UNAUTHORIZED_ACCESS_BLOCKED",
        "severity": "WARNING"
    }


@router.post("/logout")
def logout_session(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Explicitly revokes and invalidates the caller's JWT token, preventing
    token replay or session hijacking after logout.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    revoked = revoke_jwt_token(token, db)

    log_security_event(
        event_type="LOGOUT_TOKEN_REVOKED",
        severity="INFO",
        user_id=current_user.id,
        user_email=current_user.email,
        ip_address=client_ip,
        endpoint=str(request.url.path),
        details=f"User {current_user.email} terminated session. JWT invalidated globally.",
        db=db
    )

    return {
        "status": "success",
        "message": "Token successfully revoked. Session terminated.",
        "token_revoked": revoked
    }
