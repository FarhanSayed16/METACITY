from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sqlite3
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from core.schema.scene import Scene
from core.ml.surrogate import predict
from core.ml.planner import greedy_search, hill_climb
from core.ml.verifier import verify_top_candidates
import json

router = APIRouter(prefix="/planner", tags=["planner"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

class SearchReq(BaseModel):
    objective: str = "minimize_travel_time"
    n_candidates: int = 10
    
class VerifyReq(BaseModel):
    candidates: list[dict]
    top_n: int = 3
    seeds: list[int] = [42]

@router.post("/{project_id}/search")
def search_candidates(project_id: str, req: SearchReq, db: sqlite3.Connection = Depends(get_db)):
    """Run greedy search using surrogate model. Returns top candidates."""
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    model_path = "data/surrogate.pth"
    
    # Planner params = [demand_scale, weather_penalty, capacity_drop]
    ranges = [(0.5, 1.5), (0.5, 1.0), (0.0, 0.3)]
    
    try:
        candidates = greedy_search(
            model_path=model_path,
            base_params=[1.0, 1.0, 0.0],
            parameter_ranges=ranges,
            n_candidates=req.n_candidates,
            objective=req.objective
        )
        return {"candidates": candidates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/verify")
def verify_candidate(project_id: str, req: VerifyReq, db: sqlite3.Connection = Depends(get_db)):
    """Run full simulation to verify surrogate-predicted candidates."""
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    try:
        with open(proj.scene_json_path, "r", encoding="utf-8") as f:
            scene_data = json.load(f)
        scene = Scene(**scene_data)
        
        verified = verify_top_candidates(
            candidates=req.candidates,
            scene=scene,
            top_n=req.top_n,
            seeds=req.seeds
        )
        return {"verified_candidates": verified}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
