# CSE309 Project

This repository includes a starter frontend and backend setup for the assessment.

## Frontend
- Location: frontend/
- Stack: React + TypeScript + Vite
- Install dependencies: npm install
- Start development server: npm run dev
- Build for production: npm run build
- Folder structure:
  - src/components
  - src/pages
  - src/services
  - src/types
  - src/styles
- Environment config: copy frontend/.env.example to frontend/.env and update the API URL if needed.

## Backend
- Location: backend/
- Stack: FastAPI
- Install dependencies: pip install -r requirements.txt
- Start server: uvicorn main:app --reload --host 127.0.0.1 --port 8000
- Health endpoint: http://127.0.0.1:8000/health
- Backend environment config: copy backend/.env.example to backend/.env and adjust CORS settings if needed.

Submission PR for CSE309 assessment.