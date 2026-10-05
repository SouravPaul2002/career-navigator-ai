# Low Level Design (LLD) - Career Navigator AI

## 1. Introduction
This document details the Low-Level Design for the **Career Navigator AI** platform. It bridges the architecture with the actual codebase implementation, specifying component structures, data models, AI agent pipelines, and interaction flows.

## 2. System Architecture Diagram
The following diagram illustrates the interaction between the Frontend components, API routers, AI Service Layer, and the MongoDB / Beanie ODM Data Layer.

```mermaid
classDiagram
    direction TB

    namespace Frontend_Layer {
        class CareerGuidance {
            +activeRoadmap: Roadmap
            +previewRoadmap: Roadmap
            +generateRoadmap(role)
            +saveRoadmap()
            +updateStepStatus(stepId, status)
            +openQuiz(topic)
        }
        class ResumeAnalysis {
            +analysisResult: Analysis
            +uploadResume(file, targetRole)
            +fetchHistory()
        }
        class MockInterview {
            +messages: Message[]
            +activeSessionId: string
            +startSession(role)
            +sendMessage(content)
        }
        class ApiClient {
            +baseURL: VITE_API_URL
            +requestInterceptor: Attach Bearer Token
            +responseInterceptor: 401 Redirect to /login
        }
        class AuthContext {
            +token: string
            +user: UserProfile
            +login(credentials)
            +logout()
        }
    }

    namespace Backend_API_Layer {
        class GuidanceRouter {
            +POST /api/guidance/generate
            +POST /api/guidance/save
            +GET /api/guidance/roadmap
            +PUT /api/guidance/steps/{step_id}/status
            +GET /api/guidance/steps/{step_id}
            +POST /api/guidance/quiz
        }
        class CareerRouter {
            +POST /api/career/analyze
            +GET /api/career/history
            +GET /api/career/history/{id}
        }
        class InterviewRouter {
            +POST /api/interview/session/start
            +GET /api/interview/sessions
            +GET /api/interview/session/{session_id}
            +POST /api/interview/session/{session_id}/message
        }
        class UserRouter {
            +POST /api/users/register
            +POST /api/users/token
            +GET /api/users/me
            +POST /api/users/change-password
        }
    }

    namespace AI_Service_Layer {
        class GuidanceAgent {
            -model: Gemini 2.5 Flash (LangChain)
            +generate_roadmap(role)
            +generate_quiz(topic)
        }
        class ResumeAnalyzer {
            -model: Gemini 2.5 Flash (LangChain)
            -workflow: LangGraph StateGraph
            +extract_text(state)
            +analyze_resume_text(state)
            +analyze_job_fit_text(state)
            +generate_suggestions_text(state)
            +compile_final_analysis(state)
            +analyze_resume(file_path, target_role)
        }
        class InterviewAgent {
            -model: Gemini 2.5 Flash (LangChain)
            +generate_interviewer_response(history, role)
            +evaluate_answer(question, answer, role)
        }
    }

    namespace Database_Data_Layer {
        class User {
            +id: PydanticObjectId
            +email: Indexed[str]
            +hashed_password: str
            +name: str
        }
        class UserRoadmap {
            +id: PydanticObjectId
            +user_id: Indexed[str]
            +role: str
            +steps: List[UserRoadmapStep]
            +is_active: bool
        }
        class ResumeAnalysisDoc {
            +id: PydanticObjectId
            +user_id: Indexed[str]
            +filename: str
            +analysis_data: dict
            +created_at: datetime
        }
        class InterviewSession {
            +id: PydanticObjectId
            +user_id: Indexed[str]
            +job_role: str
            +messages: List[InterviewMessage]
            +is_active: bool
            +created_at: datetime
        }
        class UserRoadmapStep {
            +id: str
            +title: str
            +description: str
            +resources: List[str]
            +status: StepStatus(todo, in_progress, done)
        }
    }

    %% Relationships
    CareerGuidance ..> ApiClient : Invokes
    ResumeAnalysis ..> ApiClient : Invokes
    MockInterview ..> ApiClient : Invokes
    ApiClient ..> GuidanceRouter : HTTP Requests
    ApiClient ..> CareerRouter : HTTP Requests
    ApiClient ..> InterviewRouter : HTTP Requests
    ApiClient ..> UserRouter : HTTP Requests

    GuidanceRouter --> GuidanceAgent : Invokes
    CareerRouter --> ResumeAnalyzer : Invokes (via run_in_threadpool)
    InterviewRouter --> InterviewAgent : Invokes

    GuidanceRouter --> UserRoadmap : Reads/Writes (with ownership check)
    CareerRouter --> ResumeAnalysisDoc : Reads/Writes (with ownership check)
    InterviewRouter --> InterviewSession : Reads/Writes (with ownership check)
    UserRouter --> User : Manage Identity

    UserRoadmap "1" *-- "many" UserRoadmapStep : Contains
    User "1" -- "many" UserRoadmap : Owns
    User "1" -- "many" ResumeAnalysisDoc : Owns
    User "1" -- "many" InterviewSession : Owns
```

## 3. Component Design

### 3.1 Frontend Components
The frontend is built with **React 19 (Vite)** and styled with **Bootstrap 5** and **React-Bootstrap**.
- **State Management**:
  - **Local State (`useState`, `useEffect`)**: Used for page-specific data like roadmap steps, quiz questions, upload status, and chat messages.
  - **Global State (`AuthContext`)**: Manages authentication tokens and profile data across the application.
  - **Theme State (`ThemeContext`)**: Manages dark and light UI theme preferences.
- **Centralized API Client (`apiClient.ts`)**:
  - Uses Axios with base URL configurable via `VITE_API_URL` (defaults to `http://localhost:8000`).
  - Request interceptor dynamically injects `Authorization: Bearer <token>` from `localStorage`.
  - Response interceptor intercepts `401 Unauthorized` responses, removes the stale token, and redirects to `/login`.
- **Speech Integration**:
  - `MockInterview.tsx` utilizes browser native Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition` and `speechSynthesis`) for hands-free voice interaction.

### 3.2 Backend Services (FastAPI)
The backend is structured into modular routers, security utilities, and specialized AI agents.
- **Routers (`backend/routes/`)**:
  - **`auth/user_routes.py`**: User registration, login via OAuth2 password flow, profile retrieval, and password change with complexity validation.
  - **`career/career_routes.py`**: Resume PDF validation (case-insensitive extension and `%PDF` magic bytes check), secure temp file writing, offloaded execution via `run_in_threadpool`, and ownership-checked history retrieval.
  - **`guidance/guidance_routes.py`**: Roadmap generation, saving active roadmaps, step status transitions validated with `StepStatus` Enum (`todo`, `in_progress`, `done`), and quiz generation.
  - **`interview/interview_routes.py`**: Interview session creation, ownership-checked message exchanges, and session history retrieval.
- **AI Service Layer (`backend/ai_schema/`)**:
  - **Resume Analysis Pipeline (`resume_analyzer.py`)**: Uses **LangGraph** `StateGraph` to orchestrate 5 discrete nodes:
    1. `extract_text`: Extracts text from PDF via `PyPDF2`.
    2. `analyze_resume_text`: Evaluates general strengths, weaknesses, and structure using Gemini 2.5 Flash.
    3. `analyze_job_fit_text`: Scores fit against target role and identifies skill gaps.
    4. `generate_suggestions_text`: Creates actionable resume enhancement suggestions.
    5. `compile_final_analysis`: Compiles the final JSON structure adhering to `ResumeAnalysis` schema.
  - **Guidance Agent (`guidance_agent.py`)**: Uses LangChain `ChatGoogleGenerativeAI(model="gemini-2.5-flash")` with prompt templates for roadmap and quiz creation.
  - **Interview Agent (`interview_agent.py`)**: Simulates conversational interview sessions and evaluates candidate answers.

### 3.3 Database & Models (MongoDB + Beanie)
Data persistence is handled by **MongoDB** using the **Beanie ODM** (asynchronous Motor driver).
- **`User`**: User accounts with unique indexed email, bcrypt hashed password, and timestamps.
- **`UserRoadmap`**: Active career roadmap linked to `user_id`, containing embedded `UserRoadmapStep` objects with `StepStatus` (`todo`, `in_progress`, `done`).
- **`ResumeAnalysis`**: Stores analyzed resume JSON linked to `user_id` and original filename.
- **`InterviewSession`**: Stores role-specific mock interview chat history (`InterviewMessage` list) linked to `user_id`.

## 4. Key Data Flows

### 4.1 Resume Upload & LangGraph Analysis
1. User uploads a file on `ResumeAnalysis`.
2. Frontend sends multipart `POST /api/career/analyze` with file and `target_role`.
3. Backend validates file extension is `.pdf` (case-insensitive) and validates `%PDF` header magic bytes.
4. File is saved to a secure UUID-named temporary file.
5. The LangGraph workflow (`ResumeAnalyzer.analyze_resume`) is executed inside `run_in_threadpool` to prevent event-loop blocking.
6. Temporary file is guaranteed cleaned up in a `finally` block.
7. Structured results are saved in MongoDB under the authenticated user's ID and returned to the client.

### 4.2 Roadmap Generation & Status Updates
1. User requests a roadmap for a job role via `POST /api/guidance/generate`.
2. `GuidanceAgent` calls Gemini 2.5 Flash to generate a structured curriculum.
3. User reviews preview and clicks "Start Tracking", triggering `POST /api/guidance/save`.
4. Backend archives any existing active roadmap and saves the new roadmap as active.
5. As user progresses, `PUT /api/guidance/steps/{step_id}/status` updates step status (`todo`, `in_progress`, `done`), verified against user ownership and validated via `StepStatus` Enum.

### 4.3 Mock Interview Interaction
1. User creates a session for a target role via `POST /api/interview/session/start`.
2. User submits an answer via `POST /api/interview/session/{session_id}/message`.
3. Backend checks session ownership (`session.user_id == current_user.id`).
4. `InterviewAgent` generates the next interviewer follow-up and evaluates the response.
5. Messages are appended to `InterviewSession.messages` in MongoDB and returned to the frontend.
