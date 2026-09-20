import random
from core.ml.surrogate import predict

def greedy_search(
    model_path: str,
    base_params: list[float],
    parameter_ranges: list[tuple[float, float]],
    n_candidates: int = 100,
    objective: str = "minimize_travel_time",
) -> list[dict]:
    """
    Generate n_candidates random parameter sets.
    Predict KPIs using surrogate model.
    Sort by objective.
    Return top-10 candidates with predicted KPIs.
    """
    candidates = []
    
    # Generate random parameters within bounds
    for _ in range(n_candidates):
        params = []
        for (min_val, max_val) in parameter_ranges:
            params.append(random.uniform(min_val, max_val))
            
        # Predict KPIs (demand_scale, weather_penalty, capacity_drop)
        # We assume params is a list of 3 floats
        d, w, c = params
        avg_travel_time, avg_vc = predict(model_path, d, w, c)
        kpis = {"avg_travel_time": avg_travel_time, "avg_vc": avg_vc}
        
        candidates.append({
            "parameters": params,
            "predicted_kpis": kpis
        })
        
    # Sort by objective (assuming minimize_travel_time means minimizing kpis["avg_travel_time"])
    if objective == "minimize_travel_time":
        candidates.sort(key=lambda x: x["predicted_kpis"].get("avg_travel_time", float('inf')))
    else:
        # Fallback to random sort if objective not supported
        pass
        
    return candidates[:10]

def hill_climb(
    model_path: str,
    start_params: list[float],
    step_sizes: list[float],
    max_steps: int = 50,
    objective: str = "minimize_travel_time",
) -> dict:
    """
    Simple hill-climbing optimizer:
    1. Start at start_params
    2. For each step: try +/- step_size on each parameter
    3. Move to best neighbor if it improves the objective
    4. Stop if no improvement or max_steps
    Returns: {best_params, predicted_kpis, steps_taken}
    """
    def evaluate(params):
        d, w, c = params
        avg_travel_time, avg_vc = predict(model_path, d, w, c)
        kpis = {"avg_travel_time": avg_travel_time, "avg_vc": avg_vc}
        if objective == "minimize_travel_time":
            return kpis.get("avg_travel_time", float('inf')), kpis
        return 0.0, kpis # Unhandled objective
        
    current_params = list(start_params)
    current_score, current_kpis = evaluate(current_params)
    
    steps = 0
    for _ in range(max_steps):
        best_neighbor = None
        best_neighbor_score = current_score
        
        # Explore neighbors
        for i in range(len(current_params)):
            for direction in [-1, 1]:
                neighbor = list(current_params)
                neighbor[i] += direction * step_sizes[i]
                
                # Check constraints (ensure non-negative parameters typically)
                if neighbor[i] < 0:
                    neighbor[i] = 0
                    
                score, _ = evaluate(neighbor)
                if score < best_neighbor_score:
                    best_neighbor_score = score
                    best_neighbor = neighbor
                    
        if best_neighbor is None:
            # Local minima reached
            break
            
        current_params = best_neighbor
        current_score = best_neighbor_score
        steps += 1
        
    _, final_kpis = evaluate(current_params)
    return {
        "best_params": current_params,
        "predicted_kpis": final_kpis,
        "steps_taken": steps
    }
