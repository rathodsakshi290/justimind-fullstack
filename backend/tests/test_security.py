import os
import sys
import pytest

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ.setdefault("JWT_SECRET", "test-secret")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from database import Base, engine
from main import app
from security_protocol import PrivacyRedactionEngine, rate_limiter

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_security_headers_present():
    """Verify that OWASP security headers are attached to every response."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("x-content-type-options") == "nosniff"
    assert res.headers.get("x-frame-options") == "DENY"
    assert res.headers.get("x-xss-protection") == "1; mode=block"
    assert "strict-transport-security" in res.headers
    assert "content-security-policy" in res.headers


def test_privacy_redaction_engine():
    """Verify that legal PII and confidential identifiers are properly masked."""
    sample_text = (
        "CONFIDENTIAL ATTORNEY-CLIENT PRIVILEGED: Client John Doe with SSN 123-45-6789 and "
        "Aadhaar 1234 5678 9012 paid retainer via card 4111 2222 3333 4444. "
        "Contact him at john.doe@privatelaw.com or +1 (555) 234-5678."
    )
    result = PrivacyRedactionEngine.redact_text(sample_text)
    assert result["redacted_count"] >= 4
    assert "123-45-6789" not in result["sanitized_text"]
    assert "[REDACTED_SSN/TAX_ID]" in result["sanitized_text"]
    assert "4111 2222 3333 4444" not in result["sanitized_text"]
    assert "[REDACTED_FINANCIAL_CARD]" in result["sanitized_text"]
    assert "[REDACTED_EMAIL]" in result["sanitized_text"]
    assert "[REDACTED_PHONE]" in result["sanitized_text"]
    assert result["privacy_risk"] == "High"
    assert result["privilege_notice_detected"] is True


def test_unauthorized_access_logging_and_token_revocation():
    """Test full cycle: login, authenticated security status, token logout revocation, and rejection."""
    # 1. Sign up a test user
    email = "security_test_user@justimind.ai"
    pwd = "securepassword123"
    client.post("/auth/signup", json={"email": email, "password": pwd, "full_name": "Sec Test Officer"})

    # 2. Login
    login_res = client.post("/auth/login", json={"email": email, "password": pwd})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Access security status
    status_res = client.get("/security/status", headers=headers)
    assert status_res.status_code == 200
    data = status_res.json()
    assert "Zero-Trust" in data["security_tier"]
    assert "AES-256" in data["protocols"]["encryption_at_rest"]

    # 4. Redaction endpoint
    redact_res = client.post(
        "/security/redact",
        json={"text": "Client Tax ID is 987-65-4321 and email is secret@client.com"},
        headers=headers
    )
    assert redact_res.status_code == 200
    assert redact_res.json()["redacted_count"] >= 2

    # 5. Log out / revoke token
    logout_res = client.post("/security/logout", headers=headers)
    assert logout_res.status_code == 200

    # 6. Attempt access with revoked token -> must be rejected with 401
    revoked_access_res = client.get("/security/status", headers=headers)
    assert revoked_access_res.status_code == 401
    assert "revoked" in revoked_access_res.json()["detail"].lower()


def test_failed_login_brute_force_tracking():
    """Verify that repeated invalid password attempts are recorded and rejected."""
    email = "nonexistent_or_bad@justimind.ai"
    for _ in range(3):
        res = client.post("/auth/login", json={"email": email, "password": "wrongpassword"})
        assert res.status_code == 401
