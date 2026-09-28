from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_current_user
from database import get_db
import models
import schemas
import llm

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/history")
async def get_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.owner_id == current_user.id
    ).order_by(models.ChatMessage.created_at.asc()).all()
    
    if not messages:
        welcome_msg = models.ChatMessage(
            owner_id=current_user.id,
            role="assistant",
            content="Welcome to your JustiMind AI Workspace. Ask me any question about legal drafts, statutes, or precedent cases.",
            created_at=datetime.utcnow()
        )
        db.add(welcome_msg)
        db.commit()
        db.refresh(welcome_msg)
        messages = [welcome_msg]

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat()
        } for m in messages
    ]

@router.post("/send")
async def send_message(
    payload: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_content = payload.get("message", "").strip()
    if not user_content:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    user_msg = models.ChatMessage(
        owner_id=current_user.id,
        role="user",
        content=user_content
    )
    db.add(user_msg)
    db.commit()

    history_records = db.query(models.ChatMessage).filter(
        models.ChatMessage.owner_id == current_user.id
    ).order_by(models.ChatMessage.created_at.asc()).all()
    
    history_data = [{"role": m.role, "content": m.content} for m in history_records[:-1]]

    language = payload.get("language", "en")

    try:
        reply_content = await llm.send_chat_message(user_content, history_data, language=language)
    except llm.LLMNotConfiguredError as e:
        reply_content = f"I received your question: '{user_content}'. Note: GEMINI_API_KEY is not set in backend/.env. Please configure your Google Gemini API key (from https://aistudio.google.com/) in backend/.env to receive live AI responses."
    except Exception as e:
        reply_content = f"An error occurred while contacting the Gemini AI service: {str(e)}"

    assistant_msg = models.ChatMessage(
        owner_id=current_user.id,
        role="assistant",
        content=reply_content
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return {
        "id": assistant_msg.id,
        "role": assistant_msg.role,
        "content": assistant_msg.content,
        "created_at": assistant_msg.created_at.isoformat()
    }

@router.delete("/history")
async def clear_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.ChatMessage).filter(
        models.ChatMessage.owner_id == current_user.id
    ).delete()
    db.commit()
    return {"status": "success"}
