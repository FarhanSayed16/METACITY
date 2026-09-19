from dataclasses import dataclass
from typing import Hashable

@dataclass
class NetworkMetrics:
    total_trips: int
    avg_travel_time_min: float
    total_vmt: float # vehicle miles/meters traveled
    congested_links: list[Hashable]

def compute_kpis(world_state) -> NetworkMetrics:
    """
    Compute key performance indicators at the end of the simulation.
    """
    # For MVP stub
    return NetworkMetrics(
        total_trips=len(world_state.agents),
        avg_travel_time_min=0.0,
        total_vmt=0.0,
        congested_links=[]
    )
