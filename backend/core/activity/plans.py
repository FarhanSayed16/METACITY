from dataclasses import dataclass
import numpy as np
from core.population.demand_profiles import (
    get_departure_time,
    preferred_departure_profile,
    preferred_return_profile,
)

@dataclass
class ActivityNode:
    type: str # 'home', 'work', 'school', 'shop', 'park'
    facility_id: str = ""
    start_time_min: int = 0
    duration_min: int = 0

def generate_daily_plan(plan_type: str, rng: np.random.Generator) -> list[ActivityNode]:
    """
    Generate a daily plan based on template type.
    Outbound/return times are sampled from AM/PM (and related) demand profiles
    so peaks are generated — not just classified after the fact.
    """
    plan = []

    def _outbound(default_profile: str) -> int:
        profile = preferred_departure_profile(plan_type) or default_profile
        return get_departure_time(profile, rng)

    def _return_after(leave: int, min_dur: int, default_profile: str) -> int:
        profile = preferred_return_profile(plan_type) or default_profile
        t = get_departure_time(profile, rng)
        return max(t, leave + min_dur)
    
    if plan_type == "worker":
        leave_home = _outbound("am_peak")
        return_home = _return_after(leave_home, 360, "pm_peak")
        work_dur = max(60, return_home - leave_home)
        plan.append(ActivityNode("home", start_time_min=0, duration_min=leave_home))
        plan.append(ActivityNode("work", start_time_min=leave_home, duration_min=work_dur))
        plan.append(ActivityNode("home", start_time_min=leave_home + work_dur, duration_min=max(0, 1440 - (leave_home + work_dur))))
        
    elif plan_type == "student":
        leave_home = _outbound("am_peak")
        return_home = _return_after(leave_home, 300, "pm_peak")
        school_dur = max(60, return_home - leave_home)
        plan.append(ActivityNode("home", start_time_min=0, duration_min=leave_home))
        plan.append(ActivityNode("work", start_time_min=leave_home, duration_min=school_dur))
        plan.append(ActivityNode("home", start_time_min=leave_home + school_dur, duration_min=max(0, 1440 - (leave_home + school_dur))))
        
    elif plan_type == "retired":
        leave_home = _outbound("midday")
        outing_dur = 120 + int(rng.normal(0, 30))
        plan.append(ActivityNode("home", start_time_min=0, duration_min=leave_home))
        plan.append(ActivityNode("shop", start_time_min=leave_home, duration_min=max(30, outing_dur)))
        end = leave_home + max(30, outing_dur)
        plan.append(ActivityNode("home", start_time_min=end, duration_min=max(0, 1440 - end)))
        
    elif plan_type == "shift_worker":
        if rng.random() < 0.5:
            leave_home = get_departure_time("am_peak", rng)
            # Bias early AM for early shift
            leave_home = min(leave_home, 7 * 60 + 30)
        else:
            leave_home = get_departure_time("midday", rng)
            leave_home = max(leave_home, 13 * 60)
        work_dur = 480
        plan.append(ActivityNode("home", start_time_min=0, duration_min=leave_home))
        plan.append(ActivityNode("work", start_time_min=leave_home, duration_min=work_dur))
        plan.append(ActivityNode("home", start_time_min=leave_home + work_dur, duration_min=max(0, 1440 - (leave_home + work_dur))))
        
    elif plan_type == "caregiver":
        drop_off = _outbound("am_peak")
        errand_start = drop_off + 30
        pickup = _return_after(errand_start, 120, "pm_peak")
        errand_dur = max(60, pickup - errand_start - 60)
        plan.append(ActivityNode("home", start_time_min=0, duration_min=drop_off))
        plan.append(ActivityNode("work", start_time_min=drop_off, duration_min=30))
        plan.append(ActivityNode("shop", start_time_min=errand_start, duration_min=errand_dur))
        plan.append(ActivityNode("work", start_time_min=pickup, duration_min=30))
        plan.append(ActivityNode("home", start_time_min=pickup + 30, duration_min=max(0, 1440 - (pickup + 30))))
        
    else:  # stay_home
        plan.append(ActivityNode("home", start_time_min=0, duration_min=1440))
        
    return plan
