"""Traffic assignment — compute link volumes from routed trips."""

def assign_trips_to_links(
    trips: list[dict],
    network
) -> dict[str, float]:
    """
    Given a list of routed trips (each with a 'path' list of node IDs),
    compute the volume on each link.
    
    Args:
        trips: List of dicts with at least {'path': [node_id, ...]}
        network: RoadNetwork instance.
        
    Returns:
        Dict {link_id: total_volume}.
    """
    volumes: dict[str, float] = {}
    
    for trip in trips:
        path = trip.get("path", [])
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            d = network.get_edge_data(u, v)
            if d:
                link_id = d.get("link_id")
                if link_id:
                    volumes[link_id] = volumes.get(link_id, 0) + 1
                    
    return volumes
