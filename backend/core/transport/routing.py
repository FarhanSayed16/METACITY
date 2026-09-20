"""Transport routing facade — pure function for pathfinding."""
import math
from core.algorithms.astar import astar
from core.network.model import RoadNetwork

def euclidean_heuristic(network: RoadNetwork, u: str, v: str) -> float:
    """Estimate travel time in minutes using straight-line distance and 50 km/h avg speed."""
    n1 = network.nodes_data.get(u)
    n2 = network.nodes_data.get(v)
    if not n1 or not n2:
        return 0.0
    dx = n1.get('x', 0) - n2.get('x', 0)
    dy = n1.get('y', 0) - n2.get('y', 0)
    dist_m = math.hypot(dx, dy)
    return (dist_m / 1000.0) / (50.0 / 60.0)


def find_route(
    network: RoadNetwork,
    origin_node: str,
    dest_node: str,
    congested_times: dict[str, float] | None = None,
    use_astar: bool = True
) -> tuple[float, list[str]]:
    """
    Find shortest route between two nodes.
    
    Args:
        network: The road network graph.
        origin_node: Starting node ID.
        dest_node: Destination node ID.
        congested_times: Optional dict {link_id: travel_time} for congested routing.
        use_astar: Whether to use A* (True) or Dijkstra (False).
        
    Returns:
        Tuple of (total_time, list_of_node_ids). Returns (inf, []) if no path.
    """
    def weight_func(u, v, d):
        link_id = d.get("link_id")
        if congested_times and link_id and link_id in congested_times:
            return congested_times[link_id]
        return d.get("free_flow_time_m", 1.0)
    
    if use_astar:
        path, total_time = astar(
            network, origin_node, dest_node,
            heuristic_func=lambda u, v: euclidean_heuristic(network, u, v),
            weight_func=weight_func
        )
    else:
        from core.algorithms.dijkstra import dijkstra
        path, total_time = dijkstra(network, origin_node, dest_node, weight_func=weight_func)
    
    return (total_time, path)
