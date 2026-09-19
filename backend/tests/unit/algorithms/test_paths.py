from core.algorithms.graph import DirectedGraph
from core.algorithms.dijkstra import dijkstra
from core.algorithms.astar import astar
import math

def test_dijkstra():
    g = DirectedGraph()
    g.add_edge("A", "B", weight=1.0)
    g.add_edge("B", "C", weight=2.0)
    g.add_edge("A", "C", weight=4.0)
    
    dist, pred = dijkstra(g, "A")
    assert dist["C"] == 3.0
    assert pred["C"] == "B"

def test_astar():
    g = DirectedGraph()
    # Coordinates for heuristic
    g.add_node("A", x=0, y=0)
    g.add_node("B", x=1, y=0)
    g.add_node("C", x=2, y=0)
    
    g.add_edge("A", "B", weight=1.0)
    g.add_edge("B", "C", weight=1.0)
    
    def heuristic(u, v):
        d1 = g.get_node_data(u)
        d2 = g.get_node_data(v)
        return math.hypot(d1["x"] - d2["x"], d1["y"] - d2["y"])
        
    path, cost = astar(g, "A", "C", heuristic_func=heuristic)
    assert path == ["A", "B", "C"]
    assert cost == 2.0
