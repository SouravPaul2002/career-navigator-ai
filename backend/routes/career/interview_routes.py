from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime

from auth import get_current_user
from models import User, InterviewSession, InterviewMessage
from interview_agent import generate_interview_response
from pydantic import BaseModel

router = APIRouter()

class SessionStartRequest(BaseModel):
    job_role: str

class ChatRequest(BaseModel):
    message: str

class MessageRead(BaseModel):
    sender: str
    content: str
    timestamp: datetime

class SessionRead(BaseModel):
    id: str
    job_role: str
    created_at: datetime
    is_active: bool

@router.post("/sessions", response_model=SessionRead)
async def start_session(
    request: SessionStartRequest,
    current_user: User = Depends(get_current_user)
):
    """Start a new interview session."""
    # Deactivate any previous active sessions for this user (optional)
    # await InterviewSession.find(InterviewSession.user_id == str(current_user.id)).set({InterviewSession.is_active: False})
    
    greeting_text = f"Hello! I see you're applying for the {request.job_role} position. Let's start with a brief introduction about yourself."
    initial_message = InterviewMessage(
        sender="ai",
        content=greeting_text
    )

    new_session = InterviewSession(
        user_id=str(current_user.id),
        job_role=request.job_role,
        messages=[initial_message]
    )
    await new_session.insert()
    
    return SessionRead(
        id=str(new_session.id),
        job_role=new_session.job_role,
        created_at=new_session.created_at,
        is_active=new_session.is_active
    )

@router.get("/sessions", response_model=List[SessionRead])
async def get_sessions(
    current_user: User = Depends(get_current_user)
):
    """Get all interview sessions for the current user."""
    sessions = await InterviewSession.find(InterviewSession.user_id == str(current_user.id)).sort("-created_at").to_list()
    return [
        SessionRead(
            id=str(s.id),
            job_role=s.job_role,
            created_at=s.created_at,
            is_active=s.is_active
        ) for s in sessions
    ]

@router.get("/sessions/{session_id}/messages", response_model=List[MessageRead])
async def get_messages(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get chat history for a specific session."""
    session = await InterviewSession.find_one(InterviewSession.id == session_id if len(session_id) == 24 else None)
    if not session:
        session = await InterviewSession.get(session_id)

    if not session or session.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Session not found")
        
    return session.messages

@router.post("/sessions/{session_id}/chat", response_model=MessageRead)
async def chat(
    session_id: str,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message to the interviewer and get a response."""
    # Verify session
    session = await InterviewSession.find_one(InterviewSession.id == session_id if len(session_id) == 24 else None)
    if not session:
         session = await InterviewSession.get(session_id)

    if not session or session.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_active:
         raise HTTPException(status_code=400, detail="This interview session has ended.")

    # 1. Save User Message
    user_msg = InterviewMessage(
        sender="user",
        content=chat_request.message
    )
    session.messages.append(user_msg)
    
    # 2. Context for AI
    history_dicts = [{"sender": msg.sender, "content": msg.content} for msg in session.messages]
    
    # 3. Generate AI Response
    ai_response_text = generate_interview_response(session.job_role, history_dicts)
    
    # 4. Save AI Response
    ai_msg = InterviewMessage(
        sender="ai",
        content=ai_response_text
    )
    session.messages.append(ai_msg)
    
    await session.save()
    
    return MessageRead(
        sender=ai_msg.sender,
        content=ai_msg.content,
        timestamp=ai_msg.timestamp
    )

