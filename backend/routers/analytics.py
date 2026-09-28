from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/me")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Total counts
    total_cases = db.query(models.Case).filter(models.Case.owner_id == current_user.id).count()
    total_documents = db.query(models.Document).filter(models.Document.owner_id == current_user.id).count()
    total_chat_messages = db.query(models.ChatMessage).filter(models.ChatMessage.owner_id == current_user.id).count()

    # Average confidence score
    avg_confidence = db.query(func.avg(models.Case.confidence)).filter(
        models.Case.owner_id == current_user.id
    ).scalar()
    
    if avg_confidence is not None:
        avg_confidence = float(avg_confidence)
    else:
        avg_confidence = 0.0

    # Cases by month (chronological order of cases)
    cases = (
        db.query(models.Case)
        .filter(models.Case.owner_id == current_user.id)
        .order_by(models.Case.created_at.asc())
        .all()
    )
    
    # We aggregate counts by (year, month_num, month_name)
    monthly_data = defaultdict(int)
    for c in cases:
        key = (c.created_at.year, c.created_at.month, c.created_at.strftime("%b"))
        monthly_data[key] += 1
        
    sorted_months = sorted(monthly_data.keys(), key=lambda x: (x[0], x[1]))
    cases_by_month = [{"month": key[2], "count": monthly_data[key]} for key in sorted_months]
    
    # Default fallback if there are no cases, so the chart looks nice or shows empty structure
    if not cases_by_month:
        cases_by_month = []

    # Risk distribution
    docs = db.query(models.Document).filter(models.Document.owner_id == current_user.id).all()
    risk_counts = {"Low": 0, "Medium": 0, "High": 0}
    for d in docs:
        risk = (d.risk_level or "Low").capitalize()
        if risk in risk_counts:
            risk_counts[risk] += 1
        else:
            risk_counts[risk] = 1
            
    risk_distribution = [{"risk": k, "count": v} for k, v in risk_counts.items()]

    return {
        "total_cases": total_cases,
        "total_documents": total_documents,
        "total_chat_messages": total_chat_messages,
        "average_confidence": avg_confidence,
        "cases_by_month": cases_by_month,
        "risk_distribution": risk_distribution
    }
