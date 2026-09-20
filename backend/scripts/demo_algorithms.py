import sys
import os
import math

# Add backend to path so we can run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.algorithms.graph import DirectedGraph
from core.algorithms.dijkstra import dijkstra
from core.algorithms.astar import astar
from core.algorithms.bfs import bfs_reachability

def run_demo():
    print("--- METACITY Algorithms Demo ---")
    
    # 1. Build Graph
    print("\n1. Building a simple city grid graph...")
    g = DirectedGraph()
    
    # Add nodes (A, B, C, D) in a square
    g.add_node("A", x=0, y=0)
    g.add_node("B", x=100, y=0)
    g.add_node("C", x=100, y=100)
    g.add_node("D", x=0, y=100)
    
    # Add bidirectional edges
    edges = [
        ("A", "B", 10), ("B", "A", 10),
        ("B", "C", 15), ("C", "B", 15),
        ("C", "D", 10), ("D", "C", 10),
        ("D", "A", 15), ("A", "D", 15),
    ]
    for u, v, w in edges:
        g.add_edge(u, v, weight=w)
    
    print(f"Graph built with {len(list(g.nodes))} nodes and {len(list(g.edges))} edges.")
    
    # 2. Run BFS
    print("\n2. Running Breadth-First Search from node A...")
    reachable = bfs_reachability(g, "A")
    print(f"BFS Reachability from A: {list(reachable)}")
    
    # 3. Run Dijkstra
    print("\n3. Running Dijkstra Shortest Path from A to C...")
    dist, pred = dijkstra(g, "A")
    print(f"Shortest path costs from A: {dist}")
    
    # Reconstruct path
    path = []
    curr = "C"
    while curr:
        path.append(curr)
        curr = pred.get(curr)
    path.reverse()
    print(f"Dijkstra Path A -> C: {' -> '.join(path)} (Cost: {dist['C']})")
    
    # 4. Run A*
    print("\n4. Running A* Shortest Path from A to C...")
    def heuristic(u, v):
        d1 = g.get_node_data(u)
        d2 = g.get_node_data(v)
        return math.hypot(d1["x"] - d2["x"], d1["y"] - d2["y"]) / 10.0 # scale factor
        
    path, cost = astar(g, "A", "C", heuristic_func=heuristic)
    print(f"A* Path A -> C: {' -> '.join(path)} (Cost: {cost})")

if __name__ == "__main__":
    run_demo()
