import numpy as np
from .crowd import CrowdModel

class StressModel:
    """
    Computes physiological and psychological stress on agents based on environment.
    """
    def __init__(self, crowd: CrowdModel):
        self.crowd = crowd
        
    def step(self, fire_cells: np.ndarray, smoke_density: np.ndarray):
        """Update stress for all agents."""
        for a in self.crowd.agents:
            if a.escaped:
                continue
                
            # Stress increases based on smoke inhalation
            smoke = smoke_density[a.x, a.y]
            a.stress += smoke * 0.5
            
            # Stress from being near fire
            if fire_cells[a.x, a.y]:
                a.stress += 5.0
                
            # Basic decay
            a.stress = max(0.0, a.stress - 0.05)
