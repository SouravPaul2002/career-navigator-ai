# Low Level Design (LLD) - Career Navigator AI

## 1. Introduction
This document details the Low-Level Design for the **Career Navigator AI** platform. It bridges the High-Level Design (HLD) with the actual code implementation, specifying component structures, data models, and interaction flows.

## 2. System Architecture Diagram
The following class diagram illustrates the interaction between the Frontend components, Backend API routers, AI Service Agents, and the Database Models.

```mermaid
classDiagram
    direction TB

    namespace Frontend_Layer {
        class CareerGuidancePage {
            +state: activeRoadmap
            +state: previewRoadmap
            +generateRoadmap()
            +startTracking()
            +openQuiz()
        }
        class ResumeAnalysisPage {
            +state: analysisResult
            +uploadResume(file)
            +fetchHistory()
        }
        class MockInterviewPage {
            +state: messages
            +startSession(role)
            +sendMessage(content)
        }
        class AuthContext {
            +token: JWT
            +user: UserProfile
            +login(credentials)
            +logout()
        }
    }

    namespace Backend_API_Layer {
        class GuidanceRouter {
            +POST /generate
            +POST /save
            +POST /quiz
        }
        class CareerRouter {
            +POST /analyze
            +GET /history
        }
        class InterviewRouter {
            +POST /session/start
            +POST /message
        }
        class UserRouter {
            +POST /register
            +POST /token
        }
    }

    namespace AI_Service_Layer {
        class GuidanceAgent {
            -model: Gemini 2.5 Flash
            +generate_roadmap(role)
            +generate_quiz(topic)
            +get_details(topic)
        }
        class ResumeAnalyzer {
            -model: Gemini 2.5 Flash
            +extract_text_from_pdf()
            +analyze_resume_text()
        }
        class InterviewAgent {
            -model: Gemini 2.5 Flash
            +generate_interviewer_response()
            +evaluate_answer()
        }
    }

    namespace Database_Data_Layer {
        class User {
            +email: Indexed[str]
            +hashed_password: str
            +name: str
        }
        class UserRoadmap {
            +user_id: Indexed[str]
            +role: str
            +steps: List[UserRoadmapStep]
            +is_active: bool
        }
        class ResumeAnalysis {
            +user_id: Indexed[str]
            +filename: str
            +analysis_data: dict
        }
        class InterviewSession {
            +user_id: Indexed[str]
            +job_role: str
            +messages: List[InterviewMessage]
            +is_active: bool
        }
        class UserRoadmapStep {
            +title: str
            +status: enum(todo, in_progress, done)
        }
    }

    %% Relationships
    CareerGuidancePage ..> GuidanceRouter : HTTP Requests
    ResumeAnalysisPage ..> CareerRouter : HTTP Requests
    MockInterviewPage ..> InterviewRouter : HTTP Requests
    AuthContext ..> UserRouter : Authentication

    GuidanceRouter --> GuidanceAgent : Invokes
    CareerRouter --> ResumeAnalyzer : Invokes
    InterviewRouter --> InterviewAgent : Invokes

    GuidanceRouter --> UserRoadmap : Reads/Writes
    CareerRouter --> ResumeAnalysis : Reads/Writes
    InterviewRouter --> InterviewSession : Reads/Writes
    UserRouter --> User : Manage Identity

    UserRoadmap "1" *-- "many" UserRoadmapStep : Contains
    User "1" -- "many" UserRoadmap : Owns
```

## 3. Component Design

### 3.1 Frontend Components
The frontend is built with **React (Vite)** and styled with **Tailwind CSS** + **Bootstrap**.
- **State Management**:
    - **Local State (`useState`)**: Used for page-specific data like `roadmap` steps, `quiz` scores, and `chat` messages.
    - **Global State (`AuthContext`)**: Manages the JWT authentication token and user profile information accessible across the app.
- **Service Integration**:
    - Direct `axios` calls are made within page components (`CareerGuidance.tsx`, etc.) to backend endpoints.
    - **Authentication**: JWT token is retrieved from `localStorage` and attached to the `Authorization` header for every secure request.

### 3.2 Backend Services (FastAPI)
The backend is structured into modular routers and specialized AI agents.
- **Routers (`/routes`)**:
    - **`users_router`**: Handles registration and login (OAuth2 password flow).
    - **`career_router`**: Manages resume uploads and retrieval of past analyses.
    - **`guidance_router`**: Handles career roadmap generation, progress tracking, and quiz generation.
    - **`interview_router`**: Manages mock interview sessions and message exchanges.
- **AI Agents**:
    - Wrapper classes around **Google Gemini 2.5 Flash** using **LangChain**.
    - **`GuidanceAgent`**: Generates structured JSON for roadmaps and quizzes.
    - **`ResumeAnalyzer`**: Parses PDF content and prompts the LLM for strengths/weaknesses analysis.

### 3.3 Database Schema (MongoDB + Beanie)
Data is stored in **MongoDB** and accessed via **Beanie ODM**.
- **`User`**: Secure storage of user credentials.
- **`ResumeAnalysis`**: JSON storage of AI-generated insights, linked to a user.
- **`UserRoadmap`**: Represents a user's active learning path.
    - **Structure**: Contains a list of `UserRoadmapStep` objects (embedded documents).
    - **State Tracking**: `status` field in steps tracks progress (`todo`, `in_progress`, `done`).
- **`InterviewSession`**: Stores the chat history for context-aware AI responses.

## 4. Key Data Flows

### 4.1 Roadmap Generation
1.  **User** selects a role on `CareerGuidancePage`.
2.  **Frontend** sends `POST /guidance/generate` with `{ job_role }`.
3.  **`GuidanceRouter`** calls `GuidanceAgent.generate_roadmap()`.
4.  **`GuidanceAgent`** prompts Gemini 2.5 Flash to create a step-by-step plan.
5.  **LLM** returns a JSON structure.
6.  **Backend** returns this JSON to Frontend (Status: *Preview*).
7.  **User** clicks "Start Tracking".
8.  **Frontend** sends `POST /guidance/save`.
9.  **Backend** saves the `UserRoadmap` to MongoDB.

### 4.2 Mock Interview
1.  **User** starts a session for a role.
2.  **Backend** creates a new `InterviewSession` document.
3.  **User** sends a message.
4.  **Backend** retrieves the session history from MongoDB.
5.  **`InterviewAgent`** appends the new message and history to the prompt.
6.  **Gemini** generates a response (interviewer persona).
7.  **Backend** saves both user query and AI response to `InterviewSession.messages` and returns the AI response.
