from core.schema.scene import Scene, SceneFacility, SceneZone
from core.population.generator import generate_synthetic_population

def test_generate_synthetic_population():
    z1 = SceneZone(id="z1", name="res", land_use="residential")
    z2 = SceneZone(id="z2", name="com", land_use="commercial")
    
    f1 = SceneFacility(id="f1", type="home", zone_id="z1", capacity=100, x=0, y=0)
    f2 = SceneFacility(id="f2", type="office", zone_id="z2", capacity=200, x=10, y=10)
    
    scene = Scene(
        name="Test", 
        nodes=[], 
        links=[], 
        zones=[z1, z2],
        facilities=[f1, f2]
    )
    scene.parameters.total_population = 50
    scene.parameters.car_ownership_rate = 0.5
    
    agents, households, vehicles = generate_synthetic_population(scene, seed=42)
    
    assert len(agents) == 50
    assert all(a.home_fac_id == "f1" for a in agents)
    
    # Check reproducible determinism
    agents2, _, _ = generate_synthetic_population(scene, seed=42)
    assert agents[0].owns_car == agents2[0].owns_car
    assert agents[0].plan_type == agents2[0].plan_type
