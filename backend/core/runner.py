from core.schema.scene import Scene
from core.world import World
from core.population.generator import generate_synthetic_population
from core.activity.scheduler import Scheduler
from core.metrics.collector import MetricsCollector, Result
from core.algorithms.astar import astar
from core.algorithms.logit import multinomial_logit_probs
from core.snapshot.builder import build_snapshot
from core.config import SimConfig
from core.utilities.demand import calculate_utilities
from core.metrics.emissions import calculate_emissions
import math
import numpy as np

def euclidean_heuristic(world: World, u: str, v: str) -> float:
    # Estimate time in minutes using straight-line distance and 50 km/h avg speed
    n1 = world.network.nodes_data.get(u)
    n2 = world.network.nodes_data.get(v)
    if not n1 or not n2: return 0.0
    dx = n1.get('x', 0) - n2.get('x', 0)
    dy = n1.get('y', 0) - n2.get('y', 0)
    dist_m = math.hypot(dx, dy)
    return (dist_m / 1000.0) / (50.0 / 60.0) # mins

def run_replication(run_id: str, scene: Scene, config: SimConfig, seed: int = 42, progress_callback: callable = None, initial_costs: dict = None) -> Result:
    """
    Run a full simulation replication for a given scene and random seed.
    This guarantees perfectly reproducible results.
    """
    # 1. Initialize world
    world = World(scene, seed=seed)
    world.clock.tick_minutes = config.city_tick_minutes
    
    # Calculate total ticks for progress
    total_ticks = (24 * 60) / config.city_tick_minutes
    
    # 2. Generate population
    agents, _, _ = generate_synthetic_population(scene, seed=seed)
    for a in agents:
        world.add_agent(a)
        
    # 3. Setup historical costs for MSA (MP-17)
    historical_link_costs = {}
    for u in world.network.adj:
        for v, d in world.network.adj[u].items():
            if "link_id" in d:
                link_id = d["link_id"]
                if initial_costs and link_id in initial_costs:
                    historical_link_costs[link_id] = initial_costs[link_id]
                else:
                    historical_link_costs[link_id] = d.get("free_flow_time_m", 1.0)
                
    final_gap = 0.0
    iterations_completed = 0
    
    # MSA Main Loop
    for iteration in range(1, config.msa_max_iter + 1):
        iterations_completed = iteration
        world.clock.reset()
        
        scheduler = Scheduler()
        scheduler.populate_daily_departures(world.agents)
        metrics = MetricsCollector()
        
        # Link tracking for MP-16 and MP-17
        link_volumes = {} # link_id -> active agents count
        agent_positions = {} # agent_id -> {link_id, mode, from_node, to_node}
        experienced_delays = {link_id: [] for link_id in historical_link_costs}
    
    # 4. Main Simulation Loop
        while not world.clock.day_complete:
            current_time = world.clock.current_minutes
            
            if progress_callback and current_time % (config.city_tick_minutes * config.snapshot_hz) == 0:
                # Incorporate iteration progress
                total_sim_time = (24 * 60) * config.msa_max_iter
                current_sim_time = (iteration - 1) * (24 * 60) + current_time
                progress_pct = min(100.0, (current_sim_time / total_sim_time) * 100)
                
                # Build snapshot using structured builder
                snap = build_snapshot(
                    run_id=run_id,
                    current_time=current_time,
                    progress_pct=progress_pct,
                    link_volumes=link_volumes,
                    network=world.network,
                    iteration=iteration,
                    max_iterations=config.msa_max_iter
                )
                
                # Populate agents_sample: cap at 200 agents on links (viz only — not microsim)
                sample_agents = []
                sampled = 0
                for aid, pos in agent_positions.items():
                    if sampled >= 200:
                        break
                    from_data = world.network.nodes_data.get(pos.get("from_node", ""))
                    to_data = world.network.nodes_data.get(pos.get("to_node", ""))
                    if from_data and to_data:
                        link_tt = max(float(pos.get("link_tt") or 1.0), 1e-6)
                        enter_t = float(pos.get("enter_t", current_time))
                        progress = min(1.0, max(0.0, (current_time - enter_t) / link_tt))
                        fx, fy = from_data["x"], from_data["y"]
                        tx, ty = to_data["x"], to_data["y"]
                        sample_agents.append({
                            "id": aid,
                            "x": fx + (tx - fx) * progress,
                            "y": fy + (ty - fy) * progress,
                            "mode": pos.get("mode", "car"),
                            "link_id": pos.get("link_id", ""),
                            "progress": round(progress, 3),
                        })
                        sampled += 1
                
                snapshot = {
                    "t_mins": snap.t,
                    "progress_pct": snap.progress,
                    "link_metrics": {m["id"]: {"volume": m["volume"], "capacity": m["capacity"], "vc": m["vc"]} for m in snap.link_metrics},
                    "agents_sample": sample_agents,
                    "iteration": snap.flags.get("iteration", 1),
                    "max_iterations": snap.flags.get("max_iterations", 1)
                }
                progress_callback(snapshot)
            
            # Step scheduler
            events = scheduler.step(current_time, world.agents)
            
            for event in events:
                exact_time = event.time_min
                
                if event.action == "depart":
                    orig_fac_id = event.payload["from"].facility_id
                    dest_fac_id = event.payload["to"].facility_id
                    
                    orig_fac = next((f for f in scene.facilities if f.id == orig_fac_id), None)
                    dest_fac = next((f for f in scene.facilities if f.id == dest_fac_id), None)
                    
                    if not orig_fac or not dest_fac:
                        scheduler.schedule_event(exact_time + 1.0, event.agent_id, "arrive", {"duration": 1.0})
                        continue
                        
                    # Find nearest nodes (naive linear scan for MVP)
                    def nearest_node(fac):
                        best_n = None
                        best_d = float('inf')
                        for n, data in world.network.nodes_data.items():
                            d = (data['x'] - fac.x)**2 + (data['y'] - fac.y)**2
                            if d < best_d:
                                best_d = d
                                best_n = n
                        return best_n
                        
                    orig = nearest_node(orig_fac)
                    dest = nearest_node(dest_fac)
                    
                    # MSA Routing (MP-17) using historical costs
                    def weight_func(u, v, d):
                        link_id = d.get("link_id")
                        if link_id and link_id in historical_link_costs:
                            return historical_link_costs[link_id]
                        return d.get("free_flow_time_m", 1.0)
                    
                    path, car_time = astar(
                        world.network, orig, dest,
                        heuristic_func=lambda u, v: euclidean_heuristic(world, u, v),
                        weight_func=weight_func
                    )
                    
                    # --- MP-18: Mode Choice ---
                    dx = dest_fac.x - orig_fac.x
                    dy = dest_fac.y - orig_fac.y
                    dist_m = math.hypot(dx, dy)
                    walk_time = dist_m / 83.33  # 5 km/h
                    
                    transit_time = float('inf')
                    wait_time = 0.0
                    if scene.transit_lines:
                        transit_time = dist_m / 416.66  # 25 km/h
                        wait_time = scene.transit_lines[0].headway_minutes / 2.0
                    
                    v_car = -0.1 * car_time if path else -float('inf')
                    v_walk = -0.2 * walk_time
                    v_transit = -0.1 * transit_time - 0.5 * wait_time if scene.transit_lines else -float('inf')
                    
                    # Check car ownership
                    person = next((a for a in world.agents if a.id == event.agent_id), None)
                    if person and not person.owns_car:
                        v_car = -float('inf')
                        
                    utilities = np.array([v_car, v_walk, v_transit])
                    if np.all(utilities == -float('inf')):
                        utilities = np.array([-float('inf'), 0, -float('inf')]) # Default to walk
                        
                    probs = multinomial_logit_probs(utilities, theta=1.0)
                    chosen_mode = world.rng.rng.choice(["car", "walk", "transit"], p=probs)
                    
                    if chosen_mode == "car" and path and len(path) > 1:
                        # Schedule entering the first link
                        scheduler.schedule_event(exact_time, event.agent_id, "enter_link", {
                            "path": path,
                            "path_idx": 0,
                            "start_time": exact_time,
                            "mode": chosen_mode
                        })
                    else:
                        # Walk or Transit or failed car path: direct arrival after duration
                        if chosen_mode == "walk" or (chosen_mode == "car" and not path):
                            duration = walk_time
                            chosen_mode = "walk"
                        elif chosen_mode == "transit":
                            duration = transit_time + wait_time
                        else:
                            duration = walk_time
                            
                        scheduler.schedule_event(exact_time + duration, event.agent_id, "arrive", {
                            "duration": duration,
                            "mode": chosen_mode
                        })
                        
                elif event.action == "enter_link":
                    path = event.payload["path"]
                    idx = event.payload["path_idx"]
                    start_time = event.payload["start_time"]
                    
                    u = path[idx]
                    v = path[idx + 1]
                    mode = event.payload.get("mode", "car")
                    
                    d = world.network.get_edge_data(u, v)
                    link_id = d.get("link_id") if d else None
                    
                    if link_id:
                        link_volumes[link_id] = link_volumes.get(link_id, 0) + 1
                        vol = link_volumes[link_id]
                        cap = d.get("capacity", 1000)
                        fft = d.get("free_flow_time_m", 1.0)
                        # Delay for *this* agent entering now
                        delay = fft * (1.0 + config.bpr_alpha * ((vol / max(cap, 1)) ** config.bpr_beta))
                        # Track agent position for City Twin sample viz (progress along link)
                        agent_positions[event.agent_id] = {
                            "link_id": link_id,
                            "mode": mode,
                            "from_node": u,
                            "to_node": v,
                            "enter_t": exact_time,
                            "link_tt": delay,
                        }
                        if link_id in experienced_delays:
                            experienced_delays[link_id].append(delay)
                    else:
                        delay = 1.0
                        
                    scheduler.schedule_event(exact_time + delay, event.agent_id, "exit_link", {
                        "path": path,
                        "path_idx": idx,
                        "link_id": link_id,
                        "start_time": start_time,
                        "mode": mode
                    })
                    
                elif event.action == "exit_link":
                    path = event.payload["path"]
                    idx = event.payload["path_idx"]
                    link_id = event.payload.get("link_id")
                    start_time = event.payload["start_time"]
                    mode = event.payload.get("mode", "car")
                    
                    if link_id and link_id in link_volumes:
                        link_volumes[link_id] = max(0, link_volumes[link_id] - 1)
                    # Agent leaving this link
                    agent_positions.pop(event.agent_id, None)
                        
                    if idx + 1 < len(path) - 1:
                        # Enter next link immediately
                        scheduler.schedule_event(exact_time, event.agent_id, "enter_link", {
                            "path": path,
                            "path_idx": idx + 1,
                            "start_time": start_time,
                            "mode": mode
                        })
                    else:
                        # Arrived at destination
                        duration = exact_time - start_time
                        scheduler.schedule_event(exact_time, event.agent_id, "arrive", {
                            "duration": duration,
                            "mode": mode
                        })
                    
                elif event.action == "arrive":
                    agent_positions.pop(event.agent_id, None)
                    duration = event.payload.get("duration", 0)
                    mode = event.payload.get("mode", "car")
                    if duration != float('inf'):
                        metrics.record_completed_trip(duration, mode=mode)
            
            # Advance time
            world.clock.advance()
            
        # --- End of Day: MSA Update ---
        sum_abs_diff = 0.0
        sum_costs = 0.0
        
        for link_id, delays in experienced_delays.items():
            if delays:
                avg_experienced = sum(delays) / len(delays)
            else:
                # If no one used it, cost is free flow
                avg_experienced = historical_link_costs.get(link_id, 1.0) # Actually, should reset to free flow or leave?
                
            old_cost = historical_link_costs[link_id]
            # MSA update formula
            new_cost = (1.0 - 1.0/iteration) * old_cost + (1.0/iteration) * avg_experienced
            historical_link_costs[link_id] = new_cost
            
            sum_abs_diff += abs(avg_experienced - old_cost)
            sum_costs += old_cost
            
        if sum_costs > 0:
            final_gap = sum_abs_diff / sum_costs
        else:
            final_gap = 0.0
            
        if final_gap < config.msa_epsilon:
            # Reached equilibrium
            break
            
    # Compile final link metrics for mechanism trace
    final_link_metrics = []
    link_flows = {}
    link_speeds = {}
    link_lengths = {l.id: (l.length_m or 1000.0) for l in scene.links}
    
    for u in world.network.adj:
        for v, d in world.network.adj[u].items():
            link_id = d.get("link_id")
            if link_id and link_id in experienced_delays:
                delays = experienced_delays[link_id]
                vol = len(delays)
                cap = d.get("capacity", 1000)
                avg_tt = sum(delays) / vol if vol > 0 else d.get("free_flow_time_m", 1.0)
                vc = vol / max(cap, 1)
                final_link_metrics.append({
                    "id": link_id,
                    "volume": float(vol),
                    "capacity": float(cap),
                    "vc_ratio": float(vc),
                    "travel_time": float(avg_tt)
                })
                link_flows[link_id] = float(vol)
                link_speeds[link_id] = (d.get("length", 1000) / 1000.0) / (avg_tt / 60.0) if avg_tt > 0 else 50.0
                
    utilities = calculate_utilities(scene)
    emissions = calculate_emissions(link_flows, link_speeds, link_lengths)
    
    total_elec = sum(u["electricity_kwh"] for u in utilities.values())
    total_water = sum(u["water_liters"] for u in utilities.values())
    total_co2_kg = sum(emissions.values())
        
    # 5. Return final metrics
    result = metrics.finalize(run_id=run_id, final_gap=final_gap, iterations=iterations_completed)
    result.link_metrics = final_link_metrics
    result.co2_tonnes = total_co2_kg / 1000.0
    result.electricity_kwh = total_elec
    result.water_liters = total_water
    result.converged = final_gap < config.msa_epsilon
    return result
