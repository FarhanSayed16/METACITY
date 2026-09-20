from dataclasses import dataclass
from .grid import GridMap
from .fire import FireCA
from .smoke import SmokeCA
from .crowd import CrowdModel
from .stress import StressModel

@dataclass
class EvacuationResult:
    ticks: int
    escaped_count: int
    total_agents: int
    avg_stress: float
    total_fire_cells: int
    history: list[dict]
    trapped_count: int = 0
    bottleneck_cells: list[dict] = None

    def __post_init__(self):
        if self.bottleneck_cells is None:
            self.bottleneck_cells = []


def run_evacuation(
    grid: GridMap, 
    fire_starts: list[tuple[int, int]], 
    agent_starts: list[tuple[int, int]], 
    max_ticks: int = 1000,
    spread_prob: float = 0.1
) -> EvacuationResult:
    """
    Main loop for evacuation simulation.
    """
    fire = FireCA(grid)
    smoke = SmokeCA(grid)
    crowd = CrowdModel(grid)
    stress = StressModel(crowd)
    
    for fx, fy in fire_starts:
        fire.ignite(fx, fy)
        
    for ax, ay in agent_starts:
        crowd.add_agent(ax, ay)
        
    history = []
    occupancy_peak: dict[tuple[int, int], int] = {}
    
    tick = 0
    while tick < max_ticks:
        fire.step(spread_prob=spread_prob)
        smoke.step(fire.fire_cells)
        crowd.step(fire.fire_cells)
        stress.step(fire.fire_cells, smoke.smoke_density)
        
        import numpy as np
        fire_coords = np.argwhere(fire.fire_cells).tolist()
        smoke_coords = np.argwhere(smoke.smoke_density > 0.1).tolist()
        agent_data = [{"id": a.id, "x": int(a.x), "y": int(a.y), "escaped": a.escaped} for a in crowd.agents]
        
        # Peak occupancy for bottleneck detection (non-escaped agents)
        cell_counts: dict[tuple[int, int], int] = {}
        for a in crowd.agents:
            if a.escaped:
                continue
            key = (int(a.x), int(a.y))
            cell_counts[key] = cell_counts.get(key, 0) + 1
        for key, count in cell_counts.items():
            occupancy_peak[key] = max(occupancy_peak.get(key, 0), count)

        history.append({
            "tick": tick,
            "fire": fire_coords,
            "smoke": smoke_coords,
            "agents": agent_data
        })
        
        if all(a.escaped for a in crowd.agents):
            break
            
        tick += 1
        
    escaped = sum(1 for a in crowd.agents if a.escaped)
    trapped = len(crowd.agents) - escaped
    avg_stress = sum(a.stress for a in crowd.agents) / max(1, len(crowd.agents))
    fire_count = int(fire.fire_cells.sum())

    bottlenecks = sorted(
        [{"x": x, "y": y, "peak_occupancy": peak} for (x, y), peak in occupancy_peak.items() if peak >= 2],
        key=lambda d: d["peak_occupancy"],
        reverse=True,
    )[:10]
    
    return EvacuationResult(
        ticks=tick,
        escaped_count=escaped,
        total_agents=len(crowd.agents),
        avg_stress=avg_stress,
        total_fire_cells=fire_count,
        history=history,
        trapped_count=trapped,
        bottleneck_cells=bottlenecks,
    )
