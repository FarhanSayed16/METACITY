import numpy as np
from persistence.results_writer import read_run_kpis
from core.algorithms.stats_paired import paired_t_test

def compute_comparison(pairs: list[tuple]) -> dict:
    """
    Given pairs of (baseline_run, scenario_run), fetch their KPIs,
    and compute statistical differences.
    """
    baseline_tt = []
    scenario_tt = []
    
    baseline_trips = []
    scenario_trips = []
    
    for b_run, s_run in pairs:
        b_kpis = read_run_kpis(b_run.id)
        s_kpis = read_run_kpis(s_run.id)
        
        if b_kpis and s_kpis:
            baseline_tt.append(b_kpis["avg_travel_time_min"])
            scenario_tt.append(s_kpis["avg_travel_time_min"])
            
            baseline_trips.append(b_kpis["total_trips"])
            scenario_trips.append(s_kpis["total_trips"])
            
    if not baseline_tt:
        return {"error": "No KPI data available for paired runs."}
        
    tt_stats = paired_t_test(np.array(baseline_tt), np.array(scenario_tt))
    trips_stats = paired_t_test(np.array(baseline_trips), np.array(scenario_trips))
    
    return {
        "samples": len(baseline_tt),
        "travel_time": {
            "baseline_mean": float(np.mean(baseline_tt)),
            "scenario_mean": float(np.mean(scenario_tt)),
            "diff_mean": tt_stats["mean_diff"],
            "significant": tt_stats["significant"],
            "p_value": tt_stats["p_value"]
        },
        "trips": {
            "baseline_mean": float(np.mean(baseline_trips)),
            "scenario_mean": float(np.mean(scenario_trips)),
            "diff_mean": trips_stats["mean_diff"],
            "significant": trips_stats["significant"],
            "p_value": trips_stats["p_value"]
        }
    }
