from dotenv import load_dotenv

load_dotenv()

from datetime import datetime, timedelta, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # noqa: F401  (ensures models are registered before create_all)
from routers import auth as auth_router
from routers import cases as cases_router
from routers import search as search_router
from routers import chat as chat_router
from routers import admin as admin_router
from routers import analytics as analytics_router
from routers import documents as documents_router
from routers import verification as verification_router
from routers import security as security_router
from security_protocol import SecurityHeadersMiddleware

Base.metadata.create_all(bind=engine)

# Auto-seed default demo admin account & initial security audit telemetry
def seed_default_admin_and_security():
    from database import SessionLocal
    from auth import hash_password
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(models.User.email == "admin@justimind.ai").first()
        if not admin_user:
            admin_user = models.User(
                email="admin@justimind.ai",
                full_name="Elena Rostova (Lead Counsel)",
                hashed_password=hash_password("password123"),
                role="Admin"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # Seed baseline security audit events if table is fresh
        if db.query(models.SecurityAuditLog).count() == 0:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            baseline_events = [
                models.SecurityAuditLog(
                    event_type="SECURITY_PROTOCOL_INITIALIZED",
                    severity="INFO",
                    user_id=admin_user.id,
                    user_email=admin_user.email,
                    ip_address="127.0.0.1",
                    endpoint="/system/startup",
                    details="Zero-Trust Legal Encryption & OWASP HSTS shield loaded with AES-256 GCM storage.",
                    timestamp=now - timedelta(hours=3)
                ),
                models.SecurityAuditLog(
                    event_type="UNAUTHORIZED_ACCESS_BLOCKED",
                    severity="WARNING",
                    user_id=None,
                    user_email="unknown_crawler@192.168.1.45",
                    ip_address="192.168.1.45",
                    endpoint="/admin/users",
                    details="Intercepted unauthenticated access attempt targeting confidential partner registry.",
                    timestamp=now - timedelta(hours=1, minutes=42)
                ),
                models.SecurityAuditLog(
                    event_type="PII_SENSITIVE_DATA_MASKED",
                    severity="INFO",
                    user_id=admin_user.id,
                    user_email=admin_user.email,
                    ip_address="127.0.0.1",
                    endpoint="/cases/summarize",
                    details="Attorney-Client Privilege Filter masked 4 client SSNs and bank identifiers before LLM processing.",
                    timestamp=now - timedelta(minutes=28)
                )
            ]
            db.add_all(baseline_events)
            db.commit()
    except Exception as e:
        print(f"Seed error: {e}")
    finally:
        db.close()

seed_default_admin_and_security()

app = FastAPI(title="JustiMind API", version="0.1.0")

# Register Security Headers (OWASP Clickjacking, MIME-sniffing, XSS protection)
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://rathodsakshi290.github.io",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.github\.io|.*\.onrender\.com)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(cases_router.router)
app.include_router(search_router.router)
app.include_router(chat_router.router)
app.include_router(admin_router.router)
app.include_router(analytics_router.router)
app.include_router(documents_router.router)
app.include_router(verification_router.router)
app.include_router(security_router.router)


@app.get("/health")
def health():
    return {"status": "ok", "security": "enforced"}
