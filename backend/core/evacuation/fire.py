import numpy as np
from .grid import GridMap

class FireCA:
    """
    Cellular Automaton for Fire Propagation.
    """
    def __init__(self, grid: GridMap):
        self.grid = grid
        self.fire_cells = np.zeros_like(grid.cells, dtype=np.bool_)
        
    def ignite(self, x: int, y: int):
        if self.grid.cells[x, y] != 1: # Can't ignite walls for MVP
            self.fire_cells[x, y] = True
            
    def step(self, spread_prob: float = 0.1, wind_vector: tuple[float, float] = (0.0, 0.0)):
        """Advance fire by one timestep."""
        new_fire = self.fire_cells.copy()
        
        # In MVP, very naive loop. In production, vectorize with scipy.ndimage.convolve
        width, height = self.grid.width, self.grid.height
        for x in range(width):
            for y in range(height):
                if self.fire_cells[x, y]:
                    for nx, ny in self.grid.get_neighbors(x, y, include_diagonals=False):
                        if self.grid.cells[nx, ny] != 1 and not self.fire_cells[nx, ny]:
                            # Apply wind bias
                            dx = nx - x
                            dy = ny - y
                            bias = 1.0 + (dx * wind_vector[0] + dy * wind_vector[1])
                            prob = spread_prob * max(0.1, bias)
                            
                            if np.random.random() < prob:
                                new_fire[nx, ny] = True
                                
        self.fire_cells = new_fire
