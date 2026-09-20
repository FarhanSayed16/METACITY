from dataclasses import dataclass, field
from typing import Dict, Any, List

@dataclass
class Result:
    """The final output artefact of a simulation replication."""
    run_id: str
    status: str
    total_trips_completed: int = 0
    average_travel_time_mins: float = 0.0
    trip_durations_mins: List[float] = field(default_factory=list)
    final_gap: float = 0.0
    iterations: int = 1
    equilibrium_method: str = "MSA"
    converged: bool = False
    mode_counts: Dict[str, int] = field(default_factory=dict)
    link_metrics: List[Dict[str, Any]] = field(default_factory=list)
    co2_tonnes: float = 0.0
    electricity_kwh: float = 0.0
    water_liters: float = 0.0

class MetricsCollector:
    """Collects simulation metrics across ticks."""
    
    def __init__(self):
        self.completed_trips: List[float] = []  # Durations in minutes
        self.mode_counts: Dict[str, int] = {"car": 0, "walk": 0, "transit": 0}
        
    def record_completed_trip(self, duration_mins: float, mode: str = "car"):
        self.completed_trips.append(duration_mins)
        if mode in self.mode_counts:
            self.mode_counts[mode] += 1
        else:
            self.mode_counts[mode] = 1
        
    def finalize(self, run_id: str, status: str = "completed", final_gap: float = 0.0, iterations: int = 1) -> Result:
        total = len(self.completed_trips)
        avg = sum(self.completed_trips) / total if total > 0 else 0.0
        
        return Result(
            run_id=run_id,
            status=status,
            total_trips_completed=total,
            average_travel_time_mins=avg,
            trip_durations_mins=self.completed_trips,
            final_gap=final_gap,
            iterations=iterations,
            mode_counts=self.mode_counts
        )
