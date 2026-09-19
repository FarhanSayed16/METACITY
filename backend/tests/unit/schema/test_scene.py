import pytest
from pathlib import Path
from core.schema.scene import Scene, SceneNode, SceneLink

def test_missing_schema_version_uses_default():
    data = {
        "name": "Test",
        "nodes": [{"id": "n1", "x": 0, "y": 0}],
        "links": []
    }
    scene = Scene.model_validate(data)
    assert scene.schema_version == "1.0.0"

def test_invalid_link_reference_fails():
    data = {
        "name": "Test",
        "nodes": [{"id": "n1", "x": 0, "y": 0}],
        "links": [
            {"id": "l1", "from_node": "n1", "to_node": "n2"} # n2 is missing
        ]
    }
    scene = Scene.model_validate(data)
    errors = scene.validate_references()
    assert len(errors) == 1
    assert "to_node 'n2' not found" in errors[0]

def test_valid_scene_loads():
    n1 = SceneNode(id="n1", x=0, y=0)
    n2 = SceneNode(id="n2", x=10, y=10)
    l1 = SceneLink(id="l1", from_node="n1", to_node="n2")
    scene = Scene(name="Test", nodes=[n1, n2], links=[l1])
    assert len(scene.validate_references()) == 0
