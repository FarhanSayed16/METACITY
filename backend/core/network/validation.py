from core.algorithms.graph import DirectedGraph
from core.algorithms.bfs import get_weakly_connected_components

def validate_network_connectivity(graph: DirectedGraph) -> dict:
    """
    Check if the road network is fully connected.
    If not, identifies the largest component and the disconnected sub-islands.
    """
    components = get_weakly_connected_components(graph)
    if not components:
        return {"is_connected": True, "components": 0, "largest_size": 0}
        
    components.sort(key=len, reverse=True)
    is_connected = len(components) == 1
    
    return {
        "is_connected": is_connected,
        "components": len(components),
        "largest_size": len(components[0]),
        "isolated_nodes": sum(len(c) for c in components[1:]) if not is_connected else 0
    }
