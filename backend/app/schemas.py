from pydantic import BaseModel
from typing import List, Optional

class MachineCheckBase(BaseModel):
    check_name: str
    description: str
    order: int

class MachineCheckResponse(MachineCheckBase):
    id: int
    is_confirmed: bool

    class Config:
        from_attributes = True

class ToolBase(BaseModel):
    tool_number: str
    tool_type: str
    description: str
    order: int

class ToolResponse(ToolBase):
    id: int
    is_confirmed: bool

    class Config:
        from_attributes = True

class WorkpieceSetupItemBase(BaseModel):
    item_name: str
    description: str
    order: int

class WorkpieceSetupItemResponse(WorkpieceSetupItemBase):
    id: int
    is_confirmed: bool

    class Config:
        from_attributes = True

class ScenarioResponse(BaseModel):
    operation_name: str
    cnc_program: str
    program_rev: str
    material: str
    drawing_rev: str
    fixture: str
    work_offset: str
    workpiece_orientation: str
    clamping_instruction: str
    quantity: int

    class Config:
        from_attributes = True

class WorkflowStateResponse(BaseModel):
    current_stage: str
    operation_status: Optional[str] = None
    
    class Config:
        from_attributes = True

class FullStateResponse(BaseModel):
    workflow: WorkflowStateResponse
    scenario: ScenarioResponse
    machine_checks: List[MachineCheckResponse]
    tools: List[ToolResponse]
    workpiece_setup: List[WorkpieceSetupItemResponse]

class ConfirmRequest(BaseModel):
    is_confirmed: bool = True
