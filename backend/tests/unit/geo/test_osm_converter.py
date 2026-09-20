"""Unit tests for OSM → Scene converter (no live Overpass)."""
from core.geo.osm_converter import overpass_elements_to_scene
from core.schema.scene import Scene


# Minimal Overpass-shaped fixture: 3 nodes, 1 bidirectional highway way
FIXTURE_ELEMENTS = [
    {"type": "node", "id": 101, "lat": 51.50, "lon": -0.12},
    {"type": "node", "id": 102, "lat": 51.501, "lon": -0.12},
    {"type": "node", "id": 103, "lat": 51.502, "lon": -0.119},
    {
        "type": "way",
        "id": 9001,
        "nodes": [101, 102, 103],
        "tags": {"highway": "primary", "lanes": "2"},
    },
]


def test_overpass_elements_to_scene_schema():
    scene = overpass_elements_to_scene(
        FIXTURE_ELEMENTS,
        ref_lat=51.50,
        ref_lon=-0.12,
        name="OSM Test",
    )
    assert isinstance(scene, Scene)
    assert scene.name == "OSM Test"
    assert len(scene.nodes) == 3
    # primary, not oneway → 2 segments × 2 directions = 4 links
    assert len(scene.links) == 4

    link = scene.links[0]
    assert link.from_node is not None
    assert link.to_node is not None
    assert hasattr(link, "speed_kph")
    assert hasattr(link, "capacity_per_lane_per_hour")
    assert hasattr(link, "length_m")
    assert link.length_m is not None and link.length_m > 0
    assert link.speed_kph == 60.0  # primary default
    assert link.capacity_per_lane_per_hour == 1200
    assert link.lanes == 2

    # Round-trip through Scene validation
    Scene.model_validate(scene.model_dump())
    assert scene.validate_references() == []


def test_oneway_produces_single_direction():
    elements = [
        {"type": "node", "id": 1, "lat": 0.0, "lon": 0.0},
        {"type": "node", "id": 2, "lat": 0.001, "lon": 0.0},
        {
            "type": "way",
            "id": 10,
            "nodes": [1, 2],
            "tags": {"highway": "motorway", "oneway": "yes"},
        },
    ]
    scene = overpass_elements_to_scene(elements, ref_lat=0.0, ref_lon=0.0)
    assert len(scene.links) == 1
    assert scene.links[0].oneway is True
    assert scene.links[0].from_node == "1"
    assert scene.links[0].to_node == "2"
    assert scene.links[0].road_class == "motorway"
