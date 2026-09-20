from core.schema.scene import Scene
from core.agents.person import Person, ActivityPlan
from core.activity.plans import generate_daily_plan
from core.population.household import Household
from core.agents.vehicle import Vehicle
from core.rng import SeededRNG
import uuid

def generate_synthetic_population(scene: Scene, seed: int = 42) -> tuple[list[Person], list[Household], list[Vehicle]]:
    """
    Generate synthetic persons, households, and vehicles based on the scene's zones and parameters.
    Returns (agents, households, vehicles).
    """
    rng_mgr = SeededRNG(seed)
    rng = rng_mgr.rng
    
    total_pop = scene.parameters.total_population
    car_rate = scene.parameters.car_ownership_rate
    
    residential_facs = [f for f in scene.facilities if f.type == "home"]
    commercial_facs = [f for f in scene.facilities if f.type in ("office", "factory")]
    
    if not residential_facs:
        return [], [], []
        
    res_weights = [f.capacity for f in residential_facs]
    res_total = sum(res_weights)
    res_probs = [w / res_total for w in res_weights] if res_total > 0 else None
    
    com_weights = [f.capacity for f in commercial_facs]
    com_total = sum(com_weights)
    com_probs = [w / com_total for w in com_weights] if com_total > 0 else None
    
    agents = []
    households = []
    vehicles = []
    
    plan_thresholds = [
        (0.45, "worker"),
        (0.60, "student"),
        (0.70, "retired"),
        (0.80, "shift_worker"),
        (0.90, "caregiver"),
        (1.00, "stay_home"),
    ]
    
    # Generate households first (average household size = 2.5)
    num_households = int(total_pop / 2.5)
    if num_households == 0:
        num_households = 1
        
    for _ in range(num_households):
        home = rng.choice(residential_facs, p=res_probs)
        hh_id = f"hh_{uuid.uuid4().hex[:8]}"
        hh = Household(id=hh_id, home_fac_id=home.id)
        
        if rng.random() < car_rate:
            veh_id = f"veh_{uuid.uuid4().hex[:8]}"
            veh = Vehicle(id=veh_id, home_fac_id=home.id)
            vehicles.append(veh)
            hh.vehicle_ids.append(veh_id)
            
        households.append(hh)
        
    # Generate persons and assign to households
    for i in range(total_pop):
        hh = households[i % len(households)]
        owns_car = hh.has_vehicle()
        
        plan_rand = rng.random()
        plan_type = "stay_home"
        for threshold, ptype in plan_thresholds:
            if plan_rand < threshold:
                plan_type = ptype
                break
        
        work = None
        if plan_type in ("worker", "student", "shift_worker", "caregiver") and commercial_facs:
            work = rng.choice(commercial_facs, p=com_probs)
            
        daily_activities = generate_daily_plan(plan_type, rng)
        
        for act in daily_activities:
            if act.type == "home":
                act.facility_id = hh.home_fac_id
            elif act.type == "work" and work:
                act.facility_id = work.id
            elif act.type == "shop":
                act.facility_id = rng.choice(commercial_facs).id if commercial_facs else hh.home_fac_id
            else:
                act.facility_id = hh.home_fac_id
                
        activity_plan = ActivityPlan(activities=daily_activities)
        
        p = Person(
            id=str(uuid.uuid4()),
            home_fac_id=hh.home_fac_id,
            work_fac_id=work.id if work else None,
            owns_car=owns_car,
            plan_type=plan_type,
            current_fac_id=hh.home_fac_id,
            plan=activity_plan,
        )
        agents.append(p)
        hh.person_ids.append(p.id)
        
    return agents, households, vehicles
