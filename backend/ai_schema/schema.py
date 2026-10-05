from typing import List, Optional

from pydantic import BaseModel, Field

class Skill(BaseModel):
    skill_name: str = Field(description="The name of the skill.")
    type: str = Field(description="The description of the skill")

class Contact(BaseModel):
    contact: str = Field(description="The contact number/email link/any social media link")

class Education(BaseModel):
    education: str = Field(description="The description of the education.")
    scooling:str = Field(description="The description from where education is taken.")
    year: int = Field(description="The year the education is available.")

class Experience(BaseModel):
    experience: str = Field(description="The description of the experience.")

class Skills(BaseModel):
    all_skills: List[Skill]
    all_contacts: Optional[List[Contact]]
    all_education: Optional[List[Education]]
    all_experience: Optional[List[Experience]]

class JobAnalysisResult(BaseModel):
    identified_domain: str = Field(description="The professional domain identified from the resume (e.g., 'Data Scientist').")
    score: int = Field(description="The resume strength score from 0 to 100.")
    missing_skills: List[str] = Field(description="List of critical skills missing for the identified domain.")
    recommended_courses: List[str] = Field(description="List of recommended courses or actions to fill the gaps.")

class RoadmapStep(BaseModel):
    step_title: str = Field(description="Title of the learning step (e.g., 'Learn Python Basics').")
    description: str = Field(description="Detailed description of what to learn in this step.")
    estimated_duration: str = Field(description="Estimated time to complete this step (e.g., '2 weeks').")

class CareerRoadmap(BaseModel):
    role: str = Field(description="The job role this roadmap is for.")
    steps: List[RoadmapStep] = Field(description="Ordered list of steps to master this role.")