from collections import deque
from core.algorithms.dijkstra import dijkstra
from core.algorithms.graph import DirectedGraph

def compute_emergency_access(
    graph: DirectedGraph,
    hospital_node_ids: list[str],
) -> dict[str, float]:
    """
    For each node, compute the shortest travel time to the nearest hospital.
    Returns {node_id: minutes_to_nearest_hospital}.
    Nodes with no path to any hospital get value = float('inf').
    """
    access = {}
    for node_id in graph.nodes:
        min_time = float('inf')
        
        # Get distances from this node to all reachable nodes
        distances, _ = dijkstra(graph, node_id)
        
        for hosp_id in hospital_node_ids:
            if hosp_id not in graph.nodes:
                continue
            path_cost = distances.get(hosp_id, float('inf'))
            if path_cost < min_time:
                min_time = path_cost
        
        # Convert path cost (which is travel time in hours in this graph) to minutes
        if min_time != float('inf'):
            access[node_id] = min_time * 60.0
        else:
            access[node_id] = float('inf')
            
    return access

def compute_isolation_metrics(
    graph: DirectedGraph,
) -> dict:
    """
    BFS-based: compute strongly/weakly connected components?
    For a road network, we can compute weakly connected components (ignoring edge direction) 
    or strongly connected components.
    Let's compute weakly connected components to see if nodes are physically severed.
    Returns {
        "component_count": int,
        "largest_component_size": int,
        "isolated_nodes": list[str],
        "isolation_ratio": float,  # isolated / total
    }
    """
    visited = set()
    components = []
    
    # Build undirected adjacency list for weakly connected components
    adj = {n: set() for n in graph.nodes}
    for u in graph.nodes:
        for v in graph.neighbors(u):
            adj[u].add(v)
            adj[v].add(u)
            
    for node in graph.nodes:
        if node not in visited:
            comp = []
            q = deque([node])
            visited.add(node)
            while q:
                curr = q.popleft()
                comp.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        q.append(neighbor)
            components.append(comp)
            
    if not components:
        return {
            "component_count": 0,
            "largest_component_size": 0,
            "isolated_nodes": [],
            "isolation_ratio": 0.0
        }
        
    components.sort(key=len, reverse=True)
    largest_size = len(components[0])
    
    # "Isolated nodes" are all nodes not in the largest component
    isolated_nodes = []
    for c in components[1:]:
        isolated_nodes.extend(c)
        
    total_nodes = sum(1 for _ in graph.nodes)
    ratio = len(isolated_nodes) / total_nodes if total_nodes > 0 else 0.0
    
    return {
        "component_count": len(components),
        "largest_component_size": largest_size,
        "isolated_nodes": isolated_nodes,
        "isolation_ratio": ratio
    }
