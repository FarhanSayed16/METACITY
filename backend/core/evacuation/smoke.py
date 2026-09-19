import numpy as np
from .grid import GridMap

class SmokeCA:
    """
    Cellular Automaton for Smoke Diffusion.
    """
    def __init__(self, grid: GridMap):
        self.grid = grid
        # Density of smoke from 0.0 to 1.0
        self.smoke_density = np.zeros_like(grid.cells, dtype=np.float32)
        
    def add_smoke(self, x: int, y: int, amount: float = 0.5):
        if self.grid.cells[x, y] != 1:
            self.smoke_density[x, y] = min(1.0, self.smoke_density[x, y] + amount)
            
    def step(self, fire_cells: np.ndarray, diffusion_rate: float = 0.1):
        """Advance smoke by one timestep."""
        new_smoke = self.smoke_density.copy()
        
        # Fire generates smoke
        new_smoke[fire_cells] = np.minimum(1.0, new_smoke[fire_cells] + 0.2)
        
        # Diffusion (simplified)
        width, height = self.grid.width, self.grid.height
        for x in range(width):
            for y in range(height):
                if self.grid.cells[x, y] == 1:
                    continue
                
                # Basic Laplacian diffusion
                neighbors = self.grid.get_neighbors(x, y, include_diagonals=False)
                if neighbors:
                    avg_neighbor_smoke = sum(self.smoke_density[nx, ny] for nx, ny in neighbors) / len(neighbors)
                    diff = avg_neighbor_smoke - self.smoke_density[x, y]
                    new_smoke[x, y] = np.clip(self.smoke_density[x, y] + diffusion_rate * diff, 0.0, 1.0)
                    
        self.smoke_density = new_smoke
