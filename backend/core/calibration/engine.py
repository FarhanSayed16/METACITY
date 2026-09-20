import math


def evaluate_calibration(simulated_flows: dict[str, float], observed_flows: dict[str, float]) -> dict:
    """
    Compares macroscopic simulation link flows against observed real-world counts.
    Returns RMSE, GEH statistic, and a categorical calibration status.
    """
    if not observed_flows:
        return {
            "status": "synthetic_uncalibrated",
            "rmse": 0.0,
            "geh_avg": 0.0,
            "per_link_geh": {},
        }

    squared_errors = []
    geh_values = []
    per_link_geh = {}

    for link_id, obs in observed_flows.items():
        sim = simulated_flows.get(link_id, 0.0)
        squared_errors.append((sim - obs) ** 2)

        if sim + obs > 0:
            geh = math.sqrt(2 * (sim - obs) ** 2 / (sim + obs))
            geh_values.append(geh)
            per_link_geh[link_id] = geh

    rmse = math.sqrt(sum(squared_errors) / len(squared_errors)) if squared_errors else 0.0
    geh_avg = sum(geh_values) / len(geh_values) if geh_values else 0.0

    if geh_avg < 5.0 and len(geh_values) > 0:
        status = "calibrated"
    elif geh_avg < 10.0 and len(geh_values) > 0:
        status = "partially_calibrated"
    else:
        status = "synthetic_uncalibrated"

    return {
        "status": status,
        "rmse": rmse,
        "geh_avg": geh_avg,
        "per_link_geh": per_link_geh,
    }


def suggest_demand_scale(
    simulated_flows: dict[str, float],
    observed_flows: dict[str, float],
    clamp_min: float = 0.5,
    clamp_max: float = 2.0,
) -> float:
    """
    Suggest a global demand scale so sum(sim) ≈ sum(obs) on overlapping links.
    Returns 1.0 when insufficient overlap.
    """
    sim_sum = 0.0
    obs_sum = 0.0
    for link_id, obs in observed_flows.items():
        if link_id not in simulated_flows:
            continue
        sim_sum += float(simulated_flows[link_id])
        obs_sum += float(obs)
    if sim_sum <= 1e-9 or obs_sum <= 0:
        return 1.0
    scale = obs_sum / sim_sum
    return max(clamp_min, min(clamp_max, scale))
