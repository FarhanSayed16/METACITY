from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import ScenarioRepository
import sqlite3
import json

router = APIRouter(tags=["scenarios"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

class ScenarioCreateReq(BaseModel):
    project_id: str
    name: str
    diff_ops: list[dict]

class ScenarioResp(BaseModel):
    id: str
    project_id: str
    name: str
    diff_json: str
    created_at: datetime

@router.post("/scenarios", response_model=ScenarioResp)
def create_scenario(req: ScenarioCreateReq, db: sqlite3.Connection = Depends(get_db)):
    # Validate diff ops before persisting
    from scenarios.validator import validate_scenario
    errors = validate_scenario(req.diff_ops)
    if errors:
        raise HTTPException(status_code=422, detail=f"Invalid scenario ops: {'; '.join(errors)}")
    
    repo = ScenarioRepository(db)
    diff_json = json.dumps(req.diff_ops)
    scen = repo.create(req.project_id, req.name, diff_json)
    return scen

@router.get("/scenarios/{scenario_id}", response_model=ScenarioResp)
def get_scenario(scenario_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = ScenarioRepository(db)
    scen = repo.get(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scen

@router.get("/projects/{project_id}/scenarios", response_model=list[ScenarioResp])
def list_scenarios(project_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = ScenarioRepository(db)
    return repo.list_by_project(project_id)
