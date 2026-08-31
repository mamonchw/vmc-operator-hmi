# VMC Operator HMI - Startup Guidance

This project is a full-stack web application designed as a simulated Human Machine Interface (HMI) for a VMC operator. It guides the operator through a strict sequence of stages (Power On -> Machine Checks -> Required Tools -> Workpiece Setup -> Ready -> Operation).

## Project Overview
The HMI enforces a finite state machine workflow, preventing the operator from proceeding to the next stage until all requirements in the current stage are met and confirmed.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Axios, Lucide React
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, Pytest
- **Database**: PostgreSQL (or SQLite for testing/local fallback)

## Architecture & Project Structure
The repository uses a monorepo structure:
```
primeform_assignment/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components (ChecklistItem, Layout)
│   │   ├── services/     # API communication layer
│   │   └── App.tsx       # Main state machine routing logic
│   └── vercel.json       # Vercel deployment configuration
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── routers/      # API Endpoints (workflow, checks)
│   │   ├── database.py   # SQLAlchemy setup
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic validation schemas
│   │   ├── seed.py       # Mock data initialization
│   │   └── main.py       # FastAPI application entry point
│   └── tests/            # Pytest test cases
├── render.yaml           # Render deployment configuration
└── .env.example          # Example environment variables
```

## Features
- **Strict State Progression**: Backend validates all state transitions.
- **Persistence**: Data is saved to PostgreSQL to survive browser refreshes.
- **Responsive Industrial UI**: High contrast, large touch targets, clear status indicators.
- **Automated Testing**: Pytest suite to verify the state machine logic.
- **RESTful API**: Clean API documentation automatically generated via OpenAPI/Swagger.

## Local Setup

### 1. Database (PostgreSQL)
Ensure you have PostgreSQL running locally or via Docker. Create a user and database.
```bash
# Example via psql
CREATE USER vmc_user WITH PASSWORD 'vmc_password';
CREATE DATABASE vmc_db OWNER vmc_user;
```

### 2. Environment Variables
Create a `.env` file in the root, `backend`, or `frontend` directory.
```env
# backend/.env
DATABASE_URL=postgresql://vmc_user:vmc_password@localhost:5432/vmc_db
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Running the Backend
```bash
uvicorn app.main:app --reload --port 8000
```
The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 5. Frontend Setup
```bash
cd frontend
npm install
```

### 6. Running the Frontend
```bash
npm run dev
```
The HMI will be available at [http://localhost:5173](http://localhost:5173).

## Running Tests
To run the automated backend tests:
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests/
```

## Deployment Instructions

### Database (Neon)
1. Create a project in Neon.
2. Copy the connection string.
3. Use it as the `DATABASE_URL` environment variable for the Backend.

### Backend (Render)
1. Connect your GitHub repository to Render.
2. The provided `render.yaml` acts as a Blueprint.
3. Ensure you set the `DATABASE_URL` environment variable in Render's dashboard.
4. Render will handle the deployment automatically.

### Frontend (Vercel)
1. Import the project into Vercel.
2. Set the Root Directory to `frontend`.
3. Set the Environment Variable `VITE_API_URL` to your Render backend URL (e.g., `https://your-backend-app.onrender.com/api/v1`).
4. Vercel will use the `vercel.json` for proper single-page application routing.

## Demo Workflow
1. Click "BEGIN STARTUP CHECKS".
2. Confirm each machine check individually.
3. Click "NEXT".
4. Confirm each required tool.
5. Click "NEXT".
6. Confirm each workpiece setup instruction.
7. Click "NEXT".
8. Review the Ready screen, and click "PROCEED TO OPERATION".
9. Use "START" and "STOP" to control the simulated operation.
10. Refresh the page at any point to verify the state persists.

## Design Decisions
- **Single Page App Routing**: Rather than using a complex library like React Router, the application's current view is strictly driven by the `workflow_state.current_stage` fetched from the backend. This enforces the finite state machine and prevents users from manually navigating to a URL they aren't supposed to be on.
- **Centralized Models & Schemas**: To keep the project architecture straightforward and maintainable without over-engineering, models and schemas are grouped together rather than nested deeply in domain folders.
- **SQLAlchemy with SQLite Fallback**: While PostgreSQL is used, the engine setup allows for seamless fallback to SQLite for automated testing without mocking the entire database layer.
