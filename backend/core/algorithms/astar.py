from typing import Hashable, Callable
from .graph import DirectedGraph
from .heap import MinHeap

def astar(
    graph: DirectedGraph, 
    source: Hashable, 
    target: Hashable,
    heuristic_func: Callable[[Hashable, Hashable], float],
    weight_func: Callable[[Hashable, Hashable, dict], float] = lambda u, v, d: d.get("weight", 1.0)
) -> tuple[list[Hashable] | None, float]:
    """
    A* search for the shortest path from source to target.
    
    Returns:
        path: List of nodes forming the path, or None if no path exists.
        cost: The total weight of the path (infinity if no path).
    """
    if source not in graph.nodes_data or target not in graph.nodes_data:
        return None, float('inf')
        
    distances = {source: 0.0}
    predecessors = {}
    heap = MinHeap()
    
    # Push (f_score, node)
    # f_score = g_score (dist) + h_score (heuristic)
    h_start = heuristic_func(source, target)
    heap.push(h_start, source)
    
    visited = set()
    
    while not heap.is_empty():
        f_u, u = heap.pop()
        
        if u == target:
            # Reconstruct path
            path = []
            curr = target
            while curr in predecessors:
                path.append(curr)
                curr = predecessors[curr]
            path.append(source)
            path.reverse()
            return path, distances[target]
            
        if u in visited:
            continue
        visited.add(u)
        
        for v in graph.neighbors(u):
            edge_data = graph.get_edge_data(u, v)
            weight = weight_func(u, v, edge_data)
            
            if weight < 0:
                raise ValueError("A* cannot handle negative weights")
                
            tentative_g = distances[u] + weight
            
            if tentative_g < distances.get(v, float('inf')):
                distances[v] = tentative_g
                predecessors[v] = u
                
                f_v = tentative_g + heuristic_func(v, target)
                heap.push(f_v, v)
                
    return None, float('inf')
