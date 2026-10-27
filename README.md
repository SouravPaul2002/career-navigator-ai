# Career Navigator AI

[![CI](https://github.com/SouravPaul2002/career-navigator-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/SouravPaul2002/career-navigator-ai/actions/workflows/ci.yml)

An AI-powered full-stack career guidance app. Users can analyze their resume, generate a learning roadmap for a target role, practice with topic quizzes, and run mock interviews. The backend is built with **FastAPI**, **MongoDB (Beanie)**, **LangChain** and **LangGraph** on **Google Gemini 2.5 Flash**; the frontend uses **React + TypeScript + Vite**.

## Features

- **Resume analysis**: upload a PDF (max 10 MB). A LangGraph workflow reads the PDF, extracts skills, education and experience, then identifies the professional domain, scores the resume (0–100), lists missing skills and recommends courses. Past analyses are saved per user.
- **Career roadmaps**: generate an ordered, step-by-step roadmap for a job role, save it, and track each step as `todo`, `in_progress` or `done`. Per-step topic explanations are available on demand.
- **Topic quizzes**: generate a short multiple-choice quiz for a topic.
- **Mock interview**: chat with an AI interviewer for a chosen role. Sessions and messages are stored in MongoDB, and the browser's Web Speech API provides optional voice input and output.
- **Accounts**: sign-up, login, profile update, change password and delete account, using JWT access tokens and bcrypt-hashed passwords. Every user-scoped query checks ownership.

## How the AI part works

| Piece | Implementation |
|---|---|
| Model | `ChatGoogleGenerativeAI` (`gemini-2.5-flash`) from `langchain-google-genai`, created in one shared factory (`backend/llm.py`) with retries and a timeout |
| Prompts and chains | `ChatPromptTemplate` piped into the model (`prompt \| llm`) in the resume, roadmap, quiz and topic-explanation flows |
| Structured output | `with_structured_output(...)` with Pydantic models (`Skills`, `JobAnalysisResult`, `CareerRoadmap`, `Quiz`) |
| Workflow | LangGraph `StateGraph` for resume analysis: `reader → ai_extractor → analyzer` |
| Interview context | Messages are stored in MongoDB and replayed to the model as `SystemMessage` / `HumanMessage` / `AIMessage` on each turn |

This is an LLM-powered application with fixed control flow. It does not use autonomous agents, tool calling, vector search or retrieval. Blocking model calls run in a thread pool so they do not stall the async server.

## Tech stack

- **Frontend**: React 19, TypeScript, Vite, React Router, Bootstrap 5 / React-Bootstrap, Axios, ESLint
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic v2, pypdf
- **Database**: MongoDB with Beanie ODM and Motor
- **Auth**: JWT (python-jose), bcrypt
- **AI**: LangChain, LangGraph, Google Gemini API
- **Testing and tooling**: pytest, pytest-asyncio, httpx, mongomock-motor, Docker, Docker Compose, GitHub Actions

## Project structure

```
backend/
  main.py                 # FastAPI app, CORS, router registration
  database.py             # MongoDB connection and Beanie ODM initialization
  llm.py                  # shared Gemini model factory
  resume_analyzer.py      # LangGraph resume-analysis workflow
  guidance_agent.py       # roadmap, topic explanation and quiz chains
  interview_agent.py      # mock-interviewer chain
  ai_schema/schema.py     # Pydantic models for structured LLM output (Skills, JobAnalysisResult, CareerRoadmap, Quiz)
  models.py               # Beanie documents (User, UserRoadmap, InterviewSession, ResumeAnalysis)
  auth.py                 # password hashing, JWT creation and verification
  routes/                 # users, career (resume, guidance, interview), common
  utils/pdf_handler.py    # PDF text extraction and cleaning
  tests/                  # pytest suite
frontend/
  src/api/apiClient.ts    # Axios client with JWT header and 401 handling
  src/pages/              # Dashboard, ResumeAnalysis, PastAnalyses, CareerGuidance, MockInterview, Profile
  src/components/         # auth, layout, resume and UI components
docker-compose.yml        # MongoDB + backend
.github/workflows/ci.yml  # backend tests, frontend lint and build
```

## API overview

| Prefix | Endpoints |
|---|---|
| `/users` | `POST /signup`, `POST /login`, `GET/PUT/DELETE /me`, `POST /me/change-password` |
| `/career` | `POST /analyze`, `GET /history`, `GET /analysis/{id}` |
| `/guidance` | `POST /generate`, `POST /save`, `GET /active`, `GET/PATCH /steps/{id}`, `POST /details`, `POST /quiz` |
| `/interview` | `POST /sessions`, `GET /sessions`, `GET /sessions/{id}/messages`, `POST /sessions/{id}/chat` |
| other | `GET /health`, `GET /info` |

Interactive docs are served at `http://localhost:8000/docs`.

## Getting started

### Prerequisites

- Python 3.11+, Node.js 20+
- A MongoDB instance (local, Atlas, or via Docker Compose)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Option A: Docker Compose (MongoDB + backend)

Create a `.env` file next to `docker-compose.yml`:

```env
SECRET_KEY=replace_with_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
```

Then run:

```bash
docker compose up --build
```

The API is available at `http://localhost:8000`. The frontend is not part of the Compose file; start it as shown below.

### Option B: Run locally

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env             # then fill in the values
uvicorn main:app --reload --port 8000
```

Backend environment variables (`backend/.env`):

| Variable | Purpose | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string (database name is `career_navigator`) | `mongodb://localhost:27017` |
| `GEMINI_API_KEY` | Gemini API key (`GOOGLE_API_KEY` also accepted) | required for AI features |
| `SECRET_KEY` | JWT signing key | required; the app refuses to start without it |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | token lifetime | `1440` |

**Frontend**

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` if the API is not at `http://localhost:8000` (see `frontend/.env.example`). The backend CORS configuration currently allows `http://localhost:5173` and `http://localhost:5174`.

## Tests and CI

```bash
cd backend && pytest             # 20 tests; MongoDB is mocked and Gemini calls are patched
cd frontend && npm run lint && npm run build
```

GitHub Actions (`.github/workflows/ci.yml`) runs the backend tests on Python 3.11 and the frontend lint and build on Node 20 for every push and pull request to `main`.

The tests cover authentication, per-user data isolation, roadmap step updates and the AI endpoints with mocked model responses. They do not call the real Gemini API.

## Known limitations

- The mock interviewer has no scoring or end-of-session report; it is a conversational chain with persisted history.
- Quizzes are generated on demand and are not stored.
- The JWT is kept in the browser's `localStorage`.
