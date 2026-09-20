import csv
from io import StringIO
from dataclasses import dataclass

@dataclass
class TransitStop:
    id: str
    name: str
    lat: float
    lon: float

@dataclass
class TransitRoute:
    id: str
    name: str
    mode: str # e.g. "bus", "metro"

@dataclass
class TransitTrip:
    id: str
    route_id: str
    stop_ids: list[str]

def parse_gtfs_stops(stops_txt_content: str) -> list[TransitStop]:
    """Parses a standard GTFS stops.txt file."""
    f = StringIO(stops_txt_content)
    reader = csv.DictReader(f)
    
    stops = []
    for row in reader:
        stops.append(TransitStop(
            id=row["stop_id"],
            name=row.get("stop_name", row["stop_id"]),
            lat=float(row["stop_lat"]),
            lon=float(row["stop_lon"])
        ))
    return stops

def parse_gtfs_routes(routes_txt_content: str) -> list[TransitRoute]:
    f = StringIO(routes_txt_content)
    reader = csv.DictReader(f)
    routes = []
    for row in reader:
        mode = "bus" if row.get("route_type") == "3" else "metro"
        routes.append(TransitRoute(
            id=row["route_id"],
            name=row.get("route_short_name", row["route_id"]),
            mode=mode
        ))
    return routes

def parse_gtfs_trips_and_stoptimes(trips_txt_content: str, stop_times_txt_content: str) -> list[TransitTrip]:
    """Parses trips and their sequence of stops."""
    f_trips = StringIO(trips_txt_content)
    trips_reader = csv.DictReader(f_trips)
    
    trips_map = {}
    for row in trips_reader:
        trips_map[row["trip_id"]] = TransitTrip(
            id=row["trip_id"],
            route_id=row["route_id"],
            stop_ids=[]
        )
        
    f_stoptimes = StringIO(stop_times_txt_content)
    stoptimes_reader = csv.DictReader(f_stoptimes)
    
    # Needs to be sorted by stop_sequence but assuming it's ordered for now
    for row in stoptimes_reader:
        tid = row["trip_id"]
        if tid in trips_map:
            trips_map[tid].stop_ids.append(row["stop_id"])
            
    return list(trips_map.values())

from core.schema.scene import SceneTransitLine, SceneNode
from core.geo.crs import wgs84_to_local

def convert_gtfs_to_scene(
    stops_txt: str, 
    routes_txt: str, 
    trips_txt: str, 
    stop_times_txt: str,
    ref_lat: float,
    ref_lon: float
) -> tuple[list[SceneNode], list[SceneTransitLine]]:
    """
    Parses GTFS files and returns METACITY schema objects for stops and transit lines.
    """
    stops = parse_gtfs_stops(stops_txt)
    routes = parse_gtfs_routes(routes_txt)
    trips = parse_gtfs_trips_and_stoptimes(trips_txt, stop_times_txt)
    
    # We only care about stops that are actually used in trips
    used_stop_ids = set()
    for t in trips:
        used_stop_ids.update(t.stop_ids)
        
    scene_nodes = []
    stop_map = {}
    for s in stops:
        if s.id in used_stop_ids:
            x, y = wgs84_to_local(s.lat, s.lon, ref_lat, ref_lon)
            n = SceneNode(id=f"stop_{s.id}", x=x, y=y, type="transit_stop")
            scene_nodes.append(n)
            stop_map[s.id] = n
            
    # For MVP, we'll map one trip per route as the representative transit line
    # (In reality, routes have many trips; we just want the spatial layout)
    route_map = {r.id: r for r in routes}
    
    added_routes = set()
    scene_lines = []
    
    for t in trips:
        if t.route_id not in added_routes and t.route_id in route_map:
            added_routes.add(t.route_id)
            r = route_map[t.route_id]
            scene_lines.append(SceneTransitLine(
                id=f"line_{r.id}",
                name=r.name,
                mode=r.mode,
                stop_node_ids=[f"stop_{sid}" for sid in t.stop_ids],
                headway_minutes=15 # Default
            ))
            
    return scene_nodes, scene_lines
