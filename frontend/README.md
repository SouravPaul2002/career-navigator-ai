# Resume Guidance Application

A modern, interactive resume builder application with a professional blue-on-white theme and thoughtful animations.

## Features

- **Authentication System**: Secure login and signup pages with form validation
- **Dashboard Interface**: Intuitive user dashboard with resume preview and statistics
- **Resume Preview**: Live preview of your resume as you build it
- **Statistics & Progress**: Visual indicators of resume completion and recommendations
- **Resume Editor**: Comprehensive form for editing all aspects of your resume
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Animations & Interactions**: Thoughtful micro-animations for a polished experience

## Tech Stack

- React (with TypeScript)
- React Router DOM for navigation
- CSS Modules for styling
- Vite as the build tool

## Folder Structure

```
src/
├── components/         # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── resume/         # Resume-related components
│   └── layout/         # Layout components (sidebar, etc.)
├── pages/              # Top-level page components
├── styles/             # Global styles and animations
└── assets/             # Static assets
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the provided URL

## Color Palette

- Primary: #3182CE (Blue)
- Secondary: #1A365D (Dark Blue)
- Background: #F8FAFC (Light Gray)
- Text: #1A202C (Dark Gray)
- Success: #48BB78 (Green)

## Responsive Design

The application is fully responsive and adapts to different screen sizes:

- **Desktop**: Full sidebar and two-column dashboard layout
- **Tablet**: Collapsible sidebar, adjusted column layout
- **Mobile**: Single column layout, stacked elements
