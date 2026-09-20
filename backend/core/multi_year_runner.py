from core.schema.scene import Scene
from core.runner import run_replication
from core.land_use.housing import apply_housing_shift
from core.utilities.demand import calculate_utilities
from core.metrics.emissions import calculate_emissions
from core.config import SimConfig
import copy

def run_multi_year(scene: Scene, years: int = 5, shift_rate: float = 0.05, seed: int = 42) -> dict:
    """
    Runs the macroscopic simulation over multiple 'years'.
    Each year, traffic KPIs are used to shift the population to more accessible zones.
    """
    history = []
    
    # Deepcopy to avoid mutating the original baseline if needed
    current_scene = copy.deepcopy(scene)
    config = SimConfig()
    
    for year in range(years):
        # 1. Run traffic simulation for this year
        res = run_replication(f"multi_year_{year}", current_scene, config, seed=seed)
        
        # 2. Extract travel times for accessibility
        # We average travel times of outgoing links from each node.
        node_access = {n.id: 1.0 for n in current_scene.nodes} # default 1.0 min
        node_link_count = {n.id: 0 for n in current_scene.nodes}
        
        link_flows = {}
        for lm in res.link_metrics:
            link_flows[lm["id"]] = lm["volume"]
            # To compute node access, we need to know link's from_node, but lm only has 'id'
            # Let's just find it:
            
        for l in current_scene.links:
            lm = next((x for x in res.link_metrics if x["id"] == l.id), None)
            if lm:
                node_access[l.from_node] += lm["travel_time"]
                node_link_count[l.from_node] += 1
                
        # average them
        for n_id in node_access:
            if node_link_count[n_id] > 0:
                # subtract the default 1.0 we added for safety, then divide
                node_access[n_id] = (node_access[n_id] - 1.0) / node_link_count[n_id]
        
        travel_times = node_access
        
        # 3. Apply Land Use shift for the *next* year
        apply_housing_shift(current_scene, travel_times, shift_rate)
        
        # 4. Record state
        history.append({
            "year": year,
            "population": sum(z.population for z in current_scene.zones),
            "total_vkt": sum(lm["volume"] * (l.length_m or 1000.0) / 1000 for l in current_scene.links for lm in res.link_metrics if lm["id"] == l.id),
            "total_co2_kg": res.co2_tonnes * 1000.0,
            "total_electricity_kwh": res.electricity_kwh,
            "total_water_liters": res.water_liters
        })
        
    return {
        "history": history,
        "final_scene": current_scene
    }
