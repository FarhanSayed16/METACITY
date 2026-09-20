"""Transit network model for public transport lines, stops, and travel time estimation."""
from core.schema.scene import SceneTransitLine


class TransitNetwork:
    """
    Manages transit lines (bus, metro, etc.) and provides travel time
    and wait time estimation between nodes.
    """
    
    def __init__(self):
        self.lines: list[SceneTransitLine] = []
        self._stop_to_lines: dict[str, list[SceneTransitLine]] = {}
    
    def add_line(self, line: SceneTransitLine):
        """Register a transit line and index its stops."""
        self.lines.append(line)
        for stop_id in line.stop_node_ids:
            if stop_id not in self._stop_to_lines:
                self._stop_to_lines[stop_id] = []
            self._stop_to_lines[stop_id].append(line)
    
    def has_service(self) -> bool:
        """Whether any transit lines exist."""
        return len(self.lines) > 0
    
    def get_lines_at_stop(self, node_id: str) -> list[SceneTransitLine]:
        """Get all transit lines that serve a given stop node."""
        return self._stop_to_lines.get(node_id, [])
    
    def get_travel_time(self, from_node: str, to_node: str, speed_kph: float = 25.0) -> float | None:
        """
        Estimate transit travel time between two nodes.
        Returns None if no line connects them.
        
        For MVP, this uses a simple stop-count heuristic:
        each inter-stop segment takes headway_minutes / len(stops) minutes.
        """
        for line in self.lines:
            stops = line.stop_node_ids
            if from_node in stops and to_node in stops:
                from_idx = stops.index(from_node)
                to_idx = stops.index(to_node)
                n_segments = abs(to_idx - from_idx)
                if n_segments > 0:
                    # Approximate: 2 minutes per stop segment
                    return n_segments * 2.0
        return None
    
    def get_wait_time(self, line_id: str) -> float:
        """Average wait time = headway / 2."""
        for line in self.lines:
            if line.id == line_id:
                return line.headway_minutes / 2.0
        return 5.0  # Default 5 min wait
    
    def get_best_wait_time(self) -> float:
        """Get the minimum average wait time across all lines."""
        if not self.lines:
            return float('inf')
        return min(line.headway_minutes / 2.0 for line in self.lines)

    @classmethod
    def from_scene(cls, scene) -> 'TransitNetwork':
        """Build a TransitNetwork from a Scene's transit_lines."""
        tn = cls()
        for line in scene.transit_lines:
            tn.add_line(line)
        return tn
