from dataclasses import dataclass
import numpy as np

@dataclass
class ActivityNode:
    type: str # 'home', 'work', 'other'
    start_time_min: int
    duration_min: int

def generate_daily_plan(plan_type: str, rng: np.random.Generator) -> list[ActivityNode]:
    """
    Generate a simple daily plan based on template type.
    """
    plan = []
    
    if plan_type == "worker":
        # Leave home around 8am (480 min) +/- 30 min
        leave_home = 480 + int(rng.normal(0, 30))
        # Work for 8 hours (480 min) +/- 60 min
        work_dur = 480 + int(rng.normal(0, 60))
        
        plan.append(ActivityNode("home", 0, leave_home))
        plan.append(ActivityNode("work", leave_home, work_dur))
        # Return home after work
        plan.append(ActivityNode("home", leave_home + work_dur, 1440 - (leave_home + work_dur)))
        
    elif plan_type == "student":
        leave_home = 510 + int(rng.normal(0, 30)) # 8:30am
        work_dur = 360 + int(rng.normal(0, 30)) # 6 hours
        
        plan.append(ActivityNode("home", 0, leave_home))
        plan.append(ActivityNode("work", leave_home, work_dur)) # school treated as work facility
        plan.append(ActivityNode("home", leave_home + work_dur, 1440 - (leave_home + work_dur)))
        
    else:
        # Default: stay home all day
        plan.append(ActivityNode("home", 0, 1440))
        
    return plan
