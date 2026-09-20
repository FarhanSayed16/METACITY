from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/modules", tags=["modules"])

class ModuleInfo(BaseModel):
    id: str
    name: str
    description: str
    type: str # "macroscopic", "cellular_automata", "des"

@router.get("", response_model=list[ModuleInfo])
def list_modules():
    """
    Returns the simulation modules available in this METACITY deployment.
    """
    return [
        ModuleInfo(
            id="traffic_macro",
            name="Macroscopic Traffic Model",
            description="BPR-based macroscopic equilibrium model for city-scale traffic.",
            type="macroscopic"
        ),
        ModuleInfo(
            id="evacuation_ca",
            name="Evacuation & Fire CA",
            description="Cellular automata based fire propagation and crowd evacuation.",
            type="cellular_automata"
        ),
        ModuleInfo(
            id="hospital_des",
            name="Hospital Surge DES",
            description="Discrete event simulation for hospital capacity and triage queuing.",
            type="des"
        )
    ]
