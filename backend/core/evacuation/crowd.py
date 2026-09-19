import numpy as np
from dataclasses import dataclass
from .grid import GridMap

@dataclass
class Agent:
    id: int
    x: int
    y: int
    escaped: bool = False
    stress: float = 0.0

class CrowdModel:
    """
    Agent-based model for crowd evacuation.
    Agents move towards the nearest exit while avoiding obstacles and fire.
    """
    def __init__(self, grid: GridMap):
        self.grid = grid
        self.agents: list[Agent] = []
        # Precompute distance to exits (Static floor field)
        self.dist_field = self._compute_distance_field()
        
    def add_agent(self, x: int, y: int) -> Agent:
        a = Agent(id=len(self.agents), x=x, y=y)
        self.agents.append(a)
        return a
        
    def _compute_distance_field(self) -> np.ndarray:
        # Simple BFS from all exits
        dist = np.full_like(self.grid.cells, 9999, dtype=np.int32)
        queue = []
        for x in range(self.grid.width):
            for y in range(self.grid.height):
                if self.grid.cells[x, y] == 2: # Exit
                    dist[x, y] = 0
                    queue.append((x, y))
                    
        # BFS
        while queue:
            cx, cy = queue.pop(0)
            for nx, ny in self.grid.get_neighbors(cx, cy, include_diagonals=False):
                if self.grid.cells[nx, ny] != 1 and dist[nx, ny] == 9999:
                    dist[nx, ny] = dist[cx, cy] + 1
                    queue.append((nx, ny))
        return dist

    def step(self, fire_cells: np.ndarray):
        """Move agents one step towards exits."""
        # Check occupancy to prevent overlapping agents
        occupied = {(a.x, a.y) for a in self.agents if not a.escaped}
        
        for a in self.agents:
            if a.escaped:
                continue
                
            # If at exit, escape
            if self.grid.cells[a.x, a.y] == 2:
                a.escaped = True
                occupied.discard((a.x, a.y))
                continue
                
            # Find best neighbor
            neighbors = self.grid.get_neighbors(a.x, a.y, include_diagonals=True)
            neighbors.append((a.x, a.y)) # option to stay still
            
            best_n = (a.x, a.y)
            best_score = float('inf')
            
            for nx, ny in neighbors:
                if self.grid.cells[nx, ny] == 1:
                    continue
                if (nx, ny) in occupied and (nx, ny) != (a.x, a.y):
                    continue
                    
                # Score = distance to exit + high penalty if on fire
                score = self.dist_field[nx, ny]
                if fire_cells[nx, ny]:
                    score += 10000
                    
                if score < best_score:
                    best_score = score
                    best_n = (nx, ny)
                    
            if best_n != (a.x, a.y):
                occupied.discard((a.x, a.y))
                a.x, a.y = best_n
                occupied.add((a.x, a.y))
