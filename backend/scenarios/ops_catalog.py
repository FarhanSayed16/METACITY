from typing import Any

# A dictionary defining available operations on a Scene
# For MVP, we'll just define the signatures.
SCENARIO_OPS = {
    "add_link": {
        "required_fields": ["id", "from_node", "to_node", "lanes", "speed_kph", "capacity_per_lane_per_hour"],
        "description": "Add a new road link."
    },
    "remove_link": {
        "required_fields": ["id"],
        "description": "Remove an existing road link."
    },
    "update_link": {
        "required_fields": ["id"],
        "optional_fields": ["lanes", "speed_kph", "capacity_per_lane_per_hour"],
        "description": "Update properties of an existing link."
    },
    "add_node": {
        "required_fields": ["id", "x", "y"],
        "description": "Add a new physical node."
    }
}
