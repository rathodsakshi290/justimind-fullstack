from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from z3_verifier import verifier

router = APIRouter(prefix="/verification", tags=["verification"])


@router.get("/benchmarks")
def get_benchmarks():
    """Return pre-configured legal verification benchmarks."""
    return verifier.get_benchmarks()


@router.post("/verify-text", response_model=schemas.VerificationResponse)
def verify_text(
    payload: schemas.VerificationRequest,
    current_user: models.User = Depends(get_current_user),
):
    """
    Formally verifies contract clauses, evidence chains, or statutory rules
    using Microsoft Z3 Theorem Prover.
    """
    result = verifier.run_verification(
        title=payload.title,
        text=payload.text,
        domain=payload.domain,
        params=payload.params
    )
    return result


@router.post("/verify-case/{case_id}", response_model=schemas.VerificationResponse)
def verify_case(
    case_id: int,
    domain: str = "evidence_chain",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Formally verify evidence chain and statutory requirements for a stored Case.
    """
    case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id, models.Case.owner_id == current_user.id)
        .first()
    )
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    result = verifier.run_verification(
        title=case.title,
        text=case.raw_text,
        domain=domain,
        params=None
    )
    return result


@router.post("/verify-document/{doc_id}", response_model=schemas.VerificationResponse)
def verify_document(
    doc_id: int,
    domain: str = "contract_consistency",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Formally verify contractual consistency and clause harmony for an analyzed Document.
    """
    doc = (
        db.query(models.Document)
        .filter(models.Document.id == doc_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result = verifier.run_verification(
        title=doc.title,
        text=doc.raw_text,
        domain=domain,
        params=None
    )
    return result


@router.post("/solve-what-if")
def solve_what_if(
    payload: schemas.WhatIfRequest,
    current_user: models.User = Depends(get_current_user),
):
    """
    Computes mathematical parameter boundaries to resolve contradictions.
    """
    solution = verifier.solve_what_if_bounds(
        domain=payload.domain,
        current_params=payload.current_params,
        target_param=payload.target_param
    )
    return solution
