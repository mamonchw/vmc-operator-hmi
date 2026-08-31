import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import WorkflowState, MachineCheck, Tool, WorkpieceSetupItem, Scenario
from app.seed import seed_db_if_empty

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        seed_db_if_empty(db)
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    db = TestingSessionLocal()
    workflow = db.query(WorkflowState).first()
    if workflow:
        workflow.current_stage = "POWER_ON"
        workflow.operation_status = None
    
    db.query(MachineCheck).update({"is_confirmed": False})
    db.query(Tool).update({"is_confirmed": False})
    db.query(WorkpieceSetupItem).update({"is_confirmed": False})
    
    db.commit()
    db.close()

def test_initial_state():
    response = client.get("/api/v1/workflow/state")
    assert response.status_code == 200
    data = response.json()
    assert data["workflow"]["current_stage"] == "POWER_ON"

def test_cannot_advance_without_checks():
    # Power on to checks
    response = client.post("/api/v1/workflow/advance")
    assert response.status_code == 200
    assert response.json()["current_stage"] == "MACHINE_CHECKS"
    
    # Checks to tools should fail
    response = client.post("/api/v1/workflow/advance")
    assert response.status_code == 400
    assert "incomplete" in response.json()["detail"]

def test_full_workflow():
    # 1. Advance to machine checks
    client.post("/api/v1/workflow/advance")
    
    # 2. Confirm all machine checks
    state = client.get("/api/v1/workflow/state").json()
    for check in state["machine_checks"]:
        client.post(f"/api/v1/checks/machine/{check['id']}/confirm", json={"is_confirmed": True})
        
    # 3. Advance to tools
    response = client.post("/api/v1/workflow/advance")
    assert response.json()["current_stage"] == "TOOLS"
    
    # 4. Confirm all tools
    for tool in state["tools"]:
        client.post(f"/api/v1/checks/tool/{tool['id']}/confirm", json={"is_confirmed": True})
        
    # 5. Advance to workpiece
    response = client.post("/api/v1/workflow/advance")
    assert response.json()["current_stage"] == "WORKPIECE"
    
    # 6. Confirm all workpiece setups
    for item in state["workpiece_setup"]:
        client.post(f"/api/v1/checks/workpiece/{item['id']}/confirm", json={"is_confirmed": True})
        
    # 7. Advance to Ready Review
    response = client.post("/api/v1/workflow/advance")
    assert response.json()["current_stage"] == "READY"
    
    # 7b. Advance to Operation Ready
    response = client.post("/api/v1/workflow/advance")
    assert response.json()["current_stage"] == "OPERATION_READY"
    
    # 8. Start operation
    response = client.post("/api/v1/workflow/operation/start")
    assert response.json()["current_stage"] == "RUNNING"
    assert response.json()["operation_status"] == "RUNNING"
    
    # 9. Stop operation
    response = client.post("/api/v1/workflow/operation/stop")
    assert response.json()["current_stage"] == "STOPPED"
    assert response.json()["operation_status"] == "STOPPED"
