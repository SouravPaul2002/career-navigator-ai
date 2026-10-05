import os
from typing import TypedDict

from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.constants import END
from langgraph.graph import StateGraph

# Assuming these are correct from your local files
from ai_schema.schema import *
from utils.pdf_handler import read_pdf, clean_text

gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not gemini_key:
    print("Warning: GEMINI_API_KEY not found in environment. AI features will fail.")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=gemini_key or "dummy_key_for_dev_startup"
)


# Define the state for the graph
class GraphState(TypedDict):
    """Represents the state of our graph."""
    file_name: str
    resume_text: str | None
    extracted_skills: Skills | None
    analysis_result: JobAnalysisResult | None


def reading_agent(state: GraphState) -> GraphState:
    """Reads a PDF file and cleans the text."""
    print("---Reading PDF---")
    file_name = state["file_name"]
    pdf = read_pdf(file_name)
    if pdf["status"]:
        cleaned_text = clean_text(pdf["text"])
        state["resume_text"] = cleaned_text
    else:
        print(f"Error reading PDF: {pdf.get('error')}")
        state["resume_text"] = None
    return state


def ai_skill_extract(state: GraphState) -> GraphState:
    """Uses an LLM to extract skills from the resume text."""
    print("---Extracting Skills---")
    resume_text = state["resume_text"]

    if not resume_text:
        print("No resume text to process.")
        state["extracted_skills"] = None
        return state

    structured_llm = llm.with_structured_output(Skills)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are a HR assistant. Your task is to summarize the resume and extract important skills from the text. Respond with a JSON object containing the skills."),
            ("user", "Summarize and extract skills from this resume: {resume_text}")
        ]
    )
    chain = prompt | structured_llm

    try:
        skills = chain.invoke({"resume_text": resume_text})
        state["extracted_skills"] = skills
    except Exception as e:
        print(f"Error invoking LLM chain: {e}")
        state["extracted_skills"] = None

    return state


def find_and_analyze(state: GraphState) -> GraphState:
    """Identifies domain and performs gap analysis."""
    print("---Analyzing Gaps & Score---")
    resume_text = state["resume_text"]
    skills = state["extracted_skills"]
    
    if not resume_text:
        state["analysis_result"] = None
        return state

    structured_llm = llm.with_structured_output(JobAnalysisResult)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are a Senior Career Counselor. Analyze the resume text and extracted skills. "
             "1. Identify the professional domain (e.g. 'Full Stack Developer', 'Data Analyst'). "
             "2. Compare the resume against industry standards for that domain. "
             "3. Assign a score (0-100) based on completeness and quality. "
             "4. List critical missing skills. "
             "5. Recommend specific courses or actions."),
            ("user", "Resume Text: {resume_text}\n\nExtracted Skills: {skills}")
        ]
    )
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({"resume_text": resume_text, "skills": skills})
        state["analysis_result"] = result
    except Exception as e:
        print(f"Error in analysis: {e}")
        state["analysis_result"] = None
        
    return state


# Build the graph
graph = StateGraph(GraphState)
graph.add_node("reader", reading_agent)
graph.add_node("ai_extractor", ai_skill_extract)
graph.add_node("analyzer", find_and_analyze)

graph.add_edge("reader", "ai_extractor")
graph.add_edge("ai_extractor", "analyzer")
graph.add_edge("analyzer", END)

# Set the entry point
graph.set_entry_point("reader")
app = graph.compile()


# def invoke_agent(file_path: str = "resume.pdf"):
#     res = app.invoke({
#         'file_name': file_path,
#         'resume_text': None,
#         'extracted_skills': None,
#         'analysis_result': None
#     })
    
#     extracted: Skills = res["extracted_skills"]
#     analysis: JobAnalysisResult = res["analysis_result"]
    
#     result = {
#         "analysis": analysis,
#         "extracted_skills": extracted
#     }
#     return result
def invoke_agent(file_path: str):
    res = app.invoke({
        "file_name": file_path,
        "resume_text": None,
        "extracted_skills": None,
        "analysis_result": None
    })

    extracted = res.get("extracted_skills")
    analysis = res.get("analysis_result")

    return {
        "analysis": analysis.model_dump() if analysis else {},
        "extracted_skills": extracted.model_dump() if extracted else {}
    }



if __name__ == "__main__":
    res = invoke_agent()
    print(res)