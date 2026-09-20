"""ML dataset generator — creates synthetic training data for surrogate models.

Moved out of core/ to avoid core → persistence import violations.
"""
import csv
import random
from pathlib import Path
from core.schema.scene import Scene
from core.scenarios.applier import apply_scenario
from core.runner import run_replication
from core.config import SimConfig


def generate_dataset(baseline_scene: Scene, output_path: str, samples: int = 100, seed: int = 42):
    """
    Generates a synthetic dataset for ML surrogate training.
    Varies demand_scale, weather_penalty, and capacity_drop.
    """
    config = SimConfig()
    rng = random.Random(seed)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["demand_scale", "weather_penalty", "capacity_drop", "total_flow", "avg_travel_time"])
        
        for i in range(samples):
            demand_scale = rng.uniform(0.5, 1.5)
            weather_penalty = rng.choice([1.0, 0.8, 0.5])
            capacity_drop = rng.uniform(0.0, 0.3)
            
            ops = [
                {"type": "global_demand_scale", "data": {"scale": demand_scale}}
            ]
            
            mutated_scene = apply_scenario(baseline_scene, ops)
            
            # Apply capacity drop and weather inline
            for link in mutated_scene.links:
                link.capacity_per_lane_per_hour = int(link.capacity_per_lane_per_hour * (1.0 - capacity_drop))
                link.speed_kph = link.speed_kph * weather_penalty
                
            run_id = f"dataset_sample_{i}"
            res = run_replication(run_id, mutated_scene, config, seed=seed + i)
            
            writer.writerow([
                demand_scale, 
                weather_penalty, 
                capacity_drop, 
                res.total_trips_completed, 
                res.average_travel_time_mins
            ])
