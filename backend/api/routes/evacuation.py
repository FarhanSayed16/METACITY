from fastapi import APIRouter
from pydantic import BaseModel
from core.evacuation.runner import run_evacuation, EvacuationResult
from core.evacuation.grid import GridMap

router = APIRouter(prefix="/evacuation", tags=["evacuation"])

class Coord(BaseModel):
    x: int
    y: int

class EvacuationRunReq(BaseModel):
    width: int = 50
    height: int = 50
    fire_starts: list[Coord] = []
    agent_starts: list[Coord] = []
    wall_cells: list[Coord] = []
    exit_cells: list[Coord] = []
    max_ticks: int = 500
    spread_prob: float = 0.1

@router.post("/run")
def run_evacuation_sim(req: EvacuationRunReq) -> dict:
    """Run a fire evacuation simulation and return results."""
    grid = GridMap.create_empty(req.width, req.height)
    
    # Place walls
    for w in req.wall_cells:
        if 0 <= w.x < req.width and 0 <= w.y < req.height:
            grid.set_cell(w.x, w.y, 1) # 1 = wall
            
    # Place exits
    for e in req.exit_cells:
        if 0 <= e.x < req.width and 0 <= e.y < req.height:
            grid.set_cell(e.x, e.y, 2) # 2 = exit
            
    fire_starts = [(f.x, f.y) for f in req.fire_starts if 0 <= f.x < req.width and 0 <= f.y < req.height]
    agent_starts = [(a.x, a.y) for a in req.agent_starts if 0 <= a.x < req.width and 0 <= a.y < req.height]
    
    result = run_evacuation(
        grid=grid,
        fire_starts=fire_starts,
        agent_starts=agent_starts,
        max_ticks=req.max_ticks,
        spread_prob=req.spread_prob
    )
    
    return {
        "ticks": result.ticks,
        "escaped_count": result.escaped_count,
        "trapped_count": result.trapped_count,
        "total_agents": result.total_agents,
        "avg_stress": result.avg_stress,
        "total_fire_cells": result.total_fire_cells,
        "bottleneck_cells": result.bottleneck_cells,
        "history": result.history
    }

@router.post("/run/template/{template_name}")
def run_from_template(template_name: str):
    """Load a campus template and run evacuation with default fire/agent positions."""
    if template_name != "campus":
        return {"error": "Unknown template"}
        
    width, height = 50, 50
    req = EvacuationRunReq(
        width=width,
        height=height,
        max_ticks=500,
        spread_prob=0.1
    )
    
    # Outer walls
    for x in range(width):
        req.wall_cells.append(Coord(x=x, y=0))
        req.wall_cells.append(Coord(x=x, y=height-1))
    for y in range(height):
        req.wall_cells.append(Coord(x=0, y=y))
        req.wall_cells.append(Coord(x=width-1, y=y))
        
    # Internal walls (simple rooms)
    for x in range(10, 40):
        if x != 25: # Doorway
            req.wall_cells.append(Coord(x=x, y=20))
            
    for y in range(1, 20):
        if y != 10: # Doorway
            req.wall_cells.append(Coord(x=25, y=y))
            
    # Exits
    req.exit_cells.append(Coord(x=25, y=0))
    req.exit_cells.append(Coord(x=25, y=height-1))
    
    # Fire start
    req.fire_starts.append(Coord(x=5, y=5))
    
    # Agent starts
    import random
    random.seed(42)
    for _ in range(50):
        rx = random.randint(10, 40)
        ry = random.randint(25, 45)
        req.agent_starts.append(Coord(x=rx, y=ry))
        
    return run_evacuation_sim(req)
