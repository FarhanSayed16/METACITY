from core.schema.scene import Scene, SceneNode, SceneLink
from core.network.builder import build_network_from_scene
from core.network.validation import validate_network_connectivity

def test_build_network():
    n1 = SceneNode(id="n1", x=0, y=0)
    n2 = SceneNode(id="n2", x=3000, y=4000) # hypot is 5000m
    l1 = SceneLink(id="l1", from_node="n1", to_node="n2", speed_kph=60, oneway=True)
    
    scene = Scene(name="Test", nodes=[n1, n2], links=[l1])
    g = build_network_from_scene(scene)
    
    # Check nodes
    assert set(g.nodes) == {"n1", "n2"}
    
    # Check edges
    edge = g.get_edge_data("n1", "n2")
    assert edge is not None
    assert edge["length_m"] == 5000.0
    
    # 60km/h = 16.666m/s. 5000m / 16.666m/s = 300s = 5 minutes
    assert abs(edge["free_flow_time_m"] - 5.0) < 0.01
    
    # It was oneway, so no reverse edge
    assert g.get_edge_data("n2", "n1") is None

def test_validation():
    n1 = SceneNode(id="n1", x=0, y=0)
    n2 = SceneNode(id="n2", x=1, y=1)
    l1 = SceneLink(id="l1", from_node="n1", to_node="n2", oneway=True) # Weakly connected
    
    scene = Scene(name="Test", nodes=[n1, n2], links=[l1])
    g = build_network_from_scene(scene)
    
    val = validate_network_connectivity(g)
    assert val["is_connected"] is True
