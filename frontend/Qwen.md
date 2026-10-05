# Career Navigator Frontend Project

This is the frontend repository for the Career Navigator application, a resume guidance platform. The project is currently under development and implements a complete UI for resume guidance with authentication, dashboard, and resume management features.

## Project Status

- **Date**: Thursday, 25 September 2025
- **Platform**: Windows (win32)
- **Directory**: D:\career_navigator\frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite

## Current Implementation

### Features Implemented

#### 1. Authentication Pages
- **Login Page**: Clean, minimalistic login form with email/password fields, "Remember me" option, and "Forgot Password?" link
- **Sign-up Page**: Straightforward registration form with name, email, password, and confirm password fields
- Both pages feature subtle animations and responsive button effects

#### 2. Resume Analysis Flow
- **Resume Upload**: User uploads resume file (PDF, DOCX) via intuitive drag-and-drop interface
- **API Processing**: Backend API extracts skills specifically from the resume summary section
- **Skills Table**: Extracted skills are displayed in a sortable, filterable table with relevant categories
- **Completion Percentage**: API calculates and displays overall resume completion percentage
- **Resume Feedback**: AI-powered feedback on resume quality, missing sections, and improvement suggestions
- **Dashboard Integration**: All resume metrics and insights are accessible from the main dashboard

#### 3. Main Dashboard
- **Left-Side Navigation Panel**: Fixed, collapsible panel with menu items and hover effects
- **Dashboard Header**: With user profile and action buttons
- **Resume Statistics Section**: Visual data representation with progress indicators and recommendations
- **Action Items**: Suggested next steps to improve resume quality

#### 4. Sidebar Implementation
- **Consistent Navigation**: All main pages now include the left sidebar for unified navigation
- **Pages with Sidebar**: Resume Analysis, Mock Interview, Career Guidance, Dashboard, and Edit Resume pages all include the sidebar
- **Navigation Links**: Links to Dashboard, Resume Analysis, Mock Interview, and Career Guidance sections

#### 5. Consolidated Styling
- **Global CSS**: All individual CSS modules have been consolidated into a single global CSS file
- **Consistent Styling**: Styling is now maintained through a single global CSS file instead of modular CSS
- **Animations**: All animations and transitions are now part of the global CSS

#### 6. Animation and Interactivity
- Micro-animations on buttons, icons, and menu items
- Smooth transitions between pages and sections
- Element-reveal animations for dashboard cards
- Hover and active states for interactive elements
- Loading states for API calls during resume processing

## Technical Implementation

### Folder Structure
```
src/
├── components/
│   ├── auth/          # Login and Signup components
│   ├── dashboard/     # Stats and dashboard components
│   ├── resume/        # Resume preview and editing
│   └── layout/        # Layout components like sidebar
├── pages/             # Top-level page components
├── context/           # React context providers
├── utils/             # Utility functions
└── styles/            # Global styles and animations
```

### Dependencies Used
- React (with TypeScript)
- React Router DOM for navigation
- CSS modules for styling
- Vite for build tooling

### Key Components
- `Layout.tsx`: Main dashboard layout with collapsible sidebar
- `Login.tsx` & `Signup.tsx`: Authentication pages
- `Dashboard.tsx`: Main dashboard page
- `ResumePreview.tsx`: Live resume preview
- `StatsSection.tsx`: Statistics and progress visualization
- `EditResume.tsx`: Resume editing functionality

### Styling Approach
- Single global CSS file (`global.css`)
- CSS variables for consistent theming
- Responsive design using CSS Grid and Flexbox
- Mobile-first approach with responsive breakpoints

## Color Palette
- Primary: #3182CE (Blue)
- Secondary: #1A365D (Dark Blue)
- Background: #F8FAFC (Light Gray)
- Text: #1A202C (Dark Gray)
- Success: #48BB78 (Green)
- Warning: #F6AD55 (Orange)

## Responsive Design
The application is fully responsive and adapts to different screen sizes:
- Desktop: Full sidebar and two-column dashboard layout
- Tablet: Collapsible sidebar, adjusted column layout
- Mobile: Single column layout, stacked elements

## Custom Hooks and Utilities
- State management for form inputs
- Animation utilities
- Responsive helpers

## How to Run
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser to the provided URL

## Additional Notes
- All components are built with accessibility in mind
- Form validation is implemented where needed
- Error handling is in place for user interactions
- Performance optimizations are applied where possible
- All pages now have consistent sidebar navigation
- CSS has been consolidated into a single global file