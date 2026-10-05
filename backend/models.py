from enum import Enum
import re
from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId

class StepStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Za-z]", password):
        raise ValueError("Password must contain at least one letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one number")
    return password

# Shared properties
class UserBase(BaseModel):
    email: str
    name: Optional[str] = None

# Database model
class User(Document, UserBase):
    email: Indexed(str, unique=True) # type: ignore
    hashed_password: str
    
    class Settings:
        name = "users"

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)

# Properties to return via API
class UserRead(UserBase):
    id: str

    @field_validator("id", mode="before")
    @classmethod
    def parse_id(cls, v):
        return str(v)

# Properties to receive via API on update
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Resume Analysis Models
class ResumeAnalysis(Document):
    user_id: Indexed(str) # type: ignore
    filename: str
    analysis_data: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "resume_analyses"

# Interview Models
class InterviewMessage(BaseModel):
    sender: str  # "user" or "ai"
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InterviewSession(Document):
    user_id: Indexed(str) # type: ignore
    job_role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    messages: List[InterviewMessage] = []

    class Settings:
        name = "interview_sessions"

# Career Roadmap Models
class UserRoadmapStep(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: str
    estimated_duration: str
    status: StepStatus = StepStatus.TODO
    order_index: int

class UserRoadmap(Document):
    user_id: Indexed(str) # type: ignore
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    steps: List[UserRoadmapStep] = []

    class Settings:
        name = "user_roadmaps"

