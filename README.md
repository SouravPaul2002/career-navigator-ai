# AI-Powered Smart Career Guidance System

An intelligent career guidance application that leverages AI to provide personalized career recommendations, skill assessments, and professional development paths.

## Overview

The AI-Powered Smart Career Guidance System is a comprehensive platform designed to help users navigate their career journey with intelligent recommendations and personalized guidance. The system combines cutting-edge AI technology with career domain expertise to provide actionable insights and pathways.

## Project Structure

```
career_navigator/
├── backend/              # FastAPI backend services with AI functionality
├── frontend/             # Vite + TypeScript + React frontend
└── README.md             # Project documentation
```

### Backend (`/backend`)
- **Technology**: FastAPI
- **Purpose**: API endpoints, data processing, authentication, and database operations
- **Features**: RESTful APIs, data validation, user management, security

### Frontend (`/frontend`)
- **Technology**: Vite + TypeScript + React
- **Purpose**: User interface and user experience
- **Features**: Interactive dashboards, career visualization, user profiles, responsive design

### AI Functionality (in `/backend/ai_schema`)
- **Technology**: LangGraph, LangChain
- **Purpose**: Intelligent career recommendations and natural language processing
- **Features**: Conversational AI, personalized guidance, knowledge graph, learning paths, resume analysis

## Features

- **Personalized Career Recommendations**: AI-driven suggestions based on user profile, skills, and goals
- **Skill Assessment**: Interactive tools to evaluate current competencies
- **Career Path Planning**: Step-by-step guidance for career advancement
- **Market Insights**: Real-time information about industry trends and opportunities
- **Learning Path Suggestions**: Curated resources for skill development
- **User Dashboard**: Centralized view of career metrics and progress

## Technologies Used

- **Backend**: Python, FastAPI, Pydantic, SQLAlchemy
- **Frontend**: React, TypeScript, Vite, Tailwind CSS (or other styling framework)
- **AI/ML**: LangGraph, LangChain, Vector Databases, LLMs, OpenAI API
- **Database**: PostgreSQL, Vector Database (for embeddings)
- **Deployment**: Docker (optional), CI/CD pipelines
- **Additional Tools**: PDF processing libraries for resume analysis

## Getting Started

### Prerequisites

- Node.js (for frontend)
- Python 3.9+ (for backend with integrated AI functionality)
- Package managers (npm/yarn for frontend, pip for Python)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd career_navigator
   ```

2. Set up the backend:
   ```bash
   cd backend
   # Create virtual environment
   python -m venv venv
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   # Install dependencies
   pip install -r requirements.txt
   # Start the backend server
   uvicorn main:app --reload
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. The AI functionality is integrated into the backend:
   The AI components, including career recommendations and resume analysis, are implemented 
   within the backend service in the `ai_schema` directory. No separate AI agent setup is required.

5. Configure environment variables:
   Each directory contains an `.env.example` file with required environment variables. Copy these to `.env` files and add your configuration.

## Development

### Backend Development
- Follow FastAPI best practices
- Use Pydantic for request/response validation
- Implement proper error handling

### Frontend Development
- Use React best practices for component architecture
- Implement responsive design
- Follow accessibility guidelines

### AI Development
- Design multi-step conversation flows using LangGraph within the backend
- Integrate vector databases for knowledge retrieval in the `ai_schema` directory
- Implement chain-of-thought reasoning for career recommendations
- Develop resume analysis and skill assessment algorithms

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a pull request

## License

[Specify your license here]

## Contact

[Your contact information or team details]

---
Built with ❤️ for helping people navigate their career journey.