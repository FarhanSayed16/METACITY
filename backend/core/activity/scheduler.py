from core.agents.person import Person, TripState

class Scheduler:
    def __init__(self):
        self.active_trips: list[TripState] = []
        
    def step(self, current_time_min: int, agents: list[Person]):
        """
        Check if any agent needs to start a new trip based on their plan.
        In this simplified Level-1 model MVP, we just generate macroscopic demand 
        for the current hour, so the scheduler might just aggregate trips.
        """
        # For MVP, macroscopic assignment happens over epochs (e.g. 1 hr)
        # Detailed trip dispatching is a placeholder for Level-2 micro.
        pass
