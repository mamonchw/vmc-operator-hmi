from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base, SessionLocal
from . import models
from .seed import seed_db_if_empty
from .routers import workflow, checks

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_db_if_empty(db)
    db.close()
    yield
    # Shutdown
    pass

app = FastAPI(title="VMC Operator HMI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflow.router, prefix="/api/v1/workflow", tags=["Workflow"])
app.include_router(checks.router, prefix="/api/v1/checks", tags=["Checks"])

@app.get("/")
def read_root():
    return {"message": "VMC Operator HMI API is running"}
