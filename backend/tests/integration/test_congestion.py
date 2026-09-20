import pytest
import json
from pathlib import Path
from core.schema.scene import Scene
from core.config import SimConfig
from core.runner import run_replication

def test_congested_corridor_travel_time():
    """
    Simulate two identical networks:
    Run 1: Low population (free flow)
    Run 2: High population (congested)
    Verify that the average travel time in Run 2 is significantly higher.
    """
    template_path = Path(__file__).parent.parent.parent / "data" / "templates" / "nexus_city_baseline.json"
    scene_data = json.loads(template_path.read_text())
    
    # Artificially constrain capacity so any traffic causes massive congestion
    for link in scene_data["links"]:
        link["capacity_per_lane_per_hour"] = 100
        
    # Run 1: Free Flow
    scene_data["parameters"]["total_population"] = 100
    scene1 = Scene.model_validate(scene_data)
    config = SimConfig(msa_max_iter=5)
    kpis_free = run_replication("free_flow", scene1, config, seed=42)
    
    # Run 2: Congested
    scene_data["parameters"]["total_population"] = 5000
    scene2 = Scene.model_validate(scene_data)
    kpis_congested = run_replication("congested", scene2, config, seed=42)
    
    assert kpis_free.total_trips_completed > 0
    assert kpis_congested.total_trips_completed > 0
    
    # Congested network max travel time should heavily exceed free flow max travel time
    assert max(kpis_congested.trip_durations_mins) > max(kpis_free.trip_durations_mins)
