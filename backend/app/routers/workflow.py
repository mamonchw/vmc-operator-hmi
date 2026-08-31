from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter()

STAGES = [
    "POWER_ON",
    "MACHINE_CHECKS",
    "TOOLS",
    "WORKPIECE",
    "READY",
    "RUNNING",
    "STOPPED"
]

@router.get("/state", response_model=schemas.FullStateResponse)
def get_full_state(db: Session = Depends(get_db)):
    workflow = db.query(models.WorkflowState).first()
    scenario = db.query(models.Scenario).first()
    machine_checks = db.query(models.MachineCheck).order_by(models.MachineCheck.order).all()
    tools = db.query(models.Tool).order_by(models.Tool.order).all()
    workpiece_setup = db.query(models.WorkpieceSetupItem).order_by(models.WorkpieceSetupItem.order).all()
    
    return {
        "workflow": workflow,
        "scenario": scenario,
        "machine_checks": machine_checks,
        "tools": tools,
        "workpiece_setup": workpiece_setup
    }

@router.post("/advance", response_model=schemas.WorkflowStateResponse)
def advance_stage(db: Session = Depends(get_db)):
    workflow = db.query(models.WorkflowState).first()
    
    current_idx = STAGES.index(workflow.current_stage)
    
    if workflow.current_stage == "POWER_ON":
        workflow.current_stage = "MACHINE_CHECKS"
    elif workflow.current_stage == "MACHINE_CHECKS":
        unconfirmed = db.query(models.MachineCheck).filter_by(is_confirmed=False).count()
        if unconfirmed > 0:
            raise HTTPException(status_code=400, detail="Cannot advance. Machine checks incomplete.")
        workflow.current_stage = "TOOLS"
    elif workflow.current_stage == "TOOLS":
        unconfirmed = db.query(models.Tool).filter_by(is_confirmed=False).count()
        if unconfirmed > 0:
            raise HTTPException(status_code=400, detail="Cannot advance. Required tools incomplete.")
        workflow.current_stage = "WORKPIECE"
    elif workflow.current_stage == "WORKPIECE":
        unconfirmed = db.query(models.WorkpieceSetupItem).filter_by(is_confirmed=False).count()
        if unconfirmed > 0:
            raise HTTPException(status_code=400, detail="Cannot advance. Workpiece setup incomplete.")
        workflow.current_stage = "READY"
    elif workflow.current_stage == "READY":
        workflow.current_stage = "OPERATION_READY"
        workflow.operation_status = "READY"
    elif workflow.current_stage in ["OPERATION_READY", "RUNNING", "STOPPED"]:
        raise HTTPException(status_code=400, detail="Cannot advance from operation states using this endpoint.")
    
    db.commit()
    db.refresh(workflow)
    return workflow

@router.post("/operation/start", response_model=schemas.WorkflowStateResponse)
def start_operation(db: Session = Depends(get_db)):
    workflow = db.query(models.WorkflowState).first()
    
    if workflow.current_stage not in ["OPERATION_READY", "STOPPED", "RUNNING"]:
        raise HTTPException(status_code=400, detail="Cannot start operation. Not in READY state.")
        
    if workflow.current_stage == "RUNNING":
        return workflow # Already running
        
    workflow.current_stage = "RUNNING"
    workflow.operation_status = "RUNNING"
    
    db.commit()
    db.refresh(workflow)
    return workflow

@router.post("/operation/stop", response_model=schemas.WorkflowStateResponse)
def stop_operation(db: Session = Depends(get_db)):
    workflow = db.query(models.WorkflowState).first()
    
    if workflow.current_stage != "RUNNING":
        raise HTTPException(status_code=400, detail="Cannot stop operation. Not currently running.")
        
    workflow.current_stage = "STOPPED"
    workflow.operation_status = "STOPPED"
    
    db.commit()
    db.refresh(workflow)
    return workflow

@router.post("/reset", response_model=schemas.WorkflowStateResponse)
def reset_workflow(db: Session = Depends(get_db)):
    workflow = db.query(models.WorkflowState).first()
    workflow.current_stage = "POWER_ON"
    workflow.operation_status = None
    
    # Reset all checks
    db.query(models.MachineCheck).update({"is_confirmed": False})
    db.query(models.Tool).update({"is_confirmed": False})
    db.query(models.WorkpieceSetupItem).update({"is_confirmed": False})
    
    db.commit()
    db.refresh(workflow)
    return workflow
