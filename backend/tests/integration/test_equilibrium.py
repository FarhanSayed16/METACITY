import json
from pathlib import Path
from core.schema.scene import Scene
from core.config import SimConfig
from core.runner import run_replication

def test_msa_equilibrium_gap_decreases():
    """
    Test that the relative gap decreases across MSA iterations,
    indicating convergence towards a user equilibrium.
    """
    template_path = Path(__file__).parent.parent.parent / "data" / "templates" / "nexus_city_baseline.json"
    scene_data = json.loads(template_path.read_text())

    # Create a congested scenario so there's actually a gap to minimize
    for link in scene_data["links"]:
        link["capacity_per_lane_per_hour"] = 200
        
    scene_data["parameters"]["total_population"] = 2000
    scene = Scene.model_validate(scene_data)
    
    # Run 1: 1 iteration only
    config_1 = SimConfig(msa_max_iter=1, msa_epsilon=0.0)
    kpis_iter1 = run_replication("iter1", scene, config_1, seed=42)
    
    # Run 2: 5 iterations
    config_5 = SimConfig(msa_max_iter=5, msa_epsilon=0.0)
    kpis_iter5 = run_replication("iter5", scene, config_5, seed=42)
    
    assert kpis_iter1.total_trips_completed > 0
    
    # The final gap after 5 iterations should be strictly less than after 1 iteration
    assert kpis_iter5.final_gap < kpis_iter1.final_gap
    # It should also run the full 5 iterations because epsilon is 0.0
    assert kpis_iter5.iterations == 5
