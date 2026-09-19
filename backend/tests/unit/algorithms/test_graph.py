from core.algorithms.graph import DirectedGraph
from core.algorithms.bfs import bfs_reachability, get_weakly_connected_components
from core.algorithms.bridges import find_bridges

def test_graph_construction():
    g = DirectedGraph()
    g.add_edge(1, 2, weight=5.0)
    g.add_edge(2, 3, weight=1.0)
    
    assert set(g.nodes) == {1, 2, 3}
    assert list(g.neighbors(1)) == [2]
    assert g.get_edge_data(1, 2)["weight"] == 5.0

def test_bfs_reachability():
    g = DirectedGraph()
    g.add_edge(1, 2)
    g.add_edge(2, 3)
    g.add_edge(4, 5) # Disconnected component
    
    reachable = bfs_reachability(g, 1)
    assert reachable == {1, 2, 3}
    
def test_weakly_connected_components():
    g = DirectedGraph()
    g.add_edge(1, 2)
    g.add_edge(3, 4)
    # two components: {1,2} and {3,4}
    comps = get_weakly_connected_components(g)
    assert len(comps) == 2
    
def test_find_bridges():
    g = DirectedGraph()
    g.add_edge(1, 2)
    g.add_edge(2, 3)
    g.add_edge(3, 1) # cycle 1-2-3
    g.add_edge(3, 4) # bridge
    g.add_edge(4, 5)
    g.add_edge(5, 4)
    
    bridges = find_bridges(g)
    assert len(bridges) == 3
    # Structural bridges: (3, 4), and both (4, 5) and (5, 4)
    assert (3, 4) in bridges or (4, 3) in bridges
