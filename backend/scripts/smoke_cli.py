"""
CLI smoke test: Load Nexus City, build world, advance N ticks.
Usage: python -m scripts.smoke_cli [--ticks 100]
"""
import argparse
import json
from pathlib import Path
from core.schema.scene import Scene
from core.world import World
from core.population.generator import generate_synthetic_population
from core.activity.scheduler import Scheduler

def main():
    parser = argparse.ArgumentParser(description="METACITY CLI smoke test")
    parser.add_argument("--template", default="data/templates/nexus_city_baseline.json")
    parser.add_argument("--ticks", type=int, default=100)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    
    # Load scene
    scene = Scene.model_validate(json.loads(Path(args.template).read_text()))
    print(f"Loaded: {scene.name} ({len(scene.nodes)} nodes, {len(scene.links)} links)")
    
    # Build world
    world = World(scene, seed=args.seed)
    print(f"Network built: {len(list(world.network.nodes))} graph nodes")
    
    # Generate population
    agents, _, _ = generate_synthetic_population(scene, seed=args.seed)
    for a in agents:
        world.add_agent(a)
    
    plan_types = {}
    for a in agents:
        plan_types[a.plan_type] = plan_types.get(a.plan_type, 0) + 1
    print(f"Population: {len(agents)} agents")
    print(f"Plan types: {plan_types}")
    
    # Setup scheduler
    scheduler = Scheduler()
    scheduler.populate_daily_departures(agents)
    print(f"Scheduled {len(scheduler.events)} departure events")
    
    # Advance ticks
    for _ in range(args.ticks):
        current_time = world.clock.current_minutes
        events = scheduler.step(current_time, world.agents)
        if events:
            print(f"  Tick {world.clock.current_tick} (t={current_time}min): {len(events)} events fired")
        world.clock.advance()
        
    print(f"\nFinal clock: tick={world.clock.current_tick}, minutes={world.clock.current_minutes}")
    print(f"Active trips: {len(scheduler.active_trips)}")
    print(f"Day complete: {world.clock.day_complete}")
    print("Smoke test PASSED")

if __name__ == "__main__":
    main()
