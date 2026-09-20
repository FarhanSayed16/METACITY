import numpy as np
import scipy.ndimage as ndimage
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
        """Advance fire by one timestep using 2D matrix convolution."""
        
        # 1. Identify non-flammable cells (walls)
        walls = (self.grid.cells == 1)
        
        # 2. Define convolution kernel for neighbors
        # A simple von Neumann neighborhood (up, down, left, right)
        kernel = np.array([
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ], dtype=float)
        
        # 3. Calculate number of burning neighbors for each cell
        fire_float = self.fire_cells.astype(float)
        neighbor_fire = ndimage.convolve(fire_float, kernel, mode='constant', cval=0.0)
        
        # 4. Generate a random matrix
        random_grid = np.random.random(self.fire_cells.shape)
        
        # 5. Base ignition probability based on neighbor count
        ignition_chance = spread_prob * neighbor_fire
        
        # 6. Find cells that catch fire this turn
        # Must have at least one burning neighbor, beat the random threshold, not already on fire, and not be a wall
        new_ignitions = (random_grid < ignition_chance) & (~self.fire_cells) & (~walls)
        
        # 7. Update state
        self.fire_cells = self.fire_cells | new_ignitions
