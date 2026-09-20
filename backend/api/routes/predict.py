from fastapi import APIRouter
from pydantic import BaseModel
from core.ml.surrogate import predict

router = APIRouter(prefix="/predict", tags=["predict"])

class PredictRequest(BaseModel):
    demand_scale: float = 1.0
    weather_penalty: float = 1.0
    capacity_drop: float = 0.0

@router.post("/surrogate")
def predict_kpis(req: PredictRequest):
    """
    Instantly predict traffic KPIs using the PyTorch surrogate model.
    Bypasses the physics simulation entirely.
    """
    model_path = "data/surrogate.pth"
    total_flow, avg_speed = predict(
        model_path, 
        req.demand_scale, 
        req.weather_penalty, 
        req.capacity_drop
    )
    
    return {
        "predicted_total_trips": total_flow,
        "predicted_avg_travel_time_min": avg_speed,
        "status": "success" if total_flow > 0 else "untrained"
    }
