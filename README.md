# Primeform VMC Operator HMI - Startup Guidance

## 📖 What This Project Is

This project is a full-stack web application designed as a simulated **Human Machine Interface (HMI)** for a Vertical Machining Center (VMC) operator. Its primary goal is to guide the operator through a strict, finite-state startup sequence before allowing them to operate the machine.

The application enforces the following linear workflow:
`POWER_ON` ➔ `MACHINE_CHECKS` ➔ `TOOLS` ➔ `WORKPIECE_SETUP` ➔ `READY` ➔ `OPERATION`

The HMI acts as a strict state machine—the operator cannot skip steps, and the backend validates all progression. The UI is designed to feel like a real industrial interface: high contrast (monochrome), distraction-free, with large touch targets and clear status indicators.

---

## 📊 Data & Assumptions

Because this is a simulated environment, we made several assumptions and pre-loaded (seeded) specific data to satisfy the assignment requirements:

1. **The Machine**: We assume the operator is stationed at "VMC-1".
2. **The Operation**: We assume the operator is preparing to run a CNC program named `O1001.NC` (Rev B) on `ALUMINUM 6061` material.
3. **Machine Checks (6 items)**: We assume the machine requires exactly 6 checks: Power/Control, E-Stop released, Doors closed, No Alarms, Fluids ready, and Reference Return.
4. **Tooling (3 items)**: We assume the operation requires 3 tools (T01 Face Mill, T05 End Mill, T08 Drill).
5. **Workpiece Setup (5 items)**: We assume the operator must verify the Fixture, Orientation, Clamping instruction, Material Rev, and Work Offset.

*All of this data is automatically seeded into the database the first time the backend starts.*

---

## 🛠️ Tech Stack

This project was built with a modern, robust, and highly scalable tech stack:

**Frontend (Client HMI)**
* **React 18** with **Vite**: For fast, component-driven UI development.
* **TypeScript**: Enforces strict type safety across the frontend.
* **Tailwind CSS v4**: For rapid, utility-first styling (using a custom monochrome theme).
* **Lucide React**: For clean, modern SVG iconography.
* **Axios**: For handling REST API requests to the backend.

**Backend (API & State Machine)**
* **Python 3.11** with **FastAPI**: Extremely fast, asynchronous API framework.
* **SQLAlchemy (ORM)**: For safe and structured database querying.
* **Pydantic**: For strict data validation and serialization.
* **PostgreSQL**: Production-ready relational database to persist the HMI state.
* **Pytest**: For automated backend testing.

---

## 📡 API Endpoints

The FastAPI backend exposes the following RESTful endpoints (view the full interactive Swagger documentation by navigating to `/docs` on the running backend URL):

### Workflow & State
* `GET /api/v1/workflow/state` - Fetch the full state of the HMI (current stage, scenario info, and all checklist items).
* `POST /api/v1/workflow/advance` - Advance the state machine to the next stage (only works if all checks for the current stage are confirmed).
* `POST /api/v1/workflow/operation/start` - Change the operation status to RUNNING.
* `POST /api/v1/workflow/operation/stop` - Change the operation status to STOPPED.
* `POST /api/v1/workflow/reset` - Reset the entire workflow back to the POWER_ON stage.

### Checks & Confirmation
* `POST /api/v1/checks/machine/{check_id}/confirm` - Confirm a specific machine check.
* `POST /api/v1/checks/tool/{tool_id}/confirm` - Confirm a specific tooling requirement.
* `POST /api/v1/checks/workpiece/{setup_id}/confirm` - Confirm a specific workpiece setup instruction.

---

## 🚀 How to Run This Project (Local Development)

To run this project on your local machine, follow these steps:

### 1. Database Setup
You will need a PostgreSQL database. You can either run one locally, or use a free cloud provider like [Render](https://render.com/) or [Neon](https://neon.tech/).
* Create a database (e.g., `vmc_db`).
* Get your connection string: `postgresql://user:password@host/vmc_db`

### 2. Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder and add your database URL:
```env
DATABASE_URL=postgresql://user:password@host/vmc_db
```
Start the backend server:
```bash
uvicorn app.main:app --reload --port 10000
```
*The backend API will run at `http://localhost:10000` and automatically create the tables and seed the data.*

### 3. Frontend Setup
Open a **new** terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder and point it to your local backend:
```env
VITE_API_URL=http://localhost:10000/api/v1
```
Start the frontend development server:
```bash
npm run dev
```
*The HMI will now be available in your browser at `http://localhost:5173`.*

---

## 🌍 How to Deploy (Production)

This repository is pre-configured for free cloud deployment:

**1. Database & Backend (Render)**
* Create a free PostgreSQL database on Render.
* Create a New Web Service on Render, connect your GitHub repo, and set the Root Directory to `backend`.
* Add a `DATABASE_URL` environment variable pointing to the Render database you just created.
* *Note: The `.python-version` file ensures Render uses a stable Python 3.11 environment.*

**2. Frontend (Vercel)**
* Create a new project on Vercel and connect your GitHub repo.
* Set the Framework to `Vite` and the Root Directory to `frontend`.
* Add a `VITE_API_URL` environment variable pointing to the public URL of your Render backend (make sure to include `/api/v1` at the end).
* Click Deploy!
