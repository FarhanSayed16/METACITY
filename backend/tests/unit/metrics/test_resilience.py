"""Tests for N-1 resilience scanner (schema-safe link closure)."""
from core.config import SimConfig
from core.metrics.resilience import calculate_n1_resilience
from core.schema.scene import Scene, SceneLink, SceneNode, SceneBounds


def _tiny_scene() -> Scene:
    return Scene(
        schema_version="1.0.0",
        name="resilience-tiny",
        description="two-link corridor",
        calibration_status="synthetic_uncalibrated",
        bounds=SceneBounds(width_m=1000, height_m=100),
        nodes=[
            SceneNode(id="A", x=0, y=0),
            SceneNode(id="B", x=500, y=0),
            SceneNode(id="C", x=1000, y=0),
        ],
        links=[
            SceneLink(
                id="AB",
                from_node="A",
                to_node="B",
                lanes=1,
                speed_kph=50,
                capacity_per_lane_per_hour=1200,
                length_m=500,
            ),
            SceneLink(
                id="BC",
                from_node="B",
                to_node="C",
                lanes=1,
                speed_kph=50,
                capacity_per_lane_per_hour=1200,
                length_m=500,
            ),
            SceneLink(
                id="AC",
                from_node="A",
                to_node="C",
                lanes=1,
                speed_kph=40,
                capacity_per_lane_per_hour=800,
                length_m=1000,
            ),
        ],
        zones=[],
        facilities=[],
        parameters={},
    )


def test_n1_resilience_schema_safe_and_bounded():
    scene = _tiny_scene()
    cfg = SimConfig(city_tick_minutes=5, msa_max_iter=2, snapshot_hz=1)
    out = calculate_n1_resilience(scene, sample_size=2, seed=7, config=cfg)
    assert "resilience_score" in out
    assert 0.0 <= out["resilience_score"] <= 1.0
    assert out["samples"] >= 1
    assert out["avg_trip_loss"] >= 0
