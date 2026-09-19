from dataclasses import dataclass

@dataclass
class SimConfig:
    """Simulation parameters — Appendix A defaults."""
    bpr_alpha: float = 0.15
    bpr_beta: float = 4.0
    msa_epsilon: float = 0.01
    msa_max_iter: int = 50
    reassignment_fraction: float = 0.15
    city_tick_minutes: int = 1          # 1 or 5
    evac_tick_seconds: int = 1
    comparison_seeds: int = 10
    snapshot_hz: int = 5                # 2–10
    lane_width_m: float = 3.5
    floor_height_m: float = 3.0
    fire_spread_p: float = 0.05
    panic_threshold: float = 0.7
