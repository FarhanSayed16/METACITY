import math
from core.schema.scene import Scene
from core.algorithms.graph import DirectedGraph
from .model import RoadNode, RoadLink

def build_network_from_scene(scene: Scene) -> DirectedGraph:
    """
    Construct a directed graph suitable for routing from the Scene.
    Computes distances and free flow times.
    """
    g = DirectedGraph()
    
    # Add nodes
    node_coords = {}
    for snode in scene.nodes:
        g.add_node(snode.id, x=snode.x, y=snode.y, type=snode.type)
        node_coords[snode.id] = (snode.x, snode.y)
        
    # Add links
    for slink in scene.links:
        # Calculate length if not provided
        if slink.length_m is None:
            x1, y1 = node_coords[slink.from_node]
            x2, y2 = node_coords[slink.to_node]
            length_m = math.hypot(x2 - x1, y2 - y1)
        else:
            length_m = slink.length_m
            
        # Free flow time in minutes
        speed_mps = (slink.speed_kph * 1000) / 3600
        free_flow_sec = length_m / speed_mps
        free_flow_min = free_flow_sec / 60.0
        
        # Total capacity
        capacity = slink.capacity_per_lane_per_hour * slink.lanes
        
        edge_attr = {
            "link_id": slink.id,
            "lanes": slink.lanes,
            "speed_kph": slink.speed_kph,
            "capacity": capacity,
            "length_m": length_m,
            "free_flow_time_m": free_flow_min,
            # Weight for Dijkstra is free flow time by default
            "weight": free_flow_min
        }
        
        g.add_edge(slink.from_node, slink.to_node, **edge_attr)
        if not slink.oneway:
            # Add reverse edge
            # In a real system, you might want a distinct link ID for the reverse direction
            rev_attr = edge_attr.copy()
            rev_attr["link_id"] = f"{slink.id}_rev"
            g.add_edge(slink.to_node, slink.from_node, **rev_attr)
            
    return g
