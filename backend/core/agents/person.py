from dataclasses import dataclass
from typing import Hashable

@dataclass
class TripState:
    origin_fac_id: Hashable
    dest_fac_id: Hashable
    start_time_min: int
    mode: str = "car"
    distance_m: float = 0.0
    duration_min: float = 0.0

@dataclass
class Person:
    id: str
    home_fac_id: Hashable
    work_fac_id: Hashable | None
    owns_car: bool
    plan_type: str
    current_fac_id: Hashable
    current_trip: TripState | None = None
