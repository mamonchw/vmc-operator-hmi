from sqlalchemy.orm import Session
from . import models

def seed_db_if_empty(db: Session):
    # Check if scenario exists
    if db.query(models.Scenario).first():
        return
    
    # Create mock scenario
    scenario = models.Scenario()
    db.add(scenario)
    
    # Create workflow state
    workflow = models.WorkflowState(current_stage="POWER_ON")
    db.add(workflow)
    
    # Machine checks
    checks = [
        models.MachineCheck(check_name="Power/control", description="Power/control available", order=1),
        models.MachineCheck(check_name="E-stop", description="E-stop released", order=2),
        models.MachineCheck(check_name="Guard/door", description="Guard/door closed", order=3),
        models.MachineCheck(check_name="Alarms", description="No active alarm", order=4),
        models.MachineCheck(check_name="Lubrication/coolant", description="Lubrication/coolant ready", order=5),
        models.MachineCheck(check_name="Reference return", description="Reference return complete", order=6),
    ]
    db.add_all(checks)
    
    # Required tools
    tools = [
        models.Tool(tool_number="T01", tool_type="Face Mill", description="3-inch Face Mill - VMC-ALU-001 REV-B", order=1),
        models.Tool(tool_number="T05", tool_type="End Mill", description="1/2-inch Flat End Mill - VMC-ALU-001 REV-B", order=2),
        models.Tool(tool_number="T08", tool_type="Drill", description="1/4-inch Spot Drill - VMC-ALU-001 REV-B", order=3),
    ]
    db.add_all(tools)
    
    # Workpiece setup items
    workpiece_items = [
        models.WorkpieceSetupItem(item_name="Fixture", description="Install Vise 1", order=1),
        models.WorkpieceSetupItem(item_name="Workpiece Orientation", description="X-axis parallel", order=2),
        models.WorkpieceSetupItem(item_name="Clamping", description="Torque to 30 ft-lbs", order=3),
        models.WorkpieceSetupItem(item_name="Material & Drawing", description="Aluminum 6061, Drawing REV-3", order=4),
        models.WorkpieceSetupItem(item_name="Work Offset", description="Set G54", order=5),
    ]
    db.add_all(workpiece_items)
    
    db.commit()
