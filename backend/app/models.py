from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    operation_name = Column(String, default="Face Milling")
    cnc_program = Column(String, default="VMC-ALU-001")
    program_rev = Column(String, default="REV-B")
    material = Column(String, default="Aluminum 6061")
    drawing_rev = Column(String, default="REV-3")
    fixture = Column(String, default="Vise 1")
    work_offset = Column(String, default="G54")
    workpiece_orientation = Column(String, default="X-axis parallel")
    clamping_instruction = Column(String, default="Torque to 30 ft-lbs")
    quantity = Column(Integer, default=1)

class WorkflowState(Base):
    __tablename__ = "workflow_states"
    
    id = Column(Integer, primary_key=True, index=True)
    current_stage = Column(String, default="POWER_ON")
    operation_status = Column(String, nullable=True) # READY, RUNNING, STOPPED

class MachineCheck(Base):
    __tablename__ = "machine_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    check_name = Column(String, index=True)
    description = Column(String)
    is_confirmed = Column(Boolean, default=False)
    order = Column(Integer)

class Tool(Base):
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    tool_number = Column(String)
    tool_type = Column(String)
    description = Column(String)
    is_confirmed = Column(Boolean, default=False)
    order = Column(Integer)

class WorkpieceSetupItem(Base):
    __tablename__ = "workpiece_setup_items"
    
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String)
    description = Column(String)
    is_confirmed = Column(Boolean, default=False)
    order = Column(Integer)
