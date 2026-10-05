# Career Navigator AI - Backend

FastAPI backend service powering the Career Navigator AI platform, featuring MongoDB storage with Beanie ODM, JWT authentication, and AI-driven career services via Google Gemini 2.5 Flash and LangGraph.

## Architecture & Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with asynchronous request handling and Pydantic v2 validation.
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Beanie ODM](https://beanie-odm.dev/) (Motor async driver).
- **Authentication**: OAuth2 password flow with JWT access tokens (HMAC-SHA256, configurable expiration via `ACCESS_TOKEN_EXPIRE_MINUTES`, password complexity validation, passlib bcrypt).
- **AI Integrations**:
  - **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via `langchain-google-genai`.
  - **Resume Analysis Pipeline**: Implemented as a stateful graph using **LangGraph** (`StateGraph`), orchestrating text extraction, resume analysis, job fit evaluation, suggestion generation, and structured report compilation.
  - **Career Guidance & Roadmaps**: LangChain chain generating structured roadmaps, learning steps, and dynamic quizzes.
  - **Mock Interview Agent**: LangChain conversational agent simulating role-specific interviewers and providing answer evaluation.

## Project Structure

```
backend/
├── ai_schema/               # AI agents and schemas
│   ├── guidance_agent.py    # Career roadmap & quiz generation (Gemini 2.5 Flash)
│   ├── interview_agent.py   # Interactive mock interview agent (Gemini 2.5 Flash)
│   ├── resume_analyzer.py   # Multi-stage LangGraph resume analysis pipeline
│   └── schema.py            # Pydantic schemas for AI inputs/outputs
├── routes/                  # API routers
│   ├── auth/                # User authentication & profile routes (/api/users)
│   ├── career/              # Resume upload & history routes (/api/career)
│   ├── guidance/            # Career roadmap & quiz routes (/api/guidance)
│   └── interview/           # Mock interview chat routes (/api/interview)
├── tests/                   # Pytest test suite (mocked Gemini & in-memory MongoDB)
├── auth.py                  # JWT creation, token verification, password hashing
├── database.py              # MongoDB connection & Beanie document initialization
├── main.py                  # FastAPI application entrypoint & CORS configuration
├── models.py                # Beanie Document models (User, ResumeAnalysis, UserRoadmap, etc.)
├── pyproject.toml           # Project dependencies & tool configurations
└── requirements.txt         # Pinned UTF-8 dependencies
```

## Environment Configuration

Create a `.env` file in the `backend/` directory (or set environment variables) based on `.env.example`:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=career_navigator

# Security & JWT Auth (SECRET_KEY is mandatory, fails fast if omitted)
SECRET_KEY=your_secure_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting Started

### Prerequisites

- Python 3.10+ (tested on Python 3.13)
- Running MongoDB instance (local or Atlas)

### Setup & Installation

1. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .\.venv\Scripts\activate

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The interactive OpenAPI documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/users/register` | Register a new user account | No |
| `POST` | `/api/users/token` | Login and obtain JWT access token | No |
| `GET` | `/api/users/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/users/change-password` | Update user password with complexity validation | Yes |
| `POST` | `/api/career/analyze` | Upload resume (PDF) and run LangGraph analysis | Yes |
| `GET` | `/api/career/history` | List all resume analyses for user | Yes |
| `GET` | `/api/career/history/{id}` | Retrieve specific resume analysis | Yes |
| `POST` | `/api/guidance/generate` | Generate preview career roadmap | Yes |
| `POST` | `/api/guidance/save` | Save and activate a career roadmap | Yes |
| `GET` | `/api/guidance/roadmap` | Get user's active roadmap | Yes |
| `PUT` | `/api/guidance/steps/{step_id}/status` | Update roadmap step status (`todo`, `in_progress`, `done`) | Yes |
| `GET` | `/api/guidance/steps/{step_id}` | Retrieve step details | Yes |
| `POST` | `/api/guidance/quiz` | Generate topic-specific practice quiz | Yes |
| `POST` | `/api/interview/session/start` | Start new mock interview session | Yes |
| `GET` | `/api/interview/sessions` | List user's interview sessions | Yes |
| `GET` | `/api/interview/session/{session_id}` | Fetch session message history | Yes |
| `POST` | `/api/interview/session/{session_id}/message` | Send message to AI interviewer | Yes |

## Running Tests

The test suite uses `pytest` with `mongomock` and mocked Gemini calls:

```bash
pytest
```
