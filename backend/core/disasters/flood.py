"""Flood disaster: inundate low-elevation nodes and close connected links."""
import copy

from core.schema.scene import Scene


def apply_flood(scene: Scene, water_level: float) -> Scene:
    """
    Simulates river flooding.

    For MVP, elevation drops towards the centre (x=500).
    Any node whose synthetic elevation is below water_level is inundated.
    Links touching inundated nodes are closed (schema-safe, same as close_link).
    """
    flooded_scene = copy.deepcopy(scene)
    inundated_nodes: set[str] = set()

    for node in flooded_scene.nodes:
        dist_from_river = abs(node.x - 500)
        elevation = dist_from_river * 0.05
        if elevation < water_level:
            inundated_nodes.add(node.id)

    for link in flooded_scene.links:
        if link.from_node in inundated_nodes or link.to_node in inundated_nodes:
            link.capacity_per_lane_per_hour = 0
            link.speed_kph = 1.0

    return flooded_scene
