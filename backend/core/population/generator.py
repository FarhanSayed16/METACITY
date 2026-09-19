from core.schema.scene import Scene
from core.agents.person import Person
from core.rng import SeededRNG
import uuid

def generate_synthetic_population(scene: Scene, seed: int = 42) -> list[Person]:
    """
    Generate synthetic persons based on the scene's zones and parameters.
    Returns a list of initialized Person agents.
    """
    rng_mgr = SeededRNG(seed)
    rng = rng_mgr.rng
    
    total_pop = scene.parameters.total_population
    car_rate = scene.parameters.car_ownership_rate
    
    # Categorize facilities
    residential_facs = [f for f in scene.facilities if f.type == "home"]
    commercial_facs = [f for f in scene.facilities if f.type == "office"]
    
    if not residential_facs:
        # Fallback if no homes defined: generate without homes
        return []
        
    # Weight homes by capacity
    res_weights = [f.capacity for f in residential_facs]
    res_probs = [w / sum(res_weights) for w in res_weights] if sum(res_weights) > 0 else None
    
    com_weights = [f.capacity for f in commercial_facs]
    com_probs = [w / sum(com_weights) for w in com_weights] if sum(com_weights) > 0 else None
    
    agents = []
    
    for _ in range(total_pop):
        home = rng.choice(residential_facs, p=res_probs)
        owns_car = rng.random() < car_rate
        
        # Determine plan type (simple logic for now)
        plan_rand = rng.random()
        if plan_rand < 0.6:
            plan_type = "worker"
            work = rng.choice(commercial_facs, p=com_probs) if commercial_facs else None
        elif plan_rand < 0.8:
            plan_type = "student"
            work = rng.choice(commercial_facs, p=com_probs) if commercial_facs else None
        else:
            plan_type = "stay_home"
            work = None
            
        p = Person(
            id=str(uuid.uuid4()),
            home_fac_id=home.id,
            work_fac_id=work.id if work else None,
            owns_car=owns_car,
            plan_type=plan_type,
            current_fac_id=home.id
        )
        agents.append(p)
        
    return agents
