from typing import Hashable
from .graph import DirectedGraph

def find_bridges(graph: DirectedGraph) -> list[tuple[Hashable, Hashable]]:
    """
    Find bridges in the graph using Tarjan's bridge-finding algorithm.
    Treats the directed graph as undirected for the purpose of finding structural bridges.
    """
    bridges = []
    visited = set()
    discovery_time = {}
    low_time = {}
    parent = {}
    timer = 0
    
    # Pre-build undirected adjacency for structural analysis
    undirected_adj = {u: set() for u in graph.nodes}
    for u in graph.nodes:
        for v in graph.neighbors(u):
            undirected_adj[u].add(v)
            if v not in undirected_adj:
                undirected_adj[v] = set()
            undirected_adj[v].add(u)
            
    def dfs(u):
        nonlocal timer
        visited.add(u)
        discovery_time[u] = low_time[u] = timer
        timer += 1
        
        for v in undirected_adj[u]:
            if v not in visited:
                parent[v] = u
                dfs(v)
                low_time[u] = min(low_time[u], low_time[v])
                
                # If the lowest vertex reachable from subtree under v is 
                # below u in DFS tree, then u-v is a bridge
                if low_time[v] > discovery_time[u]:
                    # To keep consistent with directed edges, check if u->v or v->u exists
                    if v in graph.adj.get(u, {}):
                        bridges.append((u, v))
                    if u in graph.adj.get(v, {}):
                        bridges.append((v, u))
            elif v != parent.get(u):
                low_time[u] = min(low_time[u], discovery_time[v])

    for node in graph.nodes:
        if node not in visited:
            dfs(node)
            
    # Deduplicate bridges due to undirected traversal
    return list(set(bridges))
