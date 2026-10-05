import os
import getpass
from typing import List, Dict
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

load_dotenv()

if "GOOGLE_API_KEY" not in os.environ:
    # Use a dummy key for development if not present
    print("Warning: GOOGLE_API_KEY not found. Mock interview features will fail.")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.environ.get("GOOGLE_API_KEY", ""),
    temperature=0.7 # Slight creativity for conversation
)

def generate_interview_response(job_role: str, history: List[Dict[str, str]]) -> str:
    """
    Generates the next response from the AI interviewer.
    
    Args:
        job_role: The role the user is interviewing for.
        history: A list of message dictionaries with 'sender' ('user' or 'ai') and 'content'.
    """
    
    system_prompt = (
        f"You are an experienced technical interviewer conducting a mock interview for a '{job_role}' position. "
        "Your goal is to assess the candidate's skills, experience, and cultural fit. "
        "1. Ask one clear question at a time. "
        "2. Varies types of questions: Technical, Behavioral, and Situational. "
        "3. Respond to the candidate's answers with brief constructive feedback or follow-up questions. "
        "4. Keep the tone professional but encouraging. "
        "5. If the candidate asks for help, provide a hint but don't give the full answer immediately. "
        "6. Do not write long paragraphs. Keep it conversational."
    )
    
    messages = [SystemMessage(content=system_prompt)]
    
    for msg in history:
        if msg['sender'] == 'user':
            messages.append(HumanMessage(content=msg['content']))
        elif msg['sender'] == 'ai':
            messages.append(AIMessage(content=msg['content']))
            
    try:
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        print(f"Error generating interview response: {e}")
        return "I apologize, but I'm having trouble connecting to the server. Let's pause for a moment."
