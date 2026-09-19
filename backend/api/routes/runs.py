from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import RunRepository
from persistence.results_writer import read_run_kpis
from jobs.manager import job_manager
import sqlite3

router = APIRouter(prefix="/runs", tags=["runs"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

class TriggerRunReq(BaseModel):
    scenario_id: str
    seeds: list[int] = [42]

class RunResp(BaseModel):
    id: str
    scenario_id: str
    seed: int
    status: str
    created_at: datetime
    completed_at: datetime | None = None
    error_msg: str | None = None

@router.post("", response_model=list[RunResp])
def trigger_runs(req: TriggerRunReq, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    runs = []
    
    for seed in req.seeds:
        run = repo.create(req.scenario_id, seed)
        runs.append(run)
        job_manager.enqueue(run.id)
        
    return runs

@router.get("/{run_id}", response_model=RunResp)
def get_run(run_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    run = repo.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/{run_id}/metrics")
def get_run_metrics(run_id: str):
    metrics = read_run_kpis(run_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not found")
    return metrics
