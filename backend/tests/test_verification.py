import os
import sys
import pytest

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ.setdefault("JWT_SECRET", "test-secret")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from database import Base, engine
from main import app
from z3_verifier import verifier

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_z3_contract_contradiction():
    """Verify that Z3 identifies liability cap vs uncapped indemnity as UNSAT."""
    result = verifier.verify_contract_consistency(
        title="TechVanguard MSA",
        text="Clause 8.1 Vendor shall unconditionally defend, indemnify Client from all claims. Clause 8.2 Total liability shall not exceed $1,000.",
        params={"has_unconditional_indemnity": True, "has_strict_cap": True, "cap_amount": 1000}
    )
    assert result["status"] == "UNSATISFIABLE"
    assert result["is_consistent"] is False
    assert len(result["unsat_core"]) > 0
    assert "RULE_LIABILITY_CAP" in result["unsat_core"]
    assert len(result["remedy_recommendations"]) > 0
    assert result["smt_lib_code"] is not None


def test_z3_contract_consistent():
    """Verify that Z3 identifies a well-formed contract as SATISFIABLE."""
    result = verifier.verify_contract_consistency(
        title="Standard Commercial Contract",
        text="Invoice payment within 30 days. No special indemnity clauses.",
        params={"has_unconditional_indemnity": False, "has_strict_cap": False, "mandatory_cure_days": 0}
    )
    assert result["status"] == "SATISFIABLE"
    assert result["is_consistent"] is True
    assert len(result["unsat_core"]) == 0
    assert result["satisfying_model"] is not None


def test_z3_limitation_act():
    """Verify that Z3 marks a 1506-day-old claim as time-barred under 1095-day limitation."""
    result = verifier.verify_statutory_compliance(
        statute_type="limitation_period",
        params={"cause_of_action_days_ago": 1506, "statutory_limitation_days": 1095, "has_written_acknowledgment": False}
    )
    assert result["status"] == "UNSATISFIABLE"
    assert result["is_consistent"] is False
    assert any("time-barred" in r.lower() for r in result["remedy_recommendations"])


def test_z3_evidence_chain():
    """Verify that Ferreira v. State circumstantial evidence recovery from public park is UNSAT."""
    result = verifier.verify_evidence_chain(
        case_title="Ferreira v. State",
        params={
            "is_public_location": True,
            "recovery_delay_days": 3,
            "has_forensic_dna_or_fingerprint": False,
            "contemporaneous_hash_logged": False,
            "exclusive_possession_proven": False
        }
    )
    assert result["status"] == "UNSATISFIABLE"
    assert result["is_consistent"] is False
    assert len(result["unsat_core"]) > 0
    assert any(k in result["unsat_core"] for k in ["PRECEDENT_COMPLETE_CHAIN_MANDATE", "FACT_FORENSIC_LINK_ESTABLISHED", "PRECEDENT_PUBLIC_PLACE_EXCEPTION"])


def test_z3_what_if_bounds():
    """Verify that Z3 optimizer solves the minimal notice period required for cure period harmony."""
    solution = verifier.solve_what_if_bounds(
        domain="contract_consistency",
        current_params={"mandatory_cure_days": 30, "termination_notice_days": 5},
        target_param="termination_notice_days"
    )
    assert solution["target_param"] == "termination_notice_days"
    assert solution["recommended_value"] == 30
    assert "termination_notice_days >= 30" in solution["condition"]


def test_verification_api_endpoints():
    """Test the HTTP endpoints for verification benchmarks, verify-text, and solve-what-if."""
    # 1. Benchmarks endpoint (public)
    res = client.get("/verification/benchmarks")
    assert res.status_code == 200
    benchmarks = res.json()
    assert len(benchmarks) >= 4

    # 2. Get JWT token
    auth_res = client.post(
        "/auth/signup",
        json={"email": "z3_test@example.com", "password": "password123", "full_name": "SMT Tester"}
    )
    if auth_res.status_code == 200:
        token = auth_res.json()["access_token"]
    else:
        login_res = client.post(
            "/auth/login",
            json={"email": "z3_test@example.com", "password": "password123"}
        )
        token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Post to verify-text
    verify_res = client.post(
        "/verification/verify-text",
        headers=headers,
        json={
            "title": "Benchmark Contract",
            "text": "Clause 8.1 Unconditional indemnity. Clause 8.2 Total liability shall not exceed $1,000.",
            "domain": "contract_consistency",
            "params": {"has_unconditional_indemnity": True, "has_strict_cap": True, "cap_amount": 1000}
        }
    )
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["status"] == "UNSATISFIABLE"
    assert data["is_consistent"] is False
    assert len(data["unsat_core"]) > 0

    # 4. Post to solve-what-if
    what_if_res = client.post(
        "/verification/solve-what-if",
        headers=headers,
        json={
            "domain": "contract_consistency",
            "current_params": {"mandatory_cure_days": 45},
            "target_param": "termination_notice_days"
        }
    )
    assert what_if_res.status_code == 200
    sol = what_if_res.json()
    assert sol["recommended_value"] == 45
