from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import RunRepository
from persistence.results_writer import read_run_kpis, read_run_meta
from jobs.manager import job_manager
import sqlite3

router = APIRouter(tags=["runs"])

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

class ProjectRunResp(BaseModel):
    id: str
    scenario_id: str
    scenario_name: str | None = None
    seed: int
    status: str
    created_at: datetime
    completed_at: datetime | None = None
    error_msg: str | None = None
    final_gap: float | None = None
    iterations: int | None = None
    converged: bool | None = None

@router.post("/runs", response_model=list[RunResp])
def trigger_runs(req: TriggerRunReq, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    runs = []
    
    for seed in req.seeds:
        run = repo.create(req.scenario_id, seed)
        runs.append(run)
        job_manager.enqueue(run.id)
        
    return runs

@router.get("/projects/{project_id}/runs", response_model=list[ProjectRunResp])
def list_project_runs(project_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    rows = repo.list_by_project(project_id)
    out = []
    for row in rows:
        meta = read_run_meta(row["id"]) if row.get("status") == "completed" else {}
        out.append(ProjectRunResp(
            id=row["id"],
            scenario_id=row["scenario_id"],
            scenario_name=row.get("scenario_name"),
            seed=row["seed"],
            status=row["status"],
            created_at=row["created_at"],
            completed_at=row.get("completed_at"),
            error_msg=row.get("error_msg"),
            final_gap=meta.get("final_gap"),
            iterations=meta.get("iterations"),
            converged=meta.get("converged"),
        ))
    return out

@router.get("/runs/{run_id}", response_model=RunResp)
def get_run(run_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    run = repo.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/runs/{run_id}/meta")
def get_run_meta(run_id: str):
    meta = read_run_meta(run_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Run meta not found")
    return meta

@router.post("/runs/{run_id}/retry", response_model=RunResp)
def retry_run(run_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    run = repo.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    if run.status not in ("error", "interrupted"):
        raise HTTPException(status_code=400, detail=f"Cannot retry run in state: {run.status}")
        
    repo.update_status(run_id, "pending")
    job_manager.enqueue(run_id)
    return repo.get(run_id)

@router.get("/runs/{run_id}/metrics")
def get_run_metrics(run_id: str):
    metrics = read_run_kpis(run_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not found")
    return metrics
