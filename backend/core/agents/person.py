from dataclasses import dataclass, field
from typing import Hashable, Any

@dataclass
class TripState:
    origin_fac_id: Hashable = ""
    dest_fac_id: Hashable = ""
    start_time_min: int = 0
    mode: str = "car"
    distance_m: float = 0.0
    duration_min: float = 0.0
    person_id: str = ""
    origin_node_id: str = ""
    destination_node_id: str = ""

@dataclass
class ActivityPlan:
    """A day-plan consisting of a sequence of activities."""
    activities: list[Any] = field(default_factory=list)

@dataclass
class Person:
    id: str
    home_fac_id: Hashable
    work_fac_id: Hashable | None
    owns_car: bool
    plan_type: str
    current_fac_id: Hashable
    current_trip: TripState | None = None
    plan: ActivityPlan | None = None
