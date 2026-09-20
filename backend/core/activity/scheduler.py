"""Activity scheduler — manages events for agent departures/arrivals."""
import heapq
from dataclasses import dataclass, field
from core.agents.person import Person, TripState
from core.population.demand_profiles import classify_departure_period, DEMAND_PROFILES
from typing import Any
import logging

logger = logging.getLogger(__name__)

@dataclass(order=True)
class Event:
    time_min: int
    agent_id: str = field(compare=False)
    action: str = field(compare=False) # e.g., 'depart', 'arrive'
    payload: Any = field(default=None, compare=False)

class Scheduler:
    def __init__(self):
        self.events: list[Event] = []
        self.active_trips: list[TripState] = []
        self.departure_profile_counts: dict[str, int] = {k: 0 for k in DEMAND_PROFILES}
        self.departure_profile_counts["off_peak"] = 0
        
    def schedule_event(self, time_min: int, agent_id: str, action: str, payload: Any = None):
        heapq.heappush(self.events, Event(time_min, agent_id, action, payload))
        
    def populate_daily_departures(self, agents: list[Person]):
        """Schedules the initial departure events based on agent activity plans."""
        for agent in agents:
            if not agent.plan or len(agent.plan.activities) < 2:
                continue
                
            # Use the actual end time of the first activity as the departure time
            first_act = agent.plan.activities[0]
            depart_time = first_act.start_time_min + first_act.duration_min
            
            # Clamp to valid day range
            depart_time = max(0, min(depart_time, 1439))
            
            # Classify this departure into a demand period
            period = classify_departure_period(depart_time)
            self.departure_profile_counts[period] = self.departure_profile_counts.get(period, 0) + 1
            
            self.schedule_event(depart_time, agent.id, "depart", payload={
                "from": agent.plan.activities[0],
                "to": agent.plan.activities[1],
                "demand_period": period
            })
        
        # Log profile distribution
        logger.info(f"Departure profile distribution: {self.departure_profile_counts}")
            
    def step(self, current_time_min: int, agents: list[Person]) -> list[Event]:
        """
        Process and return all events that occur at or before current_time_min.
        """
        triggered_events = []
        while self.events and self.events[0].time_min <= current_time_min:
            event = heapq.heappop(self.events)
            triggered_events.append(event)
            
            if event.action == "depart":
                # Create a TripState
                ts = TripState(
                    person_id=event.agent_id,
                    origin_node_id=event.payload["from"].facility_id,
                    destination_node_id=event.payload["to"].facility_id,
                    mode="car",
                    start_time_min=event.time_min
                )
                self.active_trips.append(ts)
                
        return triggered_events
    
    def get_departure_profile_summary(self) -> dict:
        """Returns the departure profile distribution for reporting."""
        return dict(self.departure_profile_counts)
