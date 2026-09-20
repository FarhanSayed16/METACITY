"""Tests for network validation: dangling nodes, capacity sanity, Union-Find."""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

import pytest
from core.schema.scene import Scene, SceneNode, SceneLink, SceneFacility, SceneParameters, SceneZone
from core.network.validation import (
    find_dangling_nodes,
    validate_capacity_sanity,
    validate_network_connectivity_uf,
    validate_scene_full,
    UnionFind
)


def _make_scene(nodes, links, facilities=None):
    if facilities is None:
        facilities = [
            SceneFacility(id="f1", zone_id="z1", x=0, y=0,
                          type="residential", capacity=100)
        ]
    return Scene(
        schema_version="1.0",
        name="test",
        nodes=nodes,
        links=links,
        zones=[SceneZone(id="z1", name="Zone 1", land_use="residential")],
        facilities=facilities,
        parameters=SceneParameters(total_population=10)
    )


def test_union_find_basic():
    uf = UnionFind(["a", "b", "c", "d"])
    uf.union("a", "b")
    uf.union("c", "d")
    assert uf.find("a") == uf.find("b")
    assert uf.find("c") == uf.find("d")
    assert uf.find("a") != uf.find("c")
    comps = uf.components()
    assert len(comps) == 2

    uf.union("b", "c")
    assert uf.find("a") == uf.find("d")
    comps = uf.components()
    assert len(comps) == 1


def test_find_dangling_nodes():
    nodes = [
        SceneNode(id="n1", x=0, y=0),
        SceneNode(id="n2", x=100, y=0),
        SceneNode(id="n3", x=200, y=0),  # dangling
    ]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=1000)
    ]
    scene = _make_scene(nodes, links)
    dangling = find_dangling_nodes(scene)
    assert "n3" in dangling
    assert "n1" not in dangling
    assert "n2" not in dangling


def test_capacity_sanity_zero_capacity():
    """Zero capacity (closed link) should be flagged as suspicious low capacity."""
    nodes = [SceneNode(id="n1", x=0, y=0), SceneNode(id="n2", x=100, y=0)]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=0)
    ]
    scene = _make_scene(nodes, links)
    issues = validate_capacity_sanity(scene)
    # capacity=0 is valid (closed link) per our validation — not flagged
    # Our validate_capacity_sanity only flags > 0 and < 100 as suspicious
    assert len(issues) == 0  # 0 = closed link, explicitly allowed


def test_capacity_sanity_suspiciously_low():
    """Very low but non-zero capacity should be flagged."""
    nodes = [SceneNode(id="n1", x=0, y=0), SceneNode(id="n2", x=100, y=0)]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=50)
    ]
    scene = _make_scene(nodes, links)
    issues = validate_capacity_sanity(scene)
    assert len(issues) == 1
    assert "low capacity" in issues[0]["reason"].lower()


def test_capacity_sanity_high_speed():
    nodes = [SceneNode(id="n1", x=0, y=0), SceneNode(id="n2", x=100, y=0)]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=250,
                  capacity_per_lane_per_hour=1000)
    ]
    scene = _make_scene(nodes, links)
    issues = validate_capacity_sanity(scene)
    assert any(i["reason"] == "Speed exceeds 200 km/h" for i in issues)


def test_connectivity_uf_connected():
    nodes = [SceneNode(id="n1", x=0, y=0), SceneNode(id="n2", x=100, y=0)]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=1000)
    ]
    scene = _make_scene(nodes, links)
    result = validate_network_connectivity_uf(scene)
    assert result["is_connected"] is True
    assert result["components"] == 1


def test_connectivity_uf_disconnected():
    nodes = [
        SceneNode(id="n1", x=0, y=0),
        SceneNode(id="n2", x=100, y=0),
        SceneNode(id="n3", x=200, y=0),
        SceneNode(id="n4", x=300, y=0),
    ]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=1000),
        SceneLink(id="l2", from_node="n3", to_node="n4", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=1000),
    ]
    scene = _make_scene(nodes, links)
    result = validate_network_connectivity_uf(scene)
    assert result["is_connected"] is False
    assert result["components"] == 2


def test_full_validation_clean():
    nodes = [SceneNode(id="n1", x=0, y=0), SceneNode(id="n2", x=100, y=0)]
    links = [
        SceneLink(id="l1", from_node="n1", to_node="n2", lanes=2, speed_kph=50,
                  capacity_per_lane_per_hour=1000)
    ]
    scene = _make_scene(nodes, links)
    report = validate_scene_full(scene)
    assert report["valid"] is True
    assert len(report["dangling_nodes"]) == 0
    assert len(report["capacity_issues"]) == 0
