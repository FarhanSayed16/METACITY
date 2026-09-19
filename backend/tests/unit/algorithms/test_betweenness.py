from core.algorithms.graph import DirectedGraph
from core.algorithms.betweenness import brandes_betweenness_centrality

def test_betweenness_centrality():
    g = DirectedGraph()
    # Star graph: center is 1
    g.add_edge(2, 1)
    g.add_edge(1, 2)
    g.add_edge(3, 1)
    g.add_edge(1, 3)
    g.add_edge(4, 1)
    g.add_edge(1, 4)
    
    cb = brandes_betweenness_centrality(g)
    # 1 should have highest centrality
    assert cb[1] > cb[2]
    assert cb[2] == 0.0
