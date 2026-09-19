from persistence.models import Run

def pair_runs_by_seed(baseline_runs: list[Run], scenario_runs: list[Run]) -> list[tuple[Run, Run]]:
    """
    Match a list of baseline runs to scenario runs by random seed.
    Returns a list of tuples (baseline_run, scenario_run).
    """
    baseline_by_seed = {r.seed: r for r in baseline_runs if r.status == "completed"}
    scenario_by_seed = {r.seed: r for r in scenario_runs if r.status == "completed"}
    
    pairs = []
    # Find intersecting seeds
    common_seeds = set(baseline_by_seed.keys()) & set(scenario_by_seed.keys())
    
    for seed in sorted(common_seeds):
        pairs.append((baseline_by_seed[seed], scenario_by_seed[seed]))
        
    return pairs
