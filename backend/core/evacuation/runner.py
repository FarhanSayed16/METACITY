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

def run_evacuation(grid: GridMap, fire_starts: list[tuple[int, int]], agent_starts: list[tuple[int, int]], max_ticks: int = 1000) -> EvacuationResult:
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
        
    tick = 0
    while tick < max_ticks:
        # Step components
        fire.step()
        smoke.step(fire.fire_cells)
        crowd.step(fire.fire_cells)
        stress.step(fire.fire_cells, smoke.smoke_density)
        
        # Check completion
        if all(a.escaped for a in crowd.agents):
            break
            
        tick += 1
        
    escaped = sum(1 for a in crowd.agents if a.escaped)
    avg_stress = sum(a.stress for a in crowd.agents) / max(1, len(crowd.agents))
    fire_count = int(fire.fire_cells.sum())
    
    return EvacuationResult(
        ticks=tick,
        escaped_count=escaped,
        total_agents=len(crowd.agents),
        avg_stress=avg_stress,
        total_fire_cells=fire_count
    )
