from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import RunRepository
from comparison.pairing import pair_runs_by_seed
from comparison.statistics import compute_comparison
import sqlite3

router = APIRouter(prefix="/comparisons", tags=["comparisons"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

class CompareReq(BaseModel):
    baseline_scenario_id: str
    target_scenario_id: str

@router.post("")
def compare_scenarios(req: CompareReq, db: sqlite3.Connection = Depends(get_db)):
    repo = RunRepository(db)
    
    baseline_runs = repo.list_by_scenario(req.baseline_scenario_id)
    target_runs = repo.list_by_scenario(req.target_scenario_id)
    
    pairs = pair_runs_by_seed(baseline_runs, target_runs)
    if not pairs:
        raise HTTPException(status_code=400, detail="No matching completed runs with the same seeds found.")
        
    stats = compute_comparison(pairs)
    return stats
