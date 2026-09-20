"""Congestion update — compute congested travel times using BPR."""
from core.algorithms.bpr import bpr_travel_time
from core.config import SimConfig


def update_congested_times(
    network,
    volumes: dict[str, float],
    config: SimConfig
) -> dict[str, float]:
    """
    Compute congested travel times for all links given current volumes.
    
    Args:
        network: RoadNetwork instance.
        volumes: Dict {link_id: volume}.
        config: SimConfig with bpr_alpha and bpr_beta.
        
    Returns:
        Dict {link_id: congested_travel_time_minutes}.
    """
    congested: dict[str, float] = {}
    
    for u in network.adj:
        for v, d in network.adj[u].items():
            link_id = d.get("link_id")
            if link_id:
                fft = d.get("free_flow_time_m", 1.0)
                cap = d.get("capacity", 1000)
                vol = volumes.get(link_id, 0)
                
                congested[link_id] = bpr_travel_time(
                    free_flow_time=fft,
                    volume=vol,
                    capacity=cap,
                    alpha=config.bpr_alpha,
                    beta=config.bpr_beta
                )
                
    return congested
