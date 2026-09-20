from fastapi import APIRouter
from pydantic import BaseModel
from core.hospital.runner import run_hospital_surge

router = APIRouter(prefix="/hospital", tags=["hospital"])

class HospitalRunReq(BaseModel):
    beds: int = 100
    nurses: int = 50
    surge_rate: float = 2.0
    max_ticks: int = 1440

class HospitalCompareReq(BaseModel):
    beds_baseline: int = 100
    beds_scenario: int = 150
    nurses: int = 50
    surge_rate: float = 2.0
    max_ticks: int = 1440

@router.post("/run")
def run_hospital_sim(req: HospitalRunReq) -> dict:
    """Run a single hospital surge simulation."""
    res = run_hospital_surge(
        beds=req.beds,
        nurses=req.nurses,
        surge_rate_per_tick=req.surge_rate,
        max_ticks=req.max_ticks
    )
    return {
        "total_arrived": res.total_arrived,
        "total_treated": res.total_treated,
        "peak_queue_length": res.peak_queue_length,
        "avg_queue_length": res.avg_queue_length,
        "queue_history": res.queue_history
    }

@router.post("/compare")
def compare_surge(req: HospitalCompareReq) -> dict:
    """Run two scenarios (different bed counts) and compare results."""
    res_baseline = run_hospital_surge(
        beds=req.beds_baseline,
        nurses=req.nurses,
        surge_rate_per_tick=req.surge_rate,
        max_ticks=req.max_ticks
    )
    
    res_scenario = run_hospital_surge(
        beds=req.beds_scenario,
        nurses=req.nurses,
        surge_rate_per_tick=req.surge_rate,
        max_ticks=req.max_ticks
    )
    
    return {
        "baseline": {
            "total_arrived": res_baseline.total_arrived,
            "total_treated": res_baseline.total_treated,
            "peak_queue_length": res_baseline.peak_queue_length,
            "avg_queue_length": res_baseline.avg_queue_length,
            "queue_history": res_baseline.queue_history
        },
        "scenario": {
            "total_arrived": res_scenario.total_arrived,
            "total_treated": res_scenario.total_treated,
            "peak_queue_length": res_scenario.peak_queue_length,
            "avg_queue_length": res_scenario.avg_queue_length,
            "queue_history": res_scenario.queue_history
        }
    }
