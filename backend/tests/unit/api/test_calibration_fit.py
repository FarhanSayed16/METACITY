"""Wave C: calibration fit helper."""
from core.calibration.engine import suggest_demand_scale, evaluate_calibration


def test_suggest_demand_scale():
    sim = {"L1": 100.0, "L2": 200.0}
    obs = {"L1": 150.0, "L2": 300.0}
    scale = suggest_demand_scale(sim, obs)
    assert abs(scale - 1.5) < 1e-6


def test_suggest_demand_scale_clamped():
    sim = {"L1": 10.0}
    obs = {"L1": 1000.0}
    scale = suggest_demand_scale(sim, obs, clamp_max=2.0)
    assert scale == 2.0


def test_evaluate_still_works():
    report = evaluate_calibration({"A": 100}, {"A": 105})
    assert "geh_avg" in report
    assert "status" in report
