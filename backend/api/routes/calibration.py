import json
import sqlite3
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from core.schema.scene import Scene
from core.runner import run_replication
from core.config import SimConfig
from core.calibration.engine import evaluate_calibration, suggest_demand_scale
from core.scenarios.applier import apply_scenario

router = APIRouter(prefix="/projects", tags=["calibration"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

class CalibrationRequest(BaseModel):
    observed_counts: dict[str, float]
    fit: bool = False

@router.post("/{project_id}/calibrate")
def run_calibration(
    project_id: str,
    req: CalibrationRequest,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Evaluate calibration (GEH/RMSE). When fit=true, suggest a demand scale,
    re-run once with that scale, and return before/after reports (does not
    persist scene mutations — caller decides whether to apply).
    """
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    try:
        with open(proj.scene_json_path, "r", encoding="utf-8") as f:
            scene_data = json.load(f)
        scene = Scene.model_validate(scene_data)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load scene data")
        
    config = SimConfig(msa_max_iter=1)
    try:
        result = run_replication("calibration_run", scene, config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")
        
    simulated_flows = {}
    for lm in result.link_metrics:
        simulated_flows[lm["id"]] = lm["volume"]
        
    report = evaluate_calibration(simulated_flows, req.observed_counts)
    repo.update_calibration_status(project_id, report["status"])

    response = {"report": report, **report}

    if req.fit:
        scale = suggest_demand_scale(simulated_flows, req.observed_counts)
        fitted_scene = apply_scenario(
            scene, [{"type": "global_demand_scale", "data": {"scale": scale}}]
        )
        try:
            fitted = run_replication("calibration_fit", fitted_scene, config)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Fit simulation failed: {e}")
        fitted_flows = {lm["id"]: lm["volume"] for lm in fitted.link_metrics}
        after = evaluate_calibration(fitted_flows, req.observed_counts)
        response.update({
            "suggested_scale": scale,
            "after_fit_report": after,
            "note": "Scene not persisted; apply global_demand_scale manually if desired.",
        })
    
    return response
