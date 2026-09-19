import numpy as np
from typing import Union

def bpr_delay(
    free_flow_time: Union[float, np.ndarray], 
    volume: Union[float, np.ndarray], 
    capacity: Union[float, np.ndarray], 
    alpha: float = 0.15, 
    beta: float = 4.0
) -> Union[float, np.ndarray]:
    """
    Calculate link travel time using the Bureau of Public Roads (BPR) function.
    
    t = t0 * (1 + alpha * (V/C)^beta)
    
    Can handle scalar values or numpy arrays for vectorized calculations.
    """
    # Add small epsilon to capacity to prevent division by zero
    c = np.maximum(capacity, 1e-9) if isinstance(capacity, np.ndarray) else max(capacity, 1e-9)
    
    v_c_ratio = volume / c
    return free_flow_time * (1.0 + alpha * (v_c_ratio ** beta))
