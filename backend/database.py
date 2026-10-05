import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

async def init_db():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(uri)
    if hasattr(client, "delegate") and hasattr(client.delegate, "append_metadata"):
        client.append_metadata = client.delegate.append_metadata
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

