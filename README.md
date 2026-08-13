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

## Docker

- Build and run both services with Docker Compose:

```bash
docker compose up --build
```

- The Compose file exposes the backend on port `8000` and the frontend on `5173`. The frontend is configured to talk to the backend service by hostname when run via Compose.

## Running tests (backend)

- Create a Python virtualenv and install deps (recommended):

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

- Run unit tests (the test suite expects `PYTHONPATH=backend:.` and uses an ephemeral DB):

```bash
rm -f backend/test_warehouse.db
PYTHONPATH=backend:. DB_PATH=backend/test_warehouse.db .venv/bin/pytest -q
```

## Environment variables

- Backend:
  - `DB_PATH` — path to SQLite DB file (default: `/data/warehouse.db` in Docker)
  - `ALERT_SCAN_INTERVAL_SECONDS` — background alert scanner interval
  - `ALERT_WEBHOOK_URL` — optional webhook for alerts
- Frontend:
  - `VITE_API_BASE_URL` — base URL for API calls (set by Compose to `http://backend:8000`)

If you want me to run an end-to-end verification (start both services and exercise the login + inventory flows), say "run e2e" and I will bring the services up and perform a basic check.

## Seeding Demo Data

A helper script is provided to populate the backend with demo users, locations, items, stock, and alerts.

- Start the backend locally (recommended for quick seeding):

```bash
# from repo root
rm -f backend/test_warehouse.db
PYTHONPATH=backend:. DB_PATH=backend/test_warehouse.db backend/.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8001
```

- In another terminal, run the seeding script:

```bash
backend/.venv/bin/python backend/scripts/seed_demo.py
```

- When run, the script will register a demo user, create two locations and two items, set stock (one low to trigger an alert), and print a summary and alerts.

- To seed while running via Docker Compose, you can exec into the backend container and run the script against the service host (`http://backend:8000`) or copy the script into an image — let me know if you want a Compose-friendly seed job and I will add it.
