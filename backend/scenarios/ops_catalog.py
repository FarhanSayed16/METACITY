from typing import Any

# A dictionary defining available operations on a Scene
SCENARIO_OPS = {
    "add_node": {
        "required_fields": ["id", "x", "y"],
        "description": "Add a new intersection node."
    },
    "add_link": {
        "required_fields": ["id", "from_node", "to_node", "lanes", "speed_kph", "capacity_per_lane_per_hour"],
        "description": "Add a new road link."
    },
    "remove_link": {
        "required_fields": ["id"],
        "description": "Remove an existing road link."
    },
    "set_lanes": {
        "required_fields": ["id", "lanes"],
        "description": "Change the number of lanes on a link."
    },
    "set_speed": {
        "required_fields": ["id", "speed_kph"],
        "description": "Change speed limit on a link."
    },
    "set_capacity": {
        "required_fields": ["id", "capacity_per_lane_per_hour"],
        "description": "Change capacity on a link."
    },
    "close_link": {
        "required_fields": ["id"],
        "description": "Close a link to all traffic."
    },
    "add_facility": {
        "required_fields": ["id", "type", "zone_id", "x", "y"],
        "description": "Add a new facility (school, hospital, etc.)."
    },
    "flood": {
        "required_fields": ["water_level"],
        "description": "Inundate low-elevation nodes and close connected links."
    },
    "outage": {
        "required_fields": [],
        "description": "Close links by id list and/or zone_id (utility outage)."
    },
  "car_ownership_rate": {
    "required_fields": ["rate"],
    "description": "Set car ownership rate on scene parameters."
  },
  "total_population": {
    "required_fields": ["population"],
    "description": "Set total population on scene parameters."
  },
}
