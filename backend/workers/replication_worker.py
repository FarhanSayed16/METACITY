import json
from pathlib import Path
from core.schema.scene import Scene
from core.runner import run_replication
from persistence.db import get_db_connection
from persistence.repositories import RunRepository, ProjectRepository, ScenarioRepository
from persistence.results_writer import write_run_result
import traceback

def worker_run_replication(run_id: str):
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
        
        # Apply scenario diff (stub: assuming ops catalog will mutate this scene later)
        # diff_ops = json.loads(scenario.diff_json)
        # apply_scenario(scene, diff_ops)
        
        # Run simulation
        kpis = run_replication(scene, seed=run.seed)
        
        # Write results
        write_run_result(run_id, kpis)
        
        # Update DB status
        with get_db_connection() as conn:
            run_repo = RunRepository(conn)
            run_repo.update_status(run_id, "completed")
            
    except Exception as e:
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        with get_db_connection() as conn:
            run_repo = RunRepository(conn)
            run_repo.update_status(run_id, "error", error_msg)
