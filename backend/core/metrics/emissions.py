def calculate_emissions(link_flows: dict[str, float], link_speeds: dict[str, float], link_lengths: dict[str, float]) -> dict[str, float]:
    """
    Calculates CO2 emissions for each link based on flow, speed, and length.
    Uses a simplified macroscopic emission curve where very low and very high speeds 
    emit more per km than optimal cruising speeds (~60 km/h).
    """
    emissions = {}
    
    for link_id, flow in link_flows.items():
        speed_kmh = link_speeds.get(link_id, 50.0)
        length_km = link_lengths.get(link_id, 1000.0) / 1000.0 # Convert meters to km
        
        # Simplified emission factor curve: g CO2 / vehicle-km
        # Optimal at 60km/h is ~150g. Stops/congestion (low speed) spike emissions.
        if speed_kmh < 10:
            factor = 400.0
        elif speed_kmh < 30:
            factor = 250.0
        elif speed_kmh < 80:
            factor = 150.0 + (60 - speed_kmh)**2 * 0.05
        else:
            factor = 200.0 + (speed_kmh - 80) * 2.0
            
        # Total CO2 in kg
        co2_kg = (flow * length_km * factor) / 1000.0
        emissions[link_id] = co2_kg
        
    return emissions
