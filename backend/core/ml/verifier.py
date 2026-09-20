"""Verify surrogate planner candidates with full simulation replications."""
from core.schema.scene import Scene
from core.config import SimConfig
from core.runner import run_replication


def _apply_candidate_params(scene: Scene, params: list[float]) -> Scene:
    """
    Apply planner params [demand_scale, weather_penalty, capacity_drop]
    onto a deep-copied scene (same semantics as ml/dataset_gen.py).
    """
    mutated = Scene.model_validate(scene.model_dump())
    demand_scale = float(params[0]) if len(params) > 0 else 1.0
    weather_penalty = float(params[1]) if len(params) > 1 else 1.0
    capacity_drop = float(params[2]) if len(params) > 2 else 0.0

    # Clamp to sane ranges so malformed candidates cannot zero the city
    demand_scale = max(0.1, min(demand_scale, 3.0))
    weather_penalty = max(0.1, min(weather_penalty, 1.5))
    capacity_drop = max(0.0, min(capacity_drop, 0.9))

    mutated.parameters.total_population = max(
        1, int(mutated.parameters.total_population * demand_scale)
    )
    for link in mutated.links:
        link.capacity_per_lane_per_hour = max(
            0, int(link.capacity_per_lane_per_hour * (1.0 - capacity_drop))
        )
        link.speed_kph = max(1.0, link.speed_kph * weather_penalty)
    return mutated


def verify_top_candidates(
    candidates: list[dict],
    scene: Scene,
    top_n: int = 3,
    seeds: list[int] = None,
    config: SimConfig | None = None,
) -> list[dict]:
    """
    Take the top-N surrogate-predicted candidates.
    Apply each candidate's params to the scene, run full simulation
    for multiple seeds, and compare predicted vs actual KPIs.
    """
    if seeds is None:
        seeds = [42, 99, 7]
    if config is None:
        # Faster default for verification loops; callers can pass full config
        config = SimConfig(msa_max_iter=5)

    verified = []

    for i, candidate in enumerate(candidates[:top_n]):
        params = candidate.get("parameters", [])
        predicted_kpis = candidate.get("predicted_kpis", {})

        mutated = _apply_candidate_params(scene, params)

        aggregated_travel_time = 0.0
        successful_runs = 0

        for seed in seeds:
            try:
                run_id = f"verify_{i}_{seed}"
                result = run_replication(run_id, mutated, config, seed=seed)
                aggregated_travel_time += result.average_travel_time_mins
                successful_runs += 1
            except Exception as e:
                print(f"Warning: verification run failed for seed {seed}: {e}")

        actual_avg = (
            aggregated_travel_time / successful_runs
            if successful_runs > 0
            else float("inf")
        )

        pred_avg = predicted_kpis.get("avg_travel_time", 0.0)
        error = (
            abs(actual_avg - pred_avg) / actual_avg
            if actual_avg > 0 and actual_avg != float("inf")
            else 0.0
        )

        verified.append(
            {
                "parameters": params,
                "predicted_kpis": predicted_kpis,
                "verified_kpis": {
                    "avg_travel_time": actual_avg,
                    "average_travel_time_mins": actual_avg,
                },
                "prediction_error_pct": error * 100.0,
                "seeds_tested": successful_runs,
            }
        )

    return verified
