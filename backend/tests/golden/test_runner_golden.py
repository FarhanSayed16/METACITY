import pytest
import shutil
from pathlib import Path
from core.runner import run_replication
from core.schema.scene import Scene
from core.config import SimConfig
from persistence.paths import get_data_dir
from persistence.results_writer import write_run_result
import pyarrow.parquet as pq

def test_runner_reproducibility():
    """
    Golden Test: Ensure that the simulation runner is perfectly deterministic.
    Running the same scene with the same seed twice must yield identical KPIs
    and identical trip metrics.
    """
    # 1. Load the baseline scene (from MP-10)
    scene_path = get_data_dir() / "templates" / "nexus_city_baseline.json"
    if not scene_path.exists():
        pytest.skip("nexus_city_baseline.json not found, skipping golden test")
        
    scene = Scene.parse_file(scene_path)
    config = SimConfig(city_tick_minutes=60) # Fast tick for tests
    
    seed = 42
    
    # 2. Run simulation first time
    result1 = run_replication("run_golden_1", scene, config, seed)
    
    # 3. Run simulation second time
    result2 = run_replication("run_golden_2", scene, config, seed)
    
    # 4. Compare macroscopic results
    assert result1.total_trips_completed == result2.total_trips_completed
    assert result1.average_travel_time_mins == result2.average_travel_time_mins
    assert result1.trip_durations_mins == result2.trip_durations_mins
    
    # 5. Verify file writing
    write_run_result("run_golden_1", config, seed, result1)
    
    # Check outputs exist
    run_dir = get_data_dir() / "runs" / "run_golden_1"
    assert (run_dir / "meta.json").exists()
    assert (run_dir / "kpis.json").exists()
    assert (run_dir / "trips.parquet").exists()
    
    # Verify parquet structure
    table = pq.read_table(run_dir / "trips.parquet")
    assert "trip_duration_mins" in table.column_names
    
    # Clean up test output
    shutil.rmtree(run_dir)
