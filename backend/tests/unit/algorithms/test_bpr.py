import numpy as np
from core.algorithms.bpr import bpr_delay

def test_bpr_scalar():
    # V/C = 0 -> delay = free flow
    assert bpr_delay(10.0, 0.0, 1000.0) == 10.0
    
    # V/C = 1 -> delay = t0 * (1 + 0.15) = 11.5
    assert bpr_delay(10.0, 1000.0, 1000.0) == 11.5
    
def test_bpr_vector():
    ff = np.array([10.0, 20.0])
    v = np.array([0.0, 1000.0])
    c = np.array([1000.0, 1000.0])
    
    res = bpr_delay(ff, v, c)
    assert np.allclose(res, [10.0, 23.0])
