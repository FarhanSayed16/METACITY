from core.schema.scene import Scene

def calculate_utilities(scene: Scene) -> dict[str, dict[str, float]]:
    """
    Calculates expected water and electricity demand for each zone based on population and type.
    """
    results = {}
    
    # Base rates per capita
    ELEC_RESIDENTIAL = 3.5 # kWh / person / day
    ELEC_COMMERCIAL = 8.0  # kWh / person / day (proxy based on capacity)
    ELEC_INDUSTRIAL = 20.0 
    
    WATER_RESIDENTIAL = 150 # Liters / person / day
    WATER_COMMERCIAL = 50 
    WATER_INDUSTRIAL = 500
    
    for z in scene.zones:
        pop = z.population
        
        if z.land_use == "residential":
            elec = pop * ELEC_RESIDENTIAL
            water = pop * WATER_RESIDENTIAL
        elif z.land_use == "commercial":
            elec = pop * ELEC_COMMERCIAL
            water = pop * WATER_COMMERCIAL
        elif z.land_use == "industrial":
            elec = pop * ELEC_INDUSTRIAL
            water = pop * WATER_INDUSTRIAL
        else:
            elec = pop * ELEC_RESIDENTIAL
            water = pop * WATER_RESIDENTIAL
            
        results[z.id] = {
            "electricity_kwh": elec,
            "water_liters": water
        }
        
    return results
