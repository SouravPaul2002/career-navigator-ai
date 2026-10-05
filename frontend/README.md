# Career Navigator AI - Frontend

React + TypeScript frontend application built with Vite and Bootstrap for the Career Navigator AI platform.

## Features

- **Authentication & Protected Routing**: Login and registration with client-side validation, JWT storage in `localStorage`, and route guarding.
- **Centralized API Client**: Custom Axios instance with base URL support (`VITE_API_URL`), automatic Bearer token injection, and automatic 401 redirect to `/login`.
- **Dashboard**: High-level overview of active career roadmaps, completed steps, mock interview activity, and quick access to core tools.
- **Career Guidance & Roadmaps**:
  - Interactive career path generation powered by Gemini 2.5 Flash.
  - Step-by-step tracking with status management (`todo`, `in_progress`, `done`).
  - Interactive dynamic multiple-choice quizzes with instant scoring and explanations.
- **Resume Analysis**:
  - PDF resume upload with client and server validation.
  - Detailed breakdown of strengths, weaknesses, role match score, and actionable improvements.
  - Past analyses archive with historical score comparison.
- **AI Mock Interviewer**:
  - Interactive role-based interview simulation.
  - Live AI feedback and evaluation for each answer.
  - Voice input and text-to-speech support via the Web Speech API.
- **Modern UI & Theme Support**: Built with Bootstrap 5 and React-Bootstrap, featuring dark and light theme toggling.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Bootstrap 5](https://getbootstrap.com/) and [React-Bootstrap](https://react-bootstrap.github.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── apiClient.ts      # Axios instance with auth interceptor
│   ├── components/
│   │   ├── auth/             # Login, Signup, ProtectedRoute
│   │   ├── career/           # CareerGuidance & Quiz components
│   │   ├── dashboard/        # Dashboard stats and progress widgets
│   │   ├── interview/        # MockInterview session chat & audio controls
│   │   ├── layout/           # Navbar, footer, and navigation
│   │   └── resume/           # ResumeAnalysis & PastAnalyses components
│   ├── context/
│   │   ├── AuthContext.tsx   # Auth state provider
│   │   └── ThemeContext.tsx  # Dark/Light theme provider
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Route definitions
│   └── main.tsx              # Application entrypoint
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20+)
- npm or yarn

### Installation & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (optional, defaults to `http://localhost:8000`):
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Run linter:
   ```bash
   npm run lint
   ```
