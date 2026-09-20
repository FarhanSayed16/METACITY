import pytest
from hypothesis import given, strategies as st
from core.algorithms.graph import DirectedGraph
from core.algorithms.dijkstra import dijkstra
from core.algorithms.astar import astar
import math
import random

def generate_random_graph(n_nodes, p_edge=0.3):
    g = DirectedGraph()
    # Generate nodes with coordinates
    for i in range(n_nodes):
        g.add_node(f"N{i}", x=random.uniform(0, 100), y=random.uniform(0, 100))
    
    # Generate random edges
    edges = []
    for i in range(n_nodes):
        for j in range(n_nodes):
            if i != j and random.random() < p_edge:
                d1 = g.get_node_data(f"N{i}")
                d2 = g.get_node_data(f"N{j}")
                # Weight must be >= Euclidean distance for A* heuristic to be admissible
                euclidean_dist = math.hypot(d1["x"] - d2["x"], d1["y"] - d2["y"])
                weight = euclidean_dist + random.uniform(0, 10) # Add some positive random delay
                g.add_edge(f"N{i}", f"N{j}", weight=weight)
                edges.append((f"N{i}", f"N{j}", weight))
    return g

@given(st.integers(min_value=5, max_value=20), st.floats(min_value=0.1, max_value=0.8), st.integers(min_value=0, max_value=1000))
def test_astar_equals_dijkstra(n_nodes, p_edge, seed):
    random.seed(seed)
    g = generate_random_graph(n_nodes, p_edge)
    
    start = f"N{random.randint(0, n_nodes-1)}"
    target = f"N{random.randint(0, n_nodes-1)}"
    
    if start == target:
        return
        
    def heuristic(u, v):
        d1 = g.get_node_data(u)
        d2 = g.get_node_data(v)
        return math.hypot(d1["x"] - d2["x"], d1["y"] - d2["y"])
        
    dist, pred = dijkstra(g, start)
    dijkstra_cost = dist.get(target, float('inf'))
    
    try:
        path, astar_cost = astar(g, start, target, heuristic_func=heuristic)
    except ValueError: # Assuming it might raise ValueError if no path found
        astar_cost = float('inf')
        
    if math.isinf(dijkstra_cost):
        # If Dijkstra found no path, A* should also find no path (or raise error)
        assert math.isinf(astar_cost)
    else:
        # Both should find the exact same shortest path cost
        # Allowing for small float precision differences
        assert math.isclose(dijkstra_cost, astar_cost, rel_tol=1e-5), f"Mismatch: Dijkstra={dijkstra_cost}, A*={astar_cost}"
