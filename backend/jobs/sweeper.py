"""Parameter sweeper — sensitivity analysis over a single parameter."""
from core.schema.scene import Scene
from core.scenarios.applier import apply_scenario
from core.runner import run_replication
from core.config import SimConfig


def sweep_parameters(
    baseline_scene: Scene,
    base_diff_ops: list[dict],
    param_name: str,
    values: list[float],
    seed: int = 42,
    msa_max_iter: int = 10,
) -> dict:
    """
    Runs a sensitivity sweep over a single parameter, recording KPIs.

    Supported param_name:
      demand_scale | car_ownership_rate | total_population | bpr_alpha
    """
    results = {}

    for val in values:
        config = SimConfig(msa_max_iter=msa_max_iter)
        sweep_ops = list(base_diff_ops)

        if param_name == "demand_scale":
            sweep_ops.append({"type": "global_demand_scale", "data": {"scale": val}})
        elif param_name == "car_ownership_rate":
            sweep_ops.append({"type": "car_ownership_rate", "data": {"rate": val}})
        elif param_name == "total_population":
            sweep_ops.append({"type": "total_population", "data": {"population": int(val)}})
        elif param_name == "bpr_alpha":
            config.bpr_alpha = float(val)
        else:
            raise ValueError(f"Unsupported sweep parameter: {param_name}")

        mutated_scene = apply_scenario(baseline_scene, sweep_ops) if sweep_ops else baseline_scene
        run_id = f"sweep_{param_name}_{val}"
        res = run_replication(run_id, mutated_scene, config, seed=seed)

        results[str(val)] = {
            "total_trips": res.total_trips_completed,
            "avg_travel_time": res.average_travel_time_mins,
            "final_gap": res.final_gap,
            "iterations": res.iterations,
            "converged": res.converged,
        }

    return results
