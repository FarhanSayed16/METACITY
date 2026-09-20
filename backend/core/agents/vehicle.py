"""Vehicle model representing cars, bikes, etc. owned by households."""
from dataclasses import dataclass
from typing import Hashable

@dataclass
class Vehicle:
    id: str
    home_fac_id: Hashable
    type: str = "car"
