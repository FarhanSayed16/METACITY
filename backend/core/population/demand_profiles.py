"""Time-of-day demand profiles for realistic AM/PM peak variation."""
import numpy as np

DEMAND_PROFILES = {
    "am_peak":  {"hours": (7, 9),   "share": 0.35},
    "midday":   {"hours": (9, 16),  "share": 0.20},
    "pm_peak":  {"hours": (16, 19), "share": 0.35},
    "evening":  {"hours": (19, 22), "share": 0.10},
}

# Preferred outbound / return windows by activity plan type
_PLAN_DEPARTURE_PROFILE = {
    "worker": "am_peak",
    "student": "am_peak",
    "caregiver": "am_peak",
    "retired": "midday",
    "shift_worker": "am_peak",  # overridden for late shift inside plans
    "stay_home": None,
}

_PLAN_RETURN_PROFILE = {
    "worker": "pm_peak",
    "student": "pm_peak",
    "caregiver": "pm_peak",
    "retired": "midday",
    "shift_worker": "evening",
    "stay_home": None,
}


def get_departure_time(profile_name: str, rng: np.random.Generator) -> int:
    """
    Sample a departure time (in minutes from midnight) within the given
    demand profile window, with Gaussian jitter.
    """
    profile = DEMAND_PROFILES.get(profile_name)
    if not profile:
        return int(rng.uniform(0, 1440))

    start_h, end_h = profile["hours"]
    start_min = start_h * 60
    end_min = end_h * 60

    center = (start_min + end_min) / 2.0
    spread = (end_min - start_min) / 4.0

    t = int(rng.normal(center, spread))
    return max(0, min(t, 1439))


def sample_profile(rng: np.random.Generator) -> str:
    """Sample a demand profile name weighted by share."""
    names = list(DEMAND_PROFILES.keys())
    weights = [DEMAND_PROFILES[n]["share"] for n in names]
    total = sum(weights) or 1.0
    probs = [w / total for w in weights]
    return str(rng.choice(names, p=probs))


def preferred_departure_profile(plan_type: str) -> str | None:
    return _PLAN_DEPARTURE_PROFILE.get(plan_type)


def preferred_return_profile(plan_type: str) -> str | None:
    return _PLAN_RETURN_PROFILE.get(plan_type)


def classify_departure_period(time_min: int) -> str:
    """Classify a departure time into a demand period name."""
    hour = time_min / 60.0
    if 7 <= hour < 9:
        return "am_peak"
    elif 9 <= hour < 16:
        return "midday"
    elif 16 <= hour < 19:
        return "pm_peak"
    elif 19 <= hour < 22:
        return "evening"
    else:
        return "off_peak"
