from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from reports.html_builder import generate_comparison_report
from persistence.db import get_db_connection
from persistence.repositories import RunRepository
from comparison.pairing import pair_runs_by_seed
from comparison.statistics import compute_comparison
from comparison.mechanism import trace_mechanisms
from persistence.results_writer import read_run_meta, read_run_kpis, read_run_link_metrics
from persistence.paths import get_data_dir
import sqlite3
import json

router = APIRouter(prefix="/reports", tags=["reports"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

def _screenshots_for_runs(run_ids: list[str]) -> list[dict]:
    """Collect screenshot metas for any of the given run_ids (embedded as data URIs)."""
    shots_dir = get_data_dir() / "screenshots"
    if not shots_dir.exists():
        return []
    wanted = set(run_ids)
    out = []
    import base64
    for meta_path in shots_dir.glob("*.json"):
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        if meta.get("run_id") not in wanted:
            continue
        png_path = shots_dir / f"{meta['id']}.png"
        if not png_path.exists():
            continue
        b64 = base64.b64encode(png_path.read_bytes()).decode("ascii")
        out.append({
            "url": f"data:image/png;base64,{b64}",
            "label": meta.get("label") or meta.get("slot") or "Workspace",
        })
    return out

@router.get("/comparison", response_class=HTMLResponse)
def get_comparison_report(
    baseline_id: str = Query(...), 
    target_id: str = Query(...),
    db: sqlite3.Connection = Depends(get_db)
):
    repo = RunRepository(db)
    
    baseline_runs = repo.list_by_scenario(baseline_id)
    target_runs = repo.list_by_scenario(target_id)
    
    pairs = pair_runs_by_seed(baseline_runs, target_runs)
    if not pairs:
        raise HTTPException(status_code=400, detail="No matching completed runs with the same seeds found.")
        
    stats = compute_comparison(pairs)
    
    b_run, s_run = pairs[0]
    b_meta = read_run_meta(b_run.id)
    b_kpis = read_run_kpis(b_run.id)
    s_kpis = read_run_kpis(s_run.id)
    b_lm = read_run_link_metrics(b_run.id)
    s_lm = read_run_link_metrics(s_run.id)
    
    mechanisms = trace_mechanisms(b_kpis, s_kpis, b_lm, s_lm, top_n=3)
    calibration_status = b_meta.get("calibration_status", "synthetic_uncalibrated")
    model_version = b_meta.get("model_version", "1.0.0")

    run_ids = [r.id for pair in pairs for r in pair]
    screenshots = _screenshots_for_runs(run_ids)
    
    return generate_comparison_report(
        comparison_stats=stats,
        mechanisms=mechanisms,
        calibration_status=calibration_status,
        model_version=model_version,
        seed_count=len(pairs),
        screenshot_urls=screenshots,
    )
