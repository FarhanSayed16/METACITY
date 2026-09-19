from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
import uuid

class Project(BaseModel):
    id: str
    name: str
    description: str
    scene_json_path: str
    created_at: datetime
    updated_at: datetime

class Scenario(BaseModel):
    id: str
    project_id: str
    name: str
    diff_json: str # JSON serialized list of ops
    created_at: datetime

class Run(BaseModel):
    id: str
    scenario_id: str
    seed: int
    status: str # pending, running, completed, error
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_msg: Optional[str] = None

class Comparison(BaseModel):
    id: str
    baseline_run_ids: str # comma separated
    scenario_run_ids: str # comma separated
    result_json: str # JSON serialized comparison result
    created_at: datetime
