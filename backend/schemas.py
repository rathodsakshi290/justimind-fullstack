from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime



class CaseCreateRequest(BaseModel):
    title: str
    text: str
    language: Optional[str] = "en"


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    summary_json: Optional[str] = None
    prediction_json: Optional[str] = None
    confidence: Optional[int] = None
    created_at: datetime


class DocumentCreateRequest(BaseModel):
    title: str
    text: str
    language: Optional[str] = "en"


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    analysis_json: Optional[str] = None
    risk_level: Optional[str] = None
    created_at: datetime


class LegalTranslationRequest(BaseModel):
    text: str
    source_lang: Optional[str] = "auto"
    target_lang: str = "en"
    preserve_citations: Optional[bool] = True


class LegalTranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str
    detected_citations: List[str] = []
    jurisdiction_notes: Optional[str] = None


class VerificationRequest(BaseModel):
    title: str
    text: str
    domain: str = "auto"
    params: Optional[dict] = None


class EvaluatedRule(BaseModel):
    id: str
    name: str
    expression: str
    description: str
    status: str = "Active"


class VerificationResponse(BaseModel):
    status: str
    is_consistent: bool
    domain: str
    summary: str
    unsat_core: List[str] = []
    satisfying_model: Optional[dict] = None
    constraints_evaluated: List[EvaluatedRule] = []
    remedy_recommendations: List[str] = []
    smt_lib_code: Optional[str] = None
    execution_time_ms: float


class WhatIfRequest(BaseModel):
    domain: str = "contract_consistency"
    current_params: dict
    target_param: str

