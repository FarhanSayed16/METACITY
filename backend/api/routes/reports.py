from fastapi import APIRouter
from reports.html_builder import generate_comparison_report
from fastapi.responses import HTMLResponse

# Usually you'd fetch the comparison result from the DB here
# For the stub, we just return a simple formatted string
router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/{comparison_id}", response_class=HTMLResponse)
def get_report(comparison_id: str):
    dummy_stats = {
        "samples": 3,
        "travel_time": {
            "baseline_mean": 15.2,
            "scenario_mean": 14.1,
            "diff_mean": -1.1,
            "significant": True,
            "p_value": 0.03
        }
    }
    return generate_comparison_report(dummy_stats)
