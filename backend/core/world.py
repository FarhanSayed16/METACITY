from core.schema.scene import Scene
from core.network.builder import build_network_from_scene
from core.network.validation import validate_network_connectivity
from core.algorithms.graph import DirectedGraph
from core.config import SimConfig
from core.clock import SimClock
from core.rng import SeededRNG

class World:
    """
    The main container for the simulation state.
    Holds the network, population, clock, and configuration.
    """
    def __init__(self, scene: Scene, seed: int = 42, config: SimConfig = None):
        self.scene = scene
        self.config = config or SimConfig()
        self.rng = SeededRNG(seed)
        self.clock = SimClock(tick_minutes=self.config.city_tick_minutes)
        
        # Build the physical network
        self.network: DirectedGraph = build_network_from_scene(scene)
        
        # Validate it
        val = validate_network_connectivity(self.network)
        if not val["is_connected"]:
            # Warning: in a real log we'd use structured logging here
            print(f"Warning: Network is disconnected. {val['isolated_nodes']} isolated nodes.")
            
        self.agents = []
        
    def add_agent(self, agent):
        self.agents.append(agent)
