import json
from pathlib import Path
from core.schema.scene import Scene
from core.runner import run_replication

def test_golden_seed_reproducibility():
    """
    Ensure that running the simulation on the baseline template with a fixed
    seed produces identical KPIs every single time (deterministic property).
    """
    template_path = Path(__file__).parent.parent.parent / "data" / "templates" / "nexus_city_baseline.json"
    scene_data = json.loads(template_path.read_text())
    scene = Scene.model_validate(scene_data)
    
    kpis_run1 = run_replication(scene, seed=42)
    kpis_run2 = run_replication(scene, seed=42)
    kpis_run3 = run_replication(scene, seed=99)
    
    # Same seed MUST produce identical exact outputs
    assert kpis_run1.total_trips == kpis_run2.total_trips
    assert kpis_run1.avg_travel_time_min == kpis_run2.avg_travel_time_min
    
    # Different seed MAY produce different outputs (but total trips is likely same if tied to capacity here)
    # The key test is the absolute match of the 42 seed.
