# Backend - FastAPI

This folder contains the backend services built with FastAPI for the AI-powered smart career guidance project.

## Technologies Used
- FastAPI: Modern, fast web framework for building APIs with Python
- Python: Programming language
- PyPDF2: PDF processing library
- LangChain: Framework for developing applications with language models
- Google Generative AI: Integration with Gemini models
- LangGraph: Framework for building stateful, multi-step AI applications
- Pydantic: Data validation and serialization library

## Purpose
The backend handles:
- API endpoints for frontend communication
- Resume analysis and skill extraction using AI
- Career guidance and domain matching
- PDF processing and text extraction
- Integration with AI agent
- User management (planned)

## Setup Instructions
1. Navigate to this directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables:
   - Create a `.env` file with `GOOGLE_API_KEY` for accessing Google's AI services
6. Run the application: `python run.py` or `uvicorn main:app --reload`

## Project Structure
- `main.py`: Main FastAPI application entry point
- `run.py`: Application runner with uvicorn
- `resume_analyzer.py`: Core resume analysis logic using LangGraph and Google AI
- `ai_schema/schema.py`: Pydantic models defining data structures for resume parsing
- `utils/pdf_handler.py`: PDF processing utilities
- `routes/`: API route definitions
  - `routes/career/`: Career guidance related endpoints
  - `routes/users/`: User management endpoints (planned)
  - `routes/common/`: Common utility endpoints

## Key Components
- Resume analysis using LangGraph workflow
- AI-powered skill extraction from resumes
- PDF text extraction and cleaning
- Career domain matching (partially implemented)
- API endpoints for career guidance features
- Health check and server info endpoints
- Structured data models for resume parsing