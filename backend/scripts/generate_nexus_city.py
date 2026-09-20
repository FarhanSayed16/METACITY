"""
Script to generate a proper Nexus City template with:
- 56 nodes (7x7 grid + 12 ring road nodes)
- ~100 links (grid streets + ring road + radials)
- 6 zones (3 residential, 1 commercial, 1 industrial, 1 mixed)
- 20 facilities
- 1 transit line (bus, 6 stops)
"""
import json, math

nodes = []
links = []

# --- Grid nodes: 7x7 at 500m spacing, centered at (2500, 2500) ---
grid_ids = {}
grid_spacing = 600
grid_origin_x = 700
grid_origin_y = 700
nid = 1
for row in range(7):
    for col in range(7):
        node_id = f"G{row}_{col}"
        x = grid_origin_x + col * grid_spacing
        y = grid_origin_y + row * grid_spacing
        nodes.append({"id": node_id, "x": x, "y": y, "type": "intersection"})
        grid_ids[(row, col)] = node_id
        nid += 1

# Grid links (horizontal)
lid = 1
for row in range(7):
    for col in range(6):
        # Arterials on row 3, collectors on rows 1 and 5, local otherwise
        if row == 3:
            rc, spd, cap = "arterial", 60, 1800
        elif row in (1, 5):
            rc, spd, cap = "collector", 50, 1500
        else:
            rc, spd, cap = "local", 40, 1200
        links.append({
            "id": f"LH{lid}", "from_node": grid_ids[(row, col)],
            "to_node": grid_ids[(row, col + 1)],
            "lanes": 2, "speed_kph": spd,
            "capacity_per_lane_per_hour": cap,
            "road_class": rc, "oneway": False
        })
        lid += 1

# Grid links (vertical)
for col in range(7):
    for row in range(6):
        if col == 3:
            rc, spd, cap = "arterial", 60, 1800
        elif col in (1, 5):
            rc, spd, cap = "collector", 50, 1500
        else:
            rc, spd, cap = "local", 40, 1200
        links.append({
            "id": f"LV{lid}", "from_node": grid_ids[(row, col)],
            "to_node": grid_ids[(row + 1, col)],
            "lanes": 2, "speed_kph": spd,
            "capacity_per_lane_per_hour": cap,
            "road_class": rc, "oneway": False
        })
        lid += 1

# --- Ring road: 12 nodes around the perimeter ---
ring_radius = 2200
ring_cx, ring_cy = 2500, 2500
ring_nodes = []
for i in range(12):
    angle = (2 * math.pi * i) / 12
    x = ring_cx + ring_radius * math.cos(angle)
    y = ring_cy + ring_radius * math.sin(angle)
    rid = f"R{i}"
    nodes.append({"id": rid, "x": round(x), "y": round(y), "type": "intersection"})
    ring_nodes.append(rid)

# Ring links
for i in range(12):
    links.append({
        "id": f"LR{lid}", "from_node": ring_nodes[i],
        "to_node": ring_nodes[(i + 1) % 12],
        "lanes": 2, "speed_kph": 80,
        "capacity_per_lane_per_hour": 2000,
        "road_class": "highway", "oneway": False
    })
    lid += 1

# Connect ring to grid corners
connections = [
    (ring_nodes[0], grid_ids[(3, 6)]),  # East
    (ring_nodes[3], grid_ids[(6, 3)]),  # South
    (ring_nodes[6], grid_ids[(3, 0)]),  # West
    (ring_nodes[9], grid_ids[(0, 3)]),  # North
]
for rn, gn in connections:
    links.append({
        "id": f"LC{lid}", "from_node": rn, "to_node": gn,
        "lanes": 2, "speed_kph": 60,
        "capacity_per_lane_per_hour": 1800,
        "road_class": "arterial", "oneway": False
    })
    lid += 1

# --- Bottleneck corridor: narrow link between G3_2 and G3_3 ---
# Find and replace that link to make it a bottleneck
for link in links:
    if link["from_node"] == grid_ids[(3, 2)] and link["to_node"] == grid_ids[(3, 3)]:
        link["lanes"] = 1
        link["speed_kph"] = 30
        link["capacity_per_lane_per_hour"] = 800
        link["road_class"] = "local"
        break

# --- Zones ---
zones = [
    {"id": "Z_RES_N", "name": "North Residential", "land_use": "residential", "population_target": 250},
    {"id": "Z_RES_W", "name": "West Residential", "land_use": "residential", "population_target": 200},
    {"id": "Z_RES_S", "name": "South Residential", "land_use": "residential", "population_target": 200},
    {"id": "Z_COM", "name": "Central Commercial", "land_use": "commercial", "population_target": 150},
    {"id": "Z_IND", "name": "East Industrial", "land_use": "industrial", "population_target": 100},
    {"id": "Z_MIX", "name": "Mixed Quarter", "land_use": "mixed", "population_target": 100},
]

# --- Facilities (20) ---
facilities = [
    # Homes (8)
    {"id": "home_1", "type": "home", "zone_id": "Z_RES_N", "capacity": 120, "x": 1300, "y": 900, "floors": 3},
    {"id": "home_2", "type": "home", "zone_id": "Z_RES_N", "capacity": 130, "x": 1900, "y": 900, "floors": 2},
    {"id": "home_3", "type": "home", "zone_id": "Z_RES_W", "capacity": 100, "x": 900, "y": 2100, "floors": 2},
    {"id": "home_4", "type": "home", "zone_id": "Z_RES_W", "capacity": 100, "x": 900, "y": 2700, "floors": 2},
    {"id": "home_5", "type": "home", "zone_id": "Z_RES_S", "capacity": 100, "x": 1300, "y": 3900, "floors": 2},
    {"id": "home_6", "type": "home", "zone_id": "Z_RES_S", "capacity": 100, "x": 1900, "y": 3900, "floors": 3},
    {"id": "home_7", "type": "home", "zone_id": "Z_MIX", "capacity": 80, "x": 3700, "y": 3300, "floors": 4},
    {"id": "home_8", "type": "home", "zone_id": "Z_MIX", "capacity": 70, "x": 3700, "y": 3900, "floors": 3},
    # Offices (4)
    {"id": "off_1", "type": "office", "zone_id": "Z_COM", "capacity": 300, "x": 2500, "y": 2100, "floors": 8},
    {"id": "off_2", "type": "office", "zone_id": "Z_COM", "capacity": 200, "x": 2500, "y": 2700, "floors": 6},
    {"id": "off_3", "type": "office", "zone_id": "Z_COM", "capacity": 150, "x": 3100, "y": 2500, "floors": 5},
    {"id": "off_4", "type": "office", "zone_id": "Z_MIX", "capacity": 100, "x": 3700, "y": 2700, "floors": 4},
    # Factory (2)
    {"id": "fac_1", "type": "factory", "zone_id": "Z_IND", "capacity": 200, "x": 3700, "y": 1500, "floors": 1},
    {"id": "fac_2", "type": "factory", "zone_id": "Z_IND", "capacity": 150, "x": 4300, "y": 1500, "floors": 1},
    # School (1)
    {"id": "sch_1", "type": "school", "zone_id": "Z_RES_N", "capacity": 200, "x": 1900, "y": 1500, "floors": 2},
    # Hospital (1)
    {"id": "hosp_1", "type": "hospital", "zone_id": "Z_COM", "capacity": 150, "x": 3100, "y": 2100, "floors": 4},
    # Shops (2)
    {"id": "shop_1", "type": "shop", "zone_id": "Z_COM", "capacity": 100, "x": 2500, "y": 1900, "floors": 1},
    {"id": "shop_2", "type": "shop", "zone_id": "Z_MIX", "capacity": 80, "x": 3300, "y": 3300, "floors": 1},
    # Parks (2)
    {"id": "park_1", "type": "park", "zone_id": "Z_RES_W", "capacity": 300, "x": 700, "y": 3300, "floors": 1},
    {"id": "park_2", "type": "park", "zone_id": "Z_RES_S", "capacity": 200, "x": 2500, "y": 4100, "floors": 1},
]

# --- Transit line (bus route along main east-west arterial) ---
transit_lines = [{
    "id": "BUS_1",
    "name": "East-West Express",
    "mode": "bus",
    "stop_node_ids": [
        grid_ids[(3, 0)], grid_ids[(3, 1)], grid_ids[(3, 2)],
        grid_ids[(3, 4)], grid_ids[(3, 5)], grid_ids[(3, 6)]
    ],
    "headway_minutes": 10
}]

scene = {
    "schema_version": "1.0.0",
    "name": "Nexus City Baseline",
    "description": "Fictional city with 7x7 grid + ring road. Features a deliberate bottleneck on the east-west arterial between G3_2 and G3_3 for the Highway Bypass scenario demo.",
    "calibration_status": "synthetic_uncalibrated",
    "bounds": {"width_m": 5000.0, "height_m": 5000.0},
    "nodes": nodes,
    "links": links,
    "zones": zones,
    "facilities": facilities,
    "transit_lines": transit_lines,
    "parameters": {
        "total_population": 1000,
        "car_ownership_rate": 0.5,
        "simulation_days": 1
    }
}

out_path = "data/templates/nexus_city_baseline.json"
with open(out_path, "w") as f:
    json.dump(scene, f, indent=2)

print(f"Nodes: {len(nodes)}")
print(f"Links: {len(links)}")
print(f"Zones: {len(zones)}")
print(f"Facilities: {len(facilities)}")
print(f"Transit: {len(transit_lines)}")
print(f"Written to {out_path}")
