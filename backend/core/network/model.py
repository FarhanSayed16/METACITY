from dataclasses import dataclass
from typing import Hashable

@dataclass
class RoadNode:
    id: Hashable
    x: float
    y: float
    type: str

@dataclass
class RoadLink:
    id: Hashable
    from_node: Hashable
    to_node: Hashable
    lanes: int
    speed_kph: float
    capacity: float
    length_m: float
    free_flow_time_m: float
