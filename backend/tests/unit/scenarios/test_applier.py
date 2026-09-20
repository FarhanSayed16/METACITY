"""Tests for core.scenarios.applier — the scenario diff applier."""
import pytest
from core.schema.scene import Scene, SceneNode, SceneLink, SceneZone, SceneFacility
from core.scenarios.applier import apply_scenario


def _make_scene():
    """Create a minimal test scene."""
    return Scene(
        name="Test",
        nodes=[
            SceneNode(id="n1", x=0, y=0),
            SceneNode(id="n2", x=1000, y=0),
            SceneNode(id="n3", x=500, y=500),
        ],
        links=[
            SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50),
            SceneLink(id="l2", from_node="n2", to_node="n3", lanes=1, speed_kph=30),
        ],
        zones=[SceneZone(id="z1", name="Test Zone", land_use="residential")],
    )


def test_add_node():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "add_node", "data": {"id": "n4", "x": 200, "y": 200}}
    ])
    assert len(result.nodes) == 4
    assert any(n.id == "n4" for n in result.nodes)


def test_add_link():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "add_link", "data": {"id": "l3", "from_node": "n1", "to_node": "n3", "lanes": 3, "speed_kph": 60}}
    ])
    assert len(result.links) == 3
    new_link = next(l for l in result.links if l.id == "l3")
    assert new_link.lanes == 3


def test_remove_link():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "remove_link", "data": {"id": "l2"}}
    ])
    assert len(result.links) == 1
    assert result.links[0].id == "l1"


def test_set_lanes():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "set_lanes", "data": {"id": "l1", "lanes": 6}}
    ])
    link = next(l for l in result.links if l.id == "l1")
    assert link.lanes == 6


def test_set_speed():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "set_speed", "data": {"id": "l1", "speed_kph": 120.0}}
    ])
    link = next(l for l in result.links if l.id == "l1")
    assert link.speed_kph == 120.0


def test_set_capacity():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "set_capacity", "data": {"id": "l1", "capacity_per_lane_per_hour": 2500}}
    ])
    link = next(l for l in result.links if l.id == "l1")
    assert link.capacity_per_lane_per_hour == 2500


def test_close_link():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "close_link", "data": {"id": "l1"}}
    ])
    link = next(l for l in result.links if l.id == "l1")
    assert link.capacity_per_lane_per_hour == 0
    assert link.speed_kph == 1.0


def test_add_facility():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "add_facility", "data": {"id": "f1", "type": "school", "zone_id": "z1", "x": 100, "y": 100}}
    ])
    assert len(result.facilities) == 1
    assert result.facilities[0].id == "f1"


def test_does_not_mutate_original():
    scene = _make_scene()
    original_link_count = len(scene.links)
    apply_scenario(scene, [
        {"type": "add_link", "data": {"id": "l3", "from_node": "n1", "to_node": "n3", "lanes": 2, "speed_kph": 40}}
    ])
    assert len(scene.links) == original_link_count


def test_invalid_link_raises():
    """Adding a link to a non-existent node should raise ValueError."""
    scene = _make_scene()
    with pytest.raises(ValueError, match="invalid scene"):
        apply_scenario(scene, [
            {"type": "add_link", "data": {"id": "l_bad", "from_node": "n1", "to_node": "n_nonexistent", "lanes": 1, "speed_kph": 30}}
        ])


def test_duplicate_node_skipped():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "add_node", "data": {"id": "n1", "x": 999, "y": 999}}
    ])
    # Should still have 3 nodes (duplicate skipped)
    assert len(result.nodes) == 3


def test_flood_op():
    scene = _make_scene()
    # n3 at (500,500) has elevation ~0 relative to river at x=500
    result = apply_scenario(scene, [
        {"type": "flood", "data": {"water_level": 10.0}}
    ])
    closed = [l for l in result.links if l.capacity_per_lane_per_hour == 0]
    assert len(closed) >= 1


def test_outage_op():
    scene = _make_scene()
    result = apply_scenario(scene, [
        {"type": "outage", "data": {"link_ids": ["l1"]}}
    ])
    link = next(l for l in result.links if l.id == "l1")
    assert link.capacity_per_lane_per_hour == 0


def test_global_demand_scale():
    scene = _make_scene()
    scene.parameters.total_population = 1000
    result = apply_scenario(scene, [
        {"type": "global_demand_scale", "data": {"scale": 1.5}}
    ])
    assert result.parameters.total_population == 1500
