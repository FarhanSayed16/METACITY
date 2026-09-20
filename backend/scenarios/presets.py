# Pre-defined scenario examples using the unified diff format

BYPASS_PRESET = {
    "name": "Eastern Highway Bypass",
    "description": "Adds a new bypass road to relieve congestion.",
    "ops": [
        {"type": "add_node", "data": {"id": "N_BP1", "x": 500, "y": 0, "type": "intersection"}},
        {"type": "add_node", "data": {"id": "N_BP2", "x": 500, "y": 1000, "type": "intersection"}},
        {
            "type": "add_link",
            "data": {
                "id": "L_BP1",
                "from_node": "N_BP1",
                "to_node": "N_BP2",
                "lanes": 4,
                "speed_kph": 80,
                "capacity_per_lane_per_hour": 1800,
                "oneway": False
            }
        }
    ]
}

FLOOD_PRESET = {
    "id": "flood_01",
    "name": "Riverside Flood",
    "description": "Close low-lying links near the river zone",
    "ops": [
        {"type": "close_link", "data": {"id": "LH7"}},
        {"type": "close_link", "data": {"id": "LH8"}},
        {"type": "close_link", "data": {"id": "LV22"}},
    ]
}

BRIDGE_FAILURE_PRESET = {
    "id": "bridge_01",
    "name": "Critical Bridge Failure",
    "description": "Close the main ring-road bridge segment",
    "ops": [
        {"type": "close_link", "data": {"id": "LR100"}},
        {"type": "close_link", "data": {"id": "LR101"}},
    ]
}

def get_all_presets() -> list[dict]:
    # BYPASS_PRESET needs an ID, let's inject it if not there
    bypass = dict(BYPASS_PRESET)
    bypass["id"] = "bypass_01"
    return [bypass, FLOOD_PRESET, BRIDGE_FAILURE_PRESET]
