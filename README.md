# Smart AI Warehouse Management System

This repository contains the frontend and backend for the Smart AI Warehouse Management System.
The application is built as a React + TypeScript frontend with a FastAPI backend.

## Project Structure

- `frontend/` - React UI built with Vite and TypeScript
- `backend/` - FastAPI backend API and services
- `docs/` - project documentation and requirement artifacts
- `issu/` - assessment notes, task tracking, and feature inspection files

## Frontend

- Location: `frontend/`
- Stack: React + TypeScript + Vite
- Install dependencies:
  - `cd frontend && npm install`
- Start development server:
  - `cd frontend && npm run dev`
- Build for production:
  - `cd frontend && npm run build`
- Environment config:
  - Copy `frontend/.env.example` to `frontend/.env` if you need to customize API URLs.

## Backend

- Location: `backend/`
- Stack: FastAPI
- Install dependencies:
  - `cd backend && pip install -r requirements.txt`
- Start server:
  - `cd backend && python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
- Health endpoint:
  - `http://127.0.0.1:8000/health`
- Environment config:
  - Copy `backend/.env.example` to `backend/.env` and update any settings such as CORS origins.

## Notes

- The backend currently exposes warehouse task placeholder data at `GET /tasks`.
- The frontend includes authentication pages and a protected tasks page.
- To run the full project locally, start backend on `http://127.0.0.1:8000` and frontend on `http://127.0.0.1:5173`.
