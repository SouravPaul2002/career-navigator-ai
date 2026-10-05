import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

async def init_db():
    client = AsyncIOMotorClient(MONGODB_URI)
    # Import models here to avoid circular imports during startup
    from models import User, UserRoadmap, InterviewSession, ResumeAnalysis, UserRoadmapStep
    
    # Note: UserRoadmapStep is a Pydantic model (embedded), not a Document, so it doesn't need to be in document_models list unless it's a root Document.
    # checking models.py... UserRoadmapStep is BaseModel now, so good.
    
    await init_beanie(
        database=client.career_navigator,
        document_models=[
            User,
            UserRoadmap,
            InterviewSession,
            ResumeAnalysis
        ]
    )

