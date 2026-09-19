from collections import deque
from typing import Hashable
from .graph import DirectedGraph

def bfs_reachability(graph: DirectedGraph, source: Hashable) -> set[Hashable]:
    """Return the set of all nodes reachable from the source."""
    if source not in graph.nodes_data:
        return set()
        
    visited = {source}
    queue = deque([source])
    
    while queue:
        u = queue.popleft()
        for v in graph.neighbors(u):
            if v not in visited:
                visited.add(v)
                queue.append(v)
                
    return visited

def get_weakly_connected_components(graph: DirectedGraph) -> list[set[Hashable]]:
    """Return all weakly connected components of a directed graph."""
    from .union_find import UnionFind
    
    uf = UnionFind(graph.nodes)
    for u in graph.nodes:
        for v in graph.neighbors(u):
            uf.union(u, v)
            
    return uf.get_components()
