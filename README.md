# Career Navigator AI

An intelligent career guidance and preparation platform powered by **FastAPI**, **MongoDB (Beanie ODM)**, **Google Gemini 2.5 Flash**, **LangGraph**, and a modern **React + TypeScript + Vite** frontend.

## Overview

Career Navigator AI provides personalized, AI-driven career tools to accelerate professional growth:
- **Resume Analyzer**: Multi-stage resume evaluation using **LangGraph** to parse PDFs, evaluate strengths and weaknesses, assess job fit, and generate actionable recommendations.
- **Career Roadmaps**: Dynamic learning paths generated with Gemini 2.5 Flash, complete with step-by-step progress tracking (`todo`, `in_progress`, `done`).
- **Interactive Quizzes**: On-demand practice quizzes generated for specific topics on your roadmap.
- **AI Mock Interviewer**: Interactive simulated interviews with real-time feedback and voice input/output powered by the Web Speech API.

## Project Structure

```
career_navigator_ai/
├── backend/                  # FastAPI backend services with AI agents
│   ├── ai_schema/            # LangGraph resume pipeline & LangChain agents
│   ├── routes/               # API endpoints (auth, career, guidance, interview)
│   ├── tests/                # Automated pytest test suite
│   ├── models.py             # Beanie ODM MongoDB models
│   ├── pyproject.toml        # Backend dependencies & tool configs
│   └── requirements.txt      # Generated UTF-8 dependencies
├── frontend/                 # React 19 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api/              # Centralized Axios client with JWT interceptor
│   │   ├── components/       # UI components (auth, career, interview, resume)
│   │   └── context/          # Auth and theme context providers
│   └── package.json          # Frontend dependencies and scripts
└── low_level_design.md       # Detailed architectural and low-level design
```

## Technologies Used

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Beanie ODM, Motor (Async MongoDB driver), Uvicorn.
- **AI & Orchestration**:
  - **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via `langchain-google-genai`.
  - **LangGraph**: Stateful graph orchestrator used specifically for the multi-stage resume analysis pipeline.
  - **LangChain**: Prompt templates and chains for career guidance, quizzes, and mock interview evaluation.
- **Database**: MongoDB (local or MongoDB Atlas).
- **Authentication**: JWT access tokens (OAuth2 password flow, bcrypt hashing, password complexity rules).
- **Frontend**: React 19, TypeScript, Vite, Bootstrap 5, React-Bootstrap, Lucide React, Axios.
- **Testing**: Pytest with AsyncIO support, in-memory MongoDB mocking (`mongomock`), ESLint, and TypeScript compiler checks.

## Getting Started

### Prerequisites

- **Python**: Version 3.10+ (tested on Python 3.13)
- **Node.js**: Version 18+ (tested on Node 20+)
- **MongoDB**: A running MongoDB instance (e.g. `mongodb://localhost:27017`)
- **Google Gemini API Key**: An active Gemini API key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Ensure `SECRET_KEY` and `GEMINI_API_KEY` are configured:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DATABASE_NAME=career_navigator
   SECRET_KEY=replace_with_a_secure_random_string
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

5. Start the backend development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   Create a `.env` file if connecting to an API other than `http://localhost:8000`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open the browser at the URL shown in terminal (typically `http://localhost:5173`).

---

## Running Verification & Tests

### Backend Tests
The backend includes a comprehensive pytest suite covering user authentication, ownership isolation, roadmap status updates, and mocked Gemini AI calls:

```bash
cd backend
pytest
```

### Frontend Validation
Run linting and production build checks:

```bash
cd frontend
npm run lint
npm run build
```