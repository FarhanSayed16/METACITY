import json
from pathlib import Path
from core.schema.scene import Scene
from core.runner import run_replication
from persistence.db import get_db_connection
from persistence.repositories import RunRepository, ProjectRepository, ScenarioRepository
from persistence.results_writer import write_run_result
from core.config_profiles import get_profile
from core.scenarios.applier import apply_scenario
from core.network.builder import build_network_from_scene
from core.disasters.emergency_access import compute_isolation_metrics
import traceback

def worker_run_replication(run_id: str, progress_queue = None):
    """
    Background worker function that runs a simulation replication.
    """
    try:
        # Load the run configuration from DB
        with get_db_connection() as conn:
            run_repo = RunRepository(conn)
            proj_repo = ProjectRepository(conn)
            scen_repo = ScenarioRepository(conn)
            
            run = run_repo.get(run_id)
            if not run:
                return
                
            run_repo.update_status(run_id, "running")
            
            scenario = scen_repo.get(run.scenario_id)
            project = proj_repo.get(scenario.project_id)
            
        # Load the base scene
        with open(project.scene_json_path, 'r', encoding='utf-8') as f:
            scene_data = json.load(f)
            
        scene = Scene.model_validate(scene_data)
        
        # Apply scenario diff
        diff_ops = json.loads(scenario.diff_json)
        if diff_ops:
            scene = apply_scenario(scene, diff_ops)

        # Isolation KPIs on the post-scenario network (disaster-aware)
        isolation = None
        try:
            graph = build_network_from_scene(scene)
            isolation = compute_isolation_metrics(graph)
        except Exception:
            isolation = None
        
        # Apply project config profile (academic / fast_demo / etc.)
        profile_id = getattr(project, "profile_id", None) or "default"
        config = get_profile(profile_id).config
        
        def progress_cb(snapshot: dict):
            if progress_queue:
                progress_queue.put((run_id, snapshot))
        
        # Run simulation
        result = run_replication(run_id, scene, config, seed=run.seed, progress_callback=progress_cb)
        
        # Write results
        write_run_result(
            run_id, config, run.seed, result,
            calibration_status=scene.calibration_status,
            isolation=isolation,
        )
        
        # Update DB status
        with get_db_connection() as conn:
            run_repo = RunRepository(conn)
            run_repo.update_status(run_id, "completed")
            
    except Exception as e:
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        with get_db_connection() as conn:
            run_repo = RunRepository(conn)
            run_repo.update_status(run_id, "error", error_msg)
