from comparison.statistics import compute_comparison
from persistence.models import Run
import pytest

# Dummy mock for read_run_kpis
import comparison.statistics
import numpy as np

def test_compute_comparison(monkeypatch):
    # Mock read_run_kpis
    def mock_read_run_kpis(run_id: str):
        if "base" in run_id:
            # Baseline KPIs
            return {
                "average_travel_time_mins": 25.0 + float(run_id[-1]), 
                "total_trips_completed": 1000
            }
        else:
            # Scenario KPIs
            return {
                "average_travel_time_mins": 20.0 + float(run_id[-1]),
                "total_trips_completed": 1050
            }
            
    monkeypatch.setattr(comparison.statistics, "read_run_kpis", mock_read_run_kpis)
    
    from datetime import datetime, timezone
    
    # Create mock runs
    b_runs = [Run(id=f"base_1", scenario_id="b", seed=1, status="completed", created_at=datetime.now(timezone.utc)),
              Run(id=f"base_2", scenario_id="b", seed=2, status="completed", created_at=datetime.now(timezone.utc))]
    s_runs = [Run(id=f"scen_1", scenario_id="s", seed=1, status="completed", created_at=datetime.now(timezone.utc)),
              Run(id=f"scen_2", scenario_id="s", seed=2, status="completed", created_at=datetime.now(timezone.utc))]
              
    pairs = [(b_runs[0], s_runs[0]), (b_runs[1], s_runs[1])]
    
    stats = compute_comparison(pairs)
    
    assert "error" not in stats
    assert stats["samples"] == 2
    assert stats["travel_time"]["diff_mean"] == -5.0
    assert "ci_lower" in stats["travel_time"]
    assert "ci_upper" in stats["travel_time"]
    assert stats["travel_time"]["ci_lower"] <= stats["travel_time"]["diff_mean"] <= stats["travel_time"]["ci_upper"]

def test_compute_comparison_empty():
    stats = compute_comparison([])
    assert "error" in stats
