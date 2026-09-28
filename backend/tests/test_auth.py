"""
Run with: pytest (from the backend/ directory)

Uses a separate SQLite file (test.db) so it never touches your real database.
"""
import os
import sys

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ.setdefault("JWT_SECRET", "test-secret")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from database import Base, engine
from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_signup_login_and_me():
    signup_resp = client.post(
        "/auth/signup",
        json={"email": "test.user@example.com", "password": "supersecret123", "full_name": "Test User"},
    )
    assert signup_resp.status_code == 200
    assert "access_token" in signup_resp.json()

    # Duplicate signup should fail
    dup_resp = client.post(
        "/auth/signup",
        json={"email": "test.user@example.com", "password": "supersecret123", "full_name": "Test User"},
    )
    assert dup_resp.status_code == 400

    login_resp = client.post(
        "/auth/login",
        json={"email": "test.user@example.com", "password": "supersecret123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "test.user@example.com"


def test_login_with_wrong_password_fails():
    resp = client.post(
        "/auth/login",
        json={"email": "test.user@example.com", "password": "wrong-password"},
    )
    assert resp.status_code == 401


def test_me_requires_auth():
    resp = client.get("/auth/me")
    assert resp.status_code == 401
