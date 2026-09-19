from core.schema.scene import Scene
from core.world import World
from core.population.generator import generate_synthetic_population
from core.activity.scheduler import Scheduler
from core.metrics.kpis import compute_kpis, NetworkMetrics

def run_replication(scene: Scene, seed: int = 42) -> NetworkMetrics:
    """
    Run a full simulation replication for a given scene and random seed.
    This guarantees perfectly reproducible results.
    """
    # 1. Initialize world
    world = World(scene, seed=seed)
    
    # 2. Generate population
    agents = generate_synthetic_population(scene, seed=seed)
    for a in agents:
        world.add_agent(a)
        
    # 3. Setup Scheduler
    scheduler = Scheduler()
    
    # 4. Main Simulation Loop
    while not world.clock.day_complete:
        current_time = world.clock.current_minutes
        
        # Step scheduler
        scheduler.step(current_time, world.agents)
        
        # Advance time
        world.clock.advance()
        
    # 5. Compute and return KPIs
    return compute_kpis(world)
