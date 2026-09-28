import os
import sys
import pytest
from unittest.mock import patch, AsyncMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import llm


def test_provider_selection():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key"}, clear=True):
        assert llm.get_active_provider() == "gemini"

    with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-anthropic-key"}, clear=True):
        assert llm.get_active_provider() == "anthropic"

    with patch.dict(os.environ, {}, clear=True):
        assert llm.get_active_provider() == "none"


def test_clean_json_string():
    raw_markdown = "```json\n{\"executive_summary\": \"Case summary\", \"confidence_score\": 90}\n```"
    cleaned = llm._clean_json_string(raw_markdown)
    assert cleaned == "{\"executive_summary\": \"Case summary\", \"confidence_score\": 90}"


@pytest.mark.anyio
async def test_gemini_summarize_mock():
    mock_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": '{"executive_summary": "Test Summary", "facts": ["Fact 1"], "issues": ["Issue 1"], "applicable_laws": ["Law 1"], "evidence": [], "timeline": [], "judgment_prediction": "Win", "pros": [], "cons": [], "risk_analysis": "Low", "recommendations": [], "confidence_score": 95}'
                        }
                    ],
                    "role": "model"
                }
            }
        ]
    }

    with patch.dict(os.environ, {"GEMINI_API_KEY": "dummy_key"}), \
         patch("httpx.AsyncClient.post") as mock_post:
        
        mock_post.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response,
            raise_for_status=lambda: None
        )
        
        summary = await llm.summarize_case("Some case text")
        assert summary["executive_summary"] == "Test Summary"
        assert summary["confidence_score"] == 95


@pytest.mark.anyio
async def test_gemini_chat_mock():
    mock_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "Hello! I am JustiMind, your legal assistant powered by Gemini."
                        }
                    ],
                    "role": "model"
                }
            }
        ]
    }

    with patch.dict(os.environ, {"GEMINI_API_KEY": "dummy_key"}), \
         patch("httpx.AsyncClient.post") as mock_post:
        
        mock_post.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response,
            raise_for_status=lambda: None
        )
        
        reply = await llm.send_chat_message("What is section 420?")
        assert "JustiMind" in reply
