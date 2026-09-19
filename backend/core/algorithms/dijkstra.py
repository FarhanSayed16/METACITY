from typing import Hashable, Callable
from .graph import DirectedGraph
from .heap import MinHeap

def dijkstra(
    graph: DirectedGraph, 
    source: Hashable, 
    weight_func: Callable[[Hashable, Hashable, dict], float] = lambda u, v, d: d.get("weight", 1.0)
) -> tuple[dict[Hashable, float], dict[Hashable, Hashable]]:
    """
    Compute shortest paths from a source to all reachable nodes.
    
    Returns:
        distances: dict mapping node to shortest distance from source
        predecessors: dict mapping node to its predecessor on the shortest path
    """
    distances = {source: 0.0}
    predecessors = {}
    heap = MinHeap()
    heap.push(0.0, source)
    
    visited = set()
    
    while not heap.is_empty():
        dist_u, u = heap.pop()
        
        if u in visited:
            continue
        visited.add(u)
        
        for v in graph.neighbors(u):
            edge_data = graph.get_edge_data(u, v)
            weight = weight_func(u, v, edge_data)
            
            if weight < 0:
                raise ValueError(f"Dijkstra cannot handle negative weights (edge {u}->{v} has weight {weight})")
                
            alt = dist_u + weight
            
            if alt < distances.get(v, float('inf')):
                distances[v] = alt
                predecessors[v] = u
                heap.push(alt, v)
                
    return distances, predecessors
