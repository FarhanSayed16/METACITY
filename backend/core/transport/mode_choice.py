"""Mode choice — multinomial logit model for car/walk/transit selection."""
import math
import numpy as np
from core.algorithms.logit import multinomial_logit_probs
from core.schema.scene import Scene


def compute_mode_utilities(
    owns_car: bool,
    car_time: float,
    walk_time: float,
    transit_time: float,
    wait_time: float,
    has_transit: bool
) -> dict[str, float]:
    """
    Compute utilities for each mode.
    
    Utility = β_time * time + β_wait * wait + constant
    - Car:     V = -0.1 * car_time
    - Walk:    V = -0.2 * walk_time  (higher penalty per minute)
    - Transit: V = -0.1 * transit_time - 0.5 * wait_time
    
    Returns:
        Dict {mode: utility_value}.
    """
    v_car = -0.1 * car_time if owns_car and car_time < float('inf') else -float('inf')
    v_walk = -0.2 * walk_time
    v_transit = -0.1 * transit_time - 0.5 * wait_time if has_transit else -float('inf')
    
    return {"car": v_car, "walk": v_walk, "transit": v_transit}


def choose_mode_for_trip(
    owns_car: bool,
    car_time: float,
    distance_m: float,
    scene: Scene,
    rng: np.random.Generator,
    theta: float = 1.0
) -> tuple[str, float]:
    """
    Choose a travel mode using multinomial logit probabilities.
    
    Args:
        owns_car: Whether the person has a car.
        car_time: Estimated car travel time in minutes.
        distance_m: Straight-line distance in metres.
        scene: The scene (for transit_lines info).
        rng: Seeded random generator.
        theta: Logit scale parameter.
        
    Returns:
        Tuple (chosen_mode, estimated_duration_minutes).
    """
    walk_time = distance_m / 83.33  # 5 km/h
    
    transit_time = float('inf')
    wait_time = 0.0
    has_transit = bool(scene.transit_lines)
    if has_transit:
        transit_time = distance_m / 416.66  # ~25 km/h
        wait_time = scene.transit_lines[0].headway_minutes / 2.0
    
    utils = compute_mode_utilities(owns_car, car_time, walk_time, transit_time, wait_time, has_transit)
    
    utilities = np.array([utils["car"], utils["walk"], utils["transit"]])
    if np.all(utilities == -float('inf')):
        utilities = np.array([-float('inf'), 0, -float('inf')])
    
    probs = multinomial_logit_probs(utilities, theta=theta)
    chosen_mode = rng.choice(["car", "walk", "transit"], p=probs)
    
    # Compute duration for chosen mode
    if chosen_mode == "car":
        duration = car_time
    elif chosen_mode == "transit":
        duration = transit_time + wait_time
    else:
        duration = walk_time
    
    return chosen_mode, duration
