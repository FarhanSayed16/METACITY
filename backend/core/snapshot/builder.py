"""Snapshot builder — structured data for live WS streaming."""
from dataclasses import dataclass, field


@dataclass
class SnapshotFrame:
    """A single point-in-time snapshot of simulation state for streaming to UI."""
    run_id: str = ""
    t: int = 0                                # Current minute of day
    progress: float = 0.0                     # 0.0–1.0
    link_metrics: list[dict] = field(default_factory=list)  # [{id, volume, vc, tt_min}]
    agents_sample: list[dict] = field(default_factory=list) # [{id, x, y, mode}] — sampled
    flags: dict = field(default_factory=dict)  # {equilibrium_iter, max_iterations, ...}


def build_snapshot(
    run_id: str,
    current_time: int,
    progress_pct: float,
    link_volumes: dict,
    network,
    iteration: int = 1,
    max_iterations: int = 1,
    max_agents: int = 500
) -> SnapshotFrame:
    """
    Build a rate-limited snapshot frame from current simulation state.
    
    Args:
        run_id: The run identifier.
        current_time: Current minute of day.
        progress_pct: Overall progress 0–100.
        link_volumes: Dict {link_id: current_volume}.
        network: RoadNetwork instance.
        iteration: Current MSA iteration.
        max_iterations: Total MSA iterations.
        max_agents: Max agents to sample (not full dump).
        
    Returns:
        SnapshotFrame ready for JSON serialization.
    """
    link_metrics = []
    for u in network.adj:
        for v, d in network.adj[u].items():
            link_id = d.get("link_id")
            if link_id:
                vol = link_volumes.get(link_id, 0)
                if vol > 0:
                    cap = d.get("capacity", 1000)
                    link_metrics.append({
                        "id": link_id,
                        "volume": vol,
                        "capacity": cap,
                        "vc": vol / max(cap, 1)
                    })
    
    return SnapshotFrame(
        run_id=run_id,
        t=current_time,
        progress=min(100.0, progress_pct),
        link_metrics=link_metrics,
        agents_sample=[],
        flags={
            "iteration": iteration,
            "max_iterations": max_iterations
        }
    )
