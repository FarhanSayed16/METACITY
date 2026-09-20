"""Convert Overpass OSM elements into a METACITY Scene (schema-aligned)."""
import json
import math
import urllib.request
from typing import Any

from core.schema.scene import Scene, SceneNode, SceneLink
from core.geo.crs import wgs84_to_local

OSM_ATTRIBUTION = "© OpenStreetMap contributors. Data available under ODbL."

# highway tag → (speed_kph, capacity_per_lane_per_hour, lanes, road_class)
_HIGHWAY_DEFAULTS: dict[str, tuple[float, int, int, str]] = {
    "motorway": (100.0, 2000, 2, "motorway"),
    "trunk": (90.0, 1800, 2, "trunk"),
    "primary": (60.0, 1200, 2, "primary"),
    "secondary": (50.0, 1000, 1, "secondary"),
    "tertiary": (40.0, 900, 1, "tertiary"),
    "residential": (30.0, 800, 1, "local"),
    "unclassified": (40.0, 800, 1, "local"),
    "service": (20.0, 400, 1, "local"),
}


def overpass_elements_to_scene(
    elements: list[dict[str, Any]],
    *,
    ref_lat: float,
    ref_lon: float,
    name: str = "OSM Imported Scene",
) -> Scene:
    """
    Convert Overpass `elements` (nodes + ways) into a validated Scene.
    Pure function — no network I/O. Used by fetch_osm_bbox and unit tests.
    """
    nodes_ll: dict[int, dict[str, float]] = {}
    for el in elements:
        if el.get("type") == "node":
            nodes_ll[el["id"]] = {"lat": el["lat"], "lon": el["lon"]}

    scene_links: list[SceneLink] = []
    used_nodes: set[int] = set()
    ways = [el for el in elements if el.get("type") == "way"]

    for way in ways:
        way_nodes = way.get("nodes") or []
        tags = way.get("tags") or {}
        hw = tags.get("highway", "unclassified")
        speed_kph, capacity, lanes, road_class = _HIGHWAY_DEFAULTS.get(
            hw, (50.0, 1000, 1, "local")
        )

        # Optional OSM overrides
        if "maxspeed" in tags:
            try:
                speed_kph = float(str(tags["maxspeed"]).split()[0])
            except (TypeError, ValueError):
                pass
        if "lanes" in tags:
            try:
                lanes = max(1, int(str(tags["lanes"]).split(";")[0]))
            except (TypeError, ValueError):
                pass

        oneway = tags.get("oneway") in ("yes", "true", "1")

        for i in range(len(way_nodes) - 1):
            n1_id = way_nodes[i]
            n2_id = way_nodes[i + 1]
            if n1_id not in nodes_ll or n2_id not in nodes_ll:
                continue

            used_nodes.add(n1_id)
            used_nodes.add(n2_id)

            n1 = nodes_ll[n1_id]
            n2 = nodes_ll[n2_id]
            x1, y1 = wgs84_to_local(n1["lat"], n1["lon"], ref_lat, ref_lon)
            x2, y2 = wgs84_to_local(n2["lat"], n2["lon"], ref_lat, ref_lon)
            length_m = math.hypot(x2 - x1, y2 - y1)

            scene_links.append(
                SceneLink(
                    id=f"way_{way['id']}_{i}_f",
                    from_node=str(n1_id),
                    to_node=str(n2_id),
                    lanes=lanes,
                    speed_kph=speed_kph,
                    capacity_per_lane_per_hour=capacity,
                    road_class=road_class,
                    oneway=oneway,
                    length_m=length_m if length_m > 0 else 1.0,
                )
            )

            if not oneway:
                scene_links.append(
                    SceneLink(
                        id=f"way_{way['id']}_{i}_b",
                        from_node=str(n2_id),
                        to_node=str(n1_id),
                        lanes=lanes,
                        speed_kph=speed_kph,
                        capacity_per_lane_per_hour=capacity,
                        road_class=road_class,
                        oneway=False,
                        length_m=length_m if length_m > 0 else 1.0,
                    )
                )

    scene_nodes = []
    for n_id in used_nodes:
        lat, lon = nodes_ll[n_id]["lat"], nodes_ll[n_id]["lon"]
        x, y = wgs84_to_local(lat, lon, ref_lat, ref_lon)
        scene_nodes.append(SceneNode(id=str(n_id), x=x, y=y))

    # Approximate bounds from projected extents
    if scene_nodes:
        xs = [n.x for n in scene_nodes]
        ys = [n.y for n in scene_nodes]
        width = max(xs) - min(xs)
        height = max(ys) - min(ys)
        bounds = {"width_m": max(width, 100.0), "height_m": max(height, 100.0)}
    else:
        bounds = {"width_m": 1000.0, "height_m": 1000.0}

    scene = Scene(
        name=name,
        description=f"Imported from OpenStreetMap. {OSM_ATTRIBUTION}",
        nodes=scene_nodes,
        links=scene_links,
        zones=[],
        bounds=bounds,
    )
    errors = scene.validate_references()
    if errors:
        raise ValueError(f"OSM conversion produced invalid scene: {', '.join(errors)}")
    return scene


def fetch_osm_bbox(min_lon: float, min_lat: float, max_lon: float, max_lat: float) -> Scene:
    """
    Uses the Overpass API to fetch highways in a bounding box and convert to METACITY Scene.
    """
    query = f"""
    [out:json];
    (
      way["highway"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out body;
    >;
    out skel qt;
    """

    url = "https://overpass-api.de/api/interpreter"
    data = query.encode("utf-8")
    req = urllib.request.Request(url, data=data)

    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode("utf-8"))

    elements = result.get("elements", [])
    return overpass_elements_to_scene(
        elements,
        ref_lat=min_lat,
        ref_lon=min_lon,
        name="OSM Imported Scene",
    )
