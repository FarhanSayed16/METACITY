from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import RunRepository
from comparison.pairing import pair_runs_by_seed
from comparison.statistics import compute_comparison
from comparison.mechanism import trace_mechanisms
from persistence.results_writer import read_run_meta, read_run_kpis, read_run_link_metrics
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
    
    # MP-21 Mechanism Trace & Trust Badge (just pick the first paired seed for mechanism trace for MVP)
    b_run, s_run = pairs[0]
    b_meta = read_run_meta(b_run.id)
    b_kpis = read_run_kpis(b_run.id)
    s_kpis = read_run_kpis(s_run.id)
    b_lm = read_run_link_metrics(b_run.id)
    s_lm = read_run_link_metrics(s_run.id)
    
    mechanisms = trace_mechanisms(b_kpis, s_kpis, b_lm, s_lm, top_n=3)

    isolation_delta = None
    if "isolation_ratio" in b_kpis or "isolation_ratio" in s_kpis:
        isolation_delta = {
            "baseline_isolation_ratio": b_kpis.get("isolation_ratio"),
            "target_isolation_ratio": s_kpis.get("isolation_ratio"),
            "delta_isolation_ratio": (
                (s_kpis.get("isolation_ratio") or 0) - (b_kpis.get("isolation_ratio") or 0)
            ),
            "baseline_isolated_nodes": b_kpis.get("isolated_node_count"),
            "target_isolated_nodes": s_kpis.get("isolated_node_count"),
        }
    
    return {
        "statistics": stats,
        "mechanisms": mechanisms,
        "calibration_status": b_meta.get("calibration_status", "synthetic_uncalibrated"),
        "isolation_delta": isolation_delta,
    }
