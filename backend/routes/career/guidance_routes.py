from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from auth import get_current_user
from models import User, UserRoadmap, UserRoadmapStep
from guidance_agent import generate_roadmap, get_topic_details, generate_quiz
from ai_schema.schema import CareerRoadmap

router = APIRouter()

class RoadmapRequest(BaseModel):
    job_role: str

class TopicRequest(BaseModel):
    topic: str
    role: str = "General"

class QuizRequest(BaseModel):
    topic: str

class StepStatusUpdate(BaseModel):
    status: str # todo, in_progress, done

class UserRoadmapRead(BaseModel):
    id: str
    role: str
    steps: List[dict]

@router.post("/generate", response_model=CareerRoadmap)
async def generate_career_roadmap_endpoint(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user)
):
    if not request.job_role.strip():
        raise HTTPException(status_code=400, detail="Job role cannot be empty.")
    roadmap = generate_roadmap(request.job_role)
    if not roadmap:
        raise HTTPException(status_code=500, detail="Failed to generate roadmap.")
    return roadmap

@router.post("/save")
async def save_roadmap(
    roadmap_data: CareerRoadmap,
    current_user: User = Depends(get_current_user)
):
    """Save a generated roadmap as the active roadmap for the user."""
    # Deactivate existing roadmaps
    await UserRoadmap.find(UserRoadmap.user_id == str(current_user.id)).set({UserRoadmap.is_active: False})
    
    # Create steps
    steps_objects = []
    for idx, step in enumerate(roadmap_data.steps):
        steps_objects.append(UserRoadmapStep(
            title=step.step_title,
            description=step.description,
            estimated_duration=step.estimated_duration,
            status="todo",
            order_index=idx
        ))

    # Create new roadmap
    new_roadmap = UserRoadmap(
        user_id=str(current_user.id),
        role=roadmap_data.role,
        steps=steps_objects
    )
    await new_roadmap.insert()
    
    return {"message": "Roadmap saved successfully", "id": str(new_roadmap.id)}

@router.get("/active")
async def get_active_roadmap(
    current_user: User = Depends(get_current_user)
):
    """Get the user's currently active roadmap."""
    roadmap = await UserRoadmap.find_one(
        UserRoadmap.user_id == str(current_user.id),
        UserRoadmap.is_active == True
    )
    if not roadmap:
        return None
    
    # Sort steps by order_index just in case, though list order is preserved
    roadmap.steps.sort(key=lambda x: x.order_index)
    
    return {
        "id": str(roadmap.id),
        "role": roadmap.role,
        "steps": [step.dict() for step in roadmap.steps]
    }

@router.patch("/steps/{step_id}")
async def update_step_status(
    step_id: str,
    update: StepStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update the status of a specific step."""
    # Find the roadmap containing this step
    # We filter by user_id to ensure ownership
    roadmap = await UserRoadmap.find_one(
        UserRoadmap.user_id == str(current_user.id),
        UserRoadmap.steps.id == step_id
    )
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Step not found or access denied")
        
    # Update the specific step in the list
    step_found = False
    for step in roadmap.steps:
        if step.id == step_id:
            step.status = update.status
            step_found = True
            break
            
    if step_found:
        await roadmap.save()
        return {"message": "Status updated"}
    else:
        raise HTTPException(status_code=404, detail="Step not found")

@router.post("/details")
async def get_details(
    request: TopicRequest,
    current_user: User = Depends(get_current_user)
):
    """Get detailed explanation for a topic."""
    details = get_topic_details(request.topic, request.role)
    return {"content": details}

@router.post("/quiz")
async def get_quiz(
    request: QuizRequest,
    current_user: User = Depends(get_current_user)
):
    """Get a quiz for a topic."""
    questions = generate_quiz(request.topic)
    return questions
