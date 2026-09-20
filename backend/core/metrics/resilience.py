"""N-1 network resilience via short replications on schema-safe link closures."""
from __future__ import annotations

import copy
import uuid

from core.config import SimConfig
from core.runner import run_replication
from core.schema.scene import Scene


def calculate_n1_resilience(
    scene: Scene,
    sample_size: int = 10,
    *,
    seed: int = 42,
    config: SimConfig | None = None,
) -> dict:
    """
    Network resilience scanner.
    Randomly closes up to `sample_size` links and re-evaluates completed trips.
    Returns average trip loss vs baseline (0 = fragile, 1 = resilient).
    """
    cfg = config or SimConfig(city_tick_minutes=5, msa_max_iter=5, snapshot_hz=1)
    baseline_res = run_replication(
        f"resilience-base-{uuid.uuid4().hex[:8]}",
        scene,
        cfg,
        seed=seed,
    )
    base_trips = baseline_res.total_trips_completed

    if base_trips == 0:
        return {"resilience_score": 1.0, "avg_trip_loss": 0.0, "samples": 0}

    # Only consider links that still carry capacity
    valid_links = [l for l in scene.links if (l.capacity_per_lane_per_hour or 0) > 1]
    if not valid_links:
        return {"resilience_score": 1.0, "avg_trip_loss": 0.0, "samples": 0}

    trip_losses: list[float] = []
    n = min(sample_size, len(valid_links))
    # Deterministic sample order from seed
    rng_indices = list(range(len(valid_links)))
    # simple LCG shuffle for reproducibility without importing numpy here
    state = seed & 0xFFFFFFFF
    for i in range(len(rng_indices) - 1, 0, -1):
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        j = state % (i + 1)
        rng_indices[i], rng_indices[j] = rng_indices[j], rng_indices[i]

    for k in range(n):
        test_scene = copy.deepcopy(scene)
        drop_id = valid_links[rng_indices[k]].id
        for link in test_scene.links:
            if link.id == drop_id:
                link.capacity_per_lane_per_hour = 0
                link.speed_kph = 1.0
                break

        res = run_replication(
            f"resilience-n1-{k}-{uuid.uuid4().hex[:8]}",
            test_scene,
            cfg,
            seed=seed,
        )
        loss = max(0, base_trips - res.total_trips_completed)
        trip_losses.append(float(loss))

    avg_loss = sum(trip_losses) / len(trip_losses) if trip_losses else 0.0
    score = 1.0 - (avg_loss / base_trips)

    return {
        "resilience_score": max(0.0, min(1.0, score)),
        "avg_trip_loss": avg_loss,
        "samples": len(trip_losses),
        "baseline_trips": base_trips,
    }
