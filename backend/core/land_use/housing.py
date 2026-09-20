from core.schema.scene import Scene

def apply_housing_shift(scene: Scene, travel_times: dict[str, float], shift_rate: float = 0.05):
    """
    Shifts population between zones based on relative accessibility (travel times).
    Zones with below-average travel times gain population, above-average lose population.
    Total population is conserved.
    """
    if not scene.zones:
        return
        
    # 1. Compute average travel time for all nodes
    valid_times = [t for t in travel_times.values() if t < 9999]
    if not valid_times:
        return
        
    avg_time = sum(valid_times) / len(valid_times)
    
    # 2. Map zones to their nearest nodes to get zone accessibility
    zone_accessibility = {}
    for z in scene.zones:
        # A simple proxy: travel time of the nearest network node
        # In a full model, this would be a gravity model of all destinations
        nearest_node = min(scene.nodes, key=lambda n: (n.x - z.center_x)**2 + (n.y - z.center_y)**2)
        tt = travel_times.get(nearest_node.id, avg_time)
        
        # Accessibility score: > 1 means better than average, < 1 means worse
        zone_accessibility[z.id] = max(0.1, avg_time / max(1.0, tt))
        
    # 3. Calculate shifts
    total_pop = sum(z.population for z in scene.zones)
    new_pops = {}
    total_new_pop = 0.0
    
    for z in scene.zones:
        acc = zone_accessibility[z.id]
        # Shift population proportionally to accessibility relative to average (1.0)
        # shift_rate limits the max % change per year
        multiplier = 1.0 + ((acc - 1.0) * shift_rate)
        new_pop = z.population * multiplier
        new_pops[z.id] = max(0, new_pop)
        total_new_pop += new_pops[z.id]
        
    # 4. Normalize to conserve total population exactly
    if total_new_pop > 0:
        scale = total_pop / total_new_pop
        for z in scene.zones:
            z.population = int(new_pops[z.id] * scale)
