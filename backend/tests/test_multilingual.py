import os
import sys
import pytest

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ.setdefault("JWT_SECRET", "test-secret")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
from models import User
import llm

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.mark.anyio
async def test_multilingual_summarize():
    raw_text = "The parties signed an agreement. Respondent defaulted on milestone 2."
    summary_es = await llm.summarize_case(raw_text, language="es")
    assert "executive_summary" in summary_es
    assert "confidence_score" in summary_es
    assert summary_es["confidence_score"] > 0


@pytest.mark.anyio
async def test_multilingual_chat():
    reply_es = await llm.send_chat_message("Revisión de contrato", language="es")
    assert "Inteligencia Jurídica" in reply_es or "Marco Normativo" in reply_es

    reply_hi = await llm.send_chat_message("चेक बाउंस मामला", language="hi")
    assert "विधिक विश्लेषण" in reply_hi

    reply_ar = await llm.send_chat_message("عقد تجاري", language="ar")
    assert "الذكاء القانوني" in reply_ar


@pytest.mark.anyio
async def test_legal_translation_clause():
    sample_clause = (
        "Vendor shall indemnify, defend, and hold harmless Client from any third-party claims "
        "under [[cite:Section 73 Contract Act]]."
    )
    result_es = await llm.translate_legal_text(sample_clause, source_lang="en", target_lang="es")
    assert "translated_text" in result_es
    assert result_es["target_lang"] == "es"
    # Verify citation preservation
    assert "[[cite:Section 73 Contract Act]]" in result_es["translated_text"]


def test_documents_translate_endpoint():
    # 1. Sign up user
    signup_res = client.post(
        "/auth/signup",
        json={"email": "translator@justimind.com", "password": "password123", "full_name": "Counsel Global"}
    )
    assert signup_res.status_code == 200
    token = signup_res.json()["access_token"]

    # 2. Call /documents/translate
    payload = {
        "text": "Each party shall maintain strict confidentiality of proprietary data under [[cite:Section 27]].",
        "source_lang": "en",
        "target_lang": "es",
        "preserve_citations": True
    }
    trans_res = client.post(
        "/documents/translate",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    assert trans_res.status_code == 200
    data = trans_res.json()
    assert "translated_text" in data
    assert data["target_lang"] == "es"
    assert "[[cite:Section 27]]" in data["translated_text"]
