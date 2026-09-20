"""Tests for AM/PM demand profile sampling in daily plans."""
import numpy as np
from core.activity.plans import generate_daily_plan
from core.population.demand_profiles import (
    DEMAND_PROFILES,
    classify_departure_period,
    get_departure_time,
    sample_profile,
)


def test_get_departure_time_within_window():
    rng = np.random.default_rng(42)
    for _ in range(50):
        t = get_departure_time("am_peak", rng)
        assert 0 <= t < 1440
        # Allow Gaussian tails but most mass near AM peak
        assert 5 * 60 <= t <= 11 * 60


def test_sample_profile_returns_known_name():
    rng = np.random.default_rng(0)
    for _ in range(20):
        name = sample_profile(rng)
        assert name in DEMAND_PROFILES


def test_worker_plan_samples_am_and_pm_peaks():
    """Outbound leave times should cluster in AM; returns in PM — not fixed constants."""
    leaves = []
    returns = []
    for seed in range(40):
        rng = np.random.default_rng(seed)
        plan = generate_daily_plan("worker", rng)
        assert len(plan) >= 3
        leave = plan[1].start_time_min
        ret = plan[2].start_time_min
        leaves.append(leave)
        returns.append(ret)

    # Mean leave in morning window
    mean_leave = sum(leaves) / len(leaves)
    assert 6 * 60 <= mean_leave <= 10 * 60

    # Mean return in afternoon/evening
    mean_return = sum(returns) / len(returns)
    assert 14 * 60 <= mean_return <= 21 * 60

    # Not all identical (was hardcoded before Wave D)
    assert len(set(leaves)) > 5
    assert len(set(returns)) > 5


def test_classify_departure_period():
    assert classify_departure_period(8 * 60) == "am_peak"
    assert classify_departure_period(12 * 60) == "midday"
    assert classify_departure_period(17 * 60) == "pm_peak"
    assert classify_departure_period(20 * 60) == "evening"
    assert classify_departure_period(2 * 60) == "off_peak"


def test_stay_home_has_no_travel():
    plan = generate_daily_plan("stay_home", np.random.default_rng(1))
    assert len(plan) == 1
    assert plan[0].type == "home"
    assert plan[0].duration_min == 1440
