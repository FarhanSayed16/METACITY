import numpy as np
from core.algorithms.stats_paired import paired_t_test

def test_paired_t_test_significant():
    s1 = np.array([10, 12, 11, 10, 11])
    s2 = np.array([15, 17, 16, 14, 15])
    
    res = paired_t_test(s1, s2)
    assert res["significant"] is True
    assert res["mean_diff"] > 0
    assert res["p_value"] < 0.05

def test_paired_t_test_identical():
    s1 = np.array([10, 12, 11, 10, 11])
    res = paired_t_test(s1, s1)
    assert res["significant"] is False
    assert res["mean_diff"] == 0.0
    assert res["p_value"] == 1.0
