from core.metrics.citizen_impact import citizen_day_blurb, compute_citizen_impact


def test_empty_trips_zero_scores():
    out = compute_citizen_impact([])
    assert out["stress_index"] == 0.0
    assert out["impatience_index"] == 0.0
    assert out["people_delayed"] == 0


def test_long_trips_raise_stress():
    short = compute_citizen_impact([10.0, 12.0, 11.0])
    long = compute_citizen_impact([40.0, 45.0, 50.0])
    assert long["stress_index"] > short["stress_index"]
    assert long["people_delayed"] == 3
    assert long["pct_trips_over_threshold"] == 1.0


def test_citizen_day_blurb_improvement():
    text = citizen_day_blurb(
        {"stress_index": 40, "average_travel_time_mins": 25},
        {"stress_index": 30, "average_travel_time_mins": 18},
    )
    assert "faster" in text.lower() or "falls" in text.lower()
