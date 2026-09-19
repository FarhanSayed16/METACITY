class SimClock:
    """Simulation clock. Advances in ticks of configurable minutes."""
    def __init__(self, tick_minutes: int = 1):
        self.tick_minutes = tick_minutes
        self.current_tick: int = 0

    @property
    def current_minutes(self) -> int:
        return self.current_tick * self.tick_minutes

    @property
    def current_hours(self) -> float:
        return self.current_minutes / 60.0

    def advance(self) -> int:
        self.current_tick += 1
        return self.current_tick

    @property
    def day_complete(self) -> bool:
        return self.current_minutes >= 1440  # 24 hours

    def reset(self):
        self.current_tick = 0
