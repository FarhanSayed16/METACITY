"""Household model to group persons and manage shared resources like vehicles."""
from dataclasses import dataclass, field
from typing import Hashable

@dataclass
class Household:
    id: str
    home_fac_id: Hashable
    person_ids: list[str] = field(default_factory=list)
    vehicle_ids: list[str] = field(default_factory=list)
    
    def has_vehicle(self) -> bool:
        return len(self.vehicle_ids) > 0
