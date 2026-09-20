"""Unit tests for flood / outage disaster engines."""
from core.schema.scene import Scene, SceneNode, SceneLink, SceneZone
from core.disasters.flood import apply_flood
from core.disasters.outage import apply_outage
from core.scenarios.applier import apply_scenario


def _river_scene():
    """Nodes near x=500 are low elevation (flooded first)."""
    return Scene(
        name="FloodTest",
        nodes=[
            SceneNode(id="edge", x=0, y=0),
            SceneNode(id="mid", x=500, y=0),
            SceneNode(id="far", x=1000, y=0),
        ],
        links=[
            SceneLink(id="l_edge_mid", from_node="edge", to_node="mid", lanes=2, speed_kph=50),
            SceneLink(id="l_mid_far", from_node="mid", to_node="far", lanes=2, speed_kph=50),
            SceneLink(id="l_far_only", from_node="far", to_node="edge", lanes=1, speed_kph=30),
        ],
        zones=[SceneZone(id="z1", name="Z", land_use="mixed", center_x=500, center_y=0)],
    )


def test_apply_flood_closes_low_links_schema_safe():
    scene = _river_scene()
    # water_level high enough that mid (elevation≈0) floods; edge elevation=25
    flooded = apply_flood(scene, water_level=5.0)

    mid_links = [l for l in flooded.links if l.from_node == "mid" or l.to_node == "mid"]
    assert len(mid_links) >= 1
    for link in mid_links:
        assert link.capacity_per_lane_per_hour == 0
        assert link.speed_kph == 1.0

    # Original unmodified
    assert scene.links[0].capacity_per_lane_per_hour == 1800


def test_apply_outage_by_link_ids():
    scene = _river_scene()
    outaged = apply_outage(scene, link_ids=["l_edge_mid"])
    closed = next(l for l in outaged.links if l.id == "l_edge_mid")
    assert closed.capacity_per_lane_per_hour == 0
    assert closed.speed_kph == 1.0
    open_link = next(l for l in outaged.links if l.id == "l_mid_far")
    assert open_link.capacity_per_lane_per_hour == 1800


def test_applier_flood_op():
    scene = _river_scene()
    result = apply_scenario(scene, [{"type": "flood", "data": {"water_level": 5.0}}])
    mid_links = [l for l in result.links if l.from_node == "mid" or l.to_node == "mid"]
    assert any(l.capacity_per_lane_per_hour == 0 for l in mid_links)


def test_applier_outage_op():
    scene = _river_scene()
    result = apply_scenario(
        scene, [{"type": "outage", "data": {"link_ids": ["l_mid_far"]}}]
    )
    link = next(l for l in result.links if l.id == "l_mid_far")
    assert link.capacity_per_lane_per_hour == 0
