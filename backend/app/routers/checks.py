from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.post("/machine/{check_id}/confirm", response_model=schemas.MachineCheckResponse)
def confirm_machine_check(check_id: int, request: schemas.ConfirmRequest, db: Session = Depends(get_db)):
    check = db.query(models.MachineCheck).filter(models.MachineCheck.id == check_id).first()
    if not check:
        raise HTTPException(status_code=404, detail="Machine check not found")
        
    check.is_confirmed = request.is_confirmed
    db.commit()
    db.refresh(check)
    return check

@router.post("/tool/{tool_id}/confirm", response_model=schemas.ToolResponse)
def confirm_tool(tool_id: int, request: schemas.ConfirmRequest, db: Session = Depends(get_db)):
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
        
    tool.is_confirmed = request.is_confirmed
    db.commit()
    db.refresh(tool)
    return tool

@router.post("/workpiece/{setup_id}/confirm", response_model=schemas.WorkpieceSetupItemResponse)
def confirm_workpiece_setup(setup_id: int, request: schemas.ConfirmRequest, db: Session = Depends(get_db)):
    setup = db.query(models.WorkpieceSetupItem).filter(models.WorkpieceSetupItem.id == setup_id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Workpiece setup item not found")
        
    setup.is_confirmed = request.is_confirmed
    db.commit()
    db.refresh(setup)
    return setup
