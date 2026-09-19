# Pre-defined scenario examples

BYPASS_PRESET = {
    "name": "Eastern Highway Bypass",
    "description": "Adds a new bypass road to relieve congestion.",
    "ops": [
        {"op": "add_node", "id": "N_BP1", "x": 500, "y": 0, "type": "intersection"},
        {"op": "add_node", "id": "N_BP2", "x": 500, "y": 1000, "type": "intersection"},
        {
            "op": "add_link", 
            "id": "L_BP1", 
            "from_node": "N_BP1", 
            "to_node": "N_BP2",
            "lanes": 4, 
            "speed_kph": 80, 
            "capacity_per_lane_per_hour": 1800,
            "oneway": False
        }
    ]
}
