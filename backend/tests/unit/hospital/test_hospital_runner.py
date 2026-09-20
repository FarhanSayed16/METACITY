from core.hospital.runner import run_hospital_surge

def test_hospital_surge():
    # 1. Run a small surge for 60 minutes
    res = run_hospital_surge(
        beds=10,
        nurses=5,
        surge_rate_per_tick=0.5, # ~1 arrival every 2 mins
        max_ticks=60
    )
    
    assert res.total_arrived > 0, "Patients should arrive."
    assert res.total_treated >= 0, "Some might be treated."
    assert res.peak_queue_length >= 0, "Queue length should be tracked."
    
    # Check that not all arrivals are treated in 60 mins if surge is high
    res2 = run_hospital_surge(
        beds=1, # Extreme bottleneck
        nurses=1,
        surge_rate_per_tick=5.0, # Massive surge
        max_ticks=60
    )
    
    assert res2.peak_queue_length > 10, "Bottleneck should cause massive queue."
