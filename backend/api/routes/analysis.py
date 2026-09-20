"""Analysis endpoints: multi-year, sensitivity sweep, warm-start compare."""
import json
import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from core.schema.scene import Scene
from core.config import SimConfig
from core.runner import run_replication
from core.multi_year_runner import run_multi_year
from jobs.sweeper import sweep_parameters

router = APIRouter(prefix="/projects", tags=["analysis"])


def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def _load_scene(project_id: str, db: sqlite3.Connection) -> Scene:
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        with open(proj.scene_json_path, "r", encoding="utf-8") as f:
            return Scene.model_validate(json.load(f))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load scene: {e}")


class MultiYearReq(BaseModel):
    years: int = Field(default=3, ge=1, le=10)
    shift_rate: float = Field(default=0.05, ge=0.0, le=0.5)
    seed: int = 42


@router.post("/{project_id}/multi-year")
def multi_year(project_id: str, req: MultiYearReq, db: sqlite3.Connection = Depends(get_db)):
    scene = _load_scene(project_id, db)
    # Cap years for interactive API responsiveness
    result = run_multi_year(scene, years=req.years, shift_rate=req.shift_rate, seed=req.seed)
    return {"history": result.get("history", []), "years": req.years}


class SweepReq(BaseModel):
    param_name: str = "demand_scale"
    values: list[float] = [0.75, 1.0, 1.25]
    base_diff_ops: list[dict] = []
    seed: int = 42
    msa_max_iter: int = 5


@router.post("/{project_id}/sweep")
def sensitivity_sweep(project_id: str, req: SweepReq, db: sqlite3.Connection = Depends(get_db)):
    scene = _load_scene(project_id, db)
    try:
        results = sweep_parameters(
            scene,
            req.base_diff_ops,
            req.param_name,
            req.values,
            seed=req.seed,
            msa_max_iter=req.msa_max_iter,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"param_name": req.param_name, "results": results}


class WarmStartReq(BaseModel):
    seed: int = 42
    msa_max_iter: int = 10


@router.post("/{project_id}/warm-start-compare")
def warm_start_compare(project_id: str, req: WarmStartReq, db: sqlite3.Connection = Depends(get_db)):
    """
    Run the same scene cold vs warm-started from cold link travel times.
    Returns iteration/gap comparison for honesty checks.
    """
    scene = _load_scene(project_id, db)
    config = SimConfig(msa_max_iter=req.msa_max_iter)

    cold = run_replication(f"warm_cold_{project_id}", scene, config, seed=req.seed)
    initial_costs = {}
    for lm in cold.link_metrics:
        lid = lm.get("id")
        if lid is not None and "travel_time" in lm:
            initial_costs[lid] = lm["travel_time"]

    warm = run_replication(
        f"warm_warm_{project_id}",
        scene,
        config,
        seed=req.seed,
        initial_costs=initial_costs or None,
    )

    return {
        "cold": {
            "final_gap": cold.final_gap,
            "iterations": cold.iterations,
            "avg_travel_time_mins": cold.average_travel_time_mins,
            "converged": cold.converged,
        },
        "warm": {
            "final_gap": warm.final_gap,
            "iterations": warm.iterations,
            "avg_travel_time_mins": warm.average_travel_time_mins,
            "converged": warm.converged,
        },
        "links_seeded": len(initial_costs),
    }
