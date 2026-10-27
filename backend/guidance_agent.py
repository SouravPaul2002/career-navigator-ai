from typing import Optional, List, Dict
from langchain_core.prompts import ChatPromptTemplate
from ai_schema.schema import CareerRoadmap, Quiz, QuizQuestion
from llm import get_llm

llm = get_llm(temperature=0.7)

def generate_roadmap(job_role: str) -> Optional[CareerRoadmap]:
    """Generates a career roadmap for a specific job role."""
    structured_llm = llm.with_structured_output(CareerRoadmap)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are an expert Career Counselor. Your task is to accept a job role and create a detailed, step-by-step learning roadmap for a beginner to master that role. "
             "Break it down into logical steps (e.g., Basics, Intermediate, Advanced). Provide only title, description, and time estimates."),
            ("user", "Create a career roadmap for: {job_role}")
        ]
    )
    chain = prompt | structured_llm
    try:
        print(f"---Generating Roadmap for {job_role}---")
        result = chain.invoke({"job_role": job_role})
        return result
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return None

def get_topic_details(topic: str, role: str) -> str:
    """Generates a detailed explanation for a specific topic."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are an expert technical tutor. Explain the given topic in the context of the specified role. "
             "Provide a high-level overview, key concepts, and why it is important. Use markdown formatting."),
            ("user", "Explain topic '{topic}' for a '{role}' role.")
        ]
    )
    chain = prompt | llm
    try:
        result = chain.invoke({"topic": topic, "role": role})
        return result.content
    except Exception as e:
        print(f"Error generating details: {e}")
        return "Failed to retrieve details."

def generate_quiz(topic: str) -> List[Dict]:
    """Generates a 5-question quiz for a topic."""
    structured_llm = llm.with_structured_output(Quiz)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are a strict examiner. Create a 5-question multiple choice quiz to test understanding of the provided topic. "
             "Provide 4 options for each question and mark the correct answer."),
            ("user", "Create a quiz for topic: {topic}")
        ]
    )
    chain = prompt | structured_llm
    try:
        result = chain.invoke({"topic": topic})
        return [q.model_dump() for q in result.questions]
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return []
