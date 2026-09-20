from core.algorithms.graph import DirectedGraph
from core.disasters.emergency_access import compute_isolation_metrics

def test_isolation_metrics():
    graph = DirectedGraph()
    graph.add_node("A")
    graph.add_node("B")
    graph.add_node("C")
    
    graph.add_edge("A", "B", weight=10.0, capacity=100)
    graph.add_edge("B", "C", weight=10.0, capacity=100)
    
    metrics = compute_isolation_metrics(graph)
    assert metrics["component_count"] == 1
    assert metrics["largest_component_size"] == 3
    assert len(metrics["isolated_nodes"]) == 0
    assert metrics["isolation_ratio"] == 0.0
    
    # Break graph
    graph = DirectedGraph()
    graph.add_node("A")
    graph.add_node("B")
    graph.add_node("C")
    graph.add_edge("A", "B", weight=10.0, capacity=100)
    # C is isolated
    
    metrics = compute_isolation_metrics(graph)
    assert metrics["component_count"] == 2
    assert metrics["largest_component_size"] == 2
    assert "C" in metrics["isolated_nodes"]
    assert metrics["isolation_ratio"] == 1/3
