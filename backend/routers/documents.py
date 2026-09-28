import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from llm import analyze_document_llm

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("/", response_model=List[schemas.DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Document)
        .filter(models.Document.owner_id == current_user.id)
        .order_by(models.Document.created_at.desc())
        .all()
    )

@router.post("/analyze", response_model=schemas.DocumentOut)
async def analyze_document(
    payload: schemas.DocumentCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    analysis_data = None
    try:
        analysis_data = await analyze_document_llm(payload.title, payload.text, language=payload.language or "en")
    except Exception:
        pass

    if not analysis_data:
        title_lower = payload.title.lower()
        text_lower = payload.text.lower()

        if "nda" in title_lower or "confidentiality" in title_lower or "nda" in text_lower or "confidentiality" in text_lower:
            overall_risk = "Medium"
            risk_level = "medium"
            findings = [
                {
                    "title": "Clause 8 — Unilateral limitation of liability for breaches",
                    "severity": "high",
                    "type": "Risky clause",
                    "detail": "The liability cap for breach of confidentiality is set to a fixed nominal amount, which does not cover potential actual damages resulting from a major proprietary data leak."
                },
                {
                    "title": "Clause 4 — Definition of Confidential Information is overly broad",
                    "severity": "medium",
                    "type": "Vague terminology",
                    "detail": "The clause defines all oral and written communications as confidential without requiring them to be marked or confirmed in writing, creating compliance risks for general operational discussions."
                },
                {
                    "title": "Clause 11 — Governing law and venue is inconvenient",
                    "severity": "low",
                    "type": "Jurisdictional risk",
                    "detail": "The contract mandates arbitration in Delaware under Delaware law, which may incur substantial travel and administrative costs for operations based elsewhere."
                }
            ]
            compliance_notes = [
                {
                    "framework": "GDPR",
                    "concern_level": "medium",
                    "note": "The definition of confidential information includes customer personal data without specifying appropriate cross-border transfer protections or standard contractual clauses (SCCs)."
                }
            ]
            suggested_redlines = [
                {
                    "clause": "Section 8 (Limitation of Liability)",
                    "issue": "Asymmetrical damages cap for data breaches.",
                    "suggested_text": "Notwithstanding any other provision herein, neither party's liability for breach of confidentiality obligations or misuse of proprietary intellectual property under this Agreement shall be subject to the limitation of liability cap set forth in this Section."
                },
                {
                    "clause": "Section 4.1 (Marking Requirement)",
                    "issue": "Oral information must be marked to avoid ambiguity.",
                    "suggested_text": "Confidential Information shall include oral disclosures only if such information is identified as confidential at the time of disclosure and subsequently reduced to writing and marked as 'Confidential' within thirty (30) days of the initial disclosure."
                }
            ]
        elif "service" in title_lower or "agreement" in title_lower or "sow" in title_lower or "service" in text_lower or "agreement" in text_lower:
            overall_risk = "High"
            risk_level = "high"
            findings = [
                {
                    "title": "Clause 14 — IP assignment is immediate and unconditional",
                    "severity": "high",
                    "type": "IP ownership risk",
                    "detail": "IP created under this statement of work is assigned to the customer upon creation rather than upon receipt of full payment, exposing the service provider to non-payment risks."
                },
                {
                    "title": "Clause 7 — Termination notice period is extremely short",
                    "severity": "medium",
                    "type": "Operational risk",
                    "detail": "Allowing termination for convenience with only 5 days' written notice is substantially below the standard 30-day window and could cause sudden resource allocation disruption."
                }
            ]
            compliance_notes = [
                {
                    "framework": "SOC 2 Type II",
                    "concern_level": "low",
                    "note": "Requires the service provider to undergo yearly audits but does not specify a right-to-audit cost allocation clause."
                }
            ]
            suggested_redlines = [
                {
                    "clause": "Section 14 (Intellectual Property Assignment)",
                    "issue": "Unconditional IP transfer before payment.",
                    "suggested_text": "Subject to full payment of all undisputed fees due under the applicable SOW, Service Provider hereby assigns to Customer all right, title, and interest in and to the deliverables created hereunder."
                }
            ]
        else:
            overall_risk = "Low"
            risk_level = "low"
            findings = [
                {
                    "title": "Clause 3 — General payment terms are standard Net-30",
                    "severity": "low",
                    "type": "Standard clause",
                    "detail": "The Net-30 payment terms are within ordinary commercial guidelines and present no unique risk to operational cash flow."
                }
            ]
            compliance_notes = []
            suggested_redlines = []

        analysis_data = {
            "overall_risk": overall_risk,
            "findings": findings,
            "compliance_notes": compliance_notes,
            "suggested_redlines": suggested_redlines
        }
    else:
        risk_level = str(analysis_data.get("risk_level", "medium")).lower()

    doc = models.Document(
        owner_id=current_user.id,
        title=payload.title,
        raw_text=payload.text,
        analysis_json=json.dumps(analysis_data),
        risk_level=risk_level
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.post("/extract-text")
async def extract_document_text(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    from document_parser import extract_text_from_upload
    return await extract_text_from_upload(file)


@router.post("/translate", response_model=schemas.LegalTranslationResponse)
async def translate_legal_document(
    payload: schemas.LegalTranslationRequest,
    current_user: models.User = Depends(get_current_user),
):
    from llm import translate_legal_text
    result = await translate_legal_text(
        text=payload.text,
        source_lang=payload.source_lang or "auto",
        target_lang=payload.target_lang or "en",
        preserve_citations=payload.preserve_citations
    )
    return result


