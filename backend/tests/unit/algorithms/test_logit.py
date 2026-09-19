import numpy as np
from core.algorithms.logit import multinomial_logit_probs

def test_logit_equal_utilities():
    u = np.array([10.0, 10.0, 10.0])
    probs = multinomial_logit_probs(u, theta=1.0)
    assert np.allclose(probs, [1/3, 1/3, 1/3])

def test_logit_dominant_utility():
    u = np.array([10.0, 1.0])
    probs = multinomial_logit_probs(u, theta=1.0)
    assert probs[0] > 0.999
