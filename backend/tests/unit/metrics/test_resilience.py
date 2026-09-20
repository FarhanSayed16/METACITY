"""Tests for N-1 resilience scanner (schema-safe link closure)."""
from core.config import SimConfig
from core.metrics.resilience import calculate_n1_resilience
from core.schema.scene import Scene, SceneFacility, SceneLink, SceneNode, SceneZone


def _tiny_scene() -> Scene:
    return Scene(
        schema_version="1.0.0",
        name="resilience-tiny",
        description="corridor with homes",
        calibration_status="synthetic_uncalibrated",
        bounds={"width_m": 1000, "height_m": 100},
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
        zones=[
            SceneZone(id="Z1", name="Res", land_use="residential", population_target=20, population=20),
            SceneZone(id="Z2", name="Work", land_use="commercial", population_target=0, population=0),
        ],
        facilities=[
            SceneFacility(id="H1", type="home", zone_id="Z1", capacity=50, x=0, y=0),
            SceneFacility(id="O1", type="office", zone_id="Z2", capacity=50, x=1000, y=0),
        ],
        parameters={"total_population": 12, "car_ownership_rate": 0.8, "simulation_days": 1},
    )


def test_n1_resilience_schema_safe_and_bounded():
    scene = _tiny_scene()
    cfg = SimConfig(city_tick_minutes=5, msa_max_iter=2, snapshot_hz=1)
    out = calculate_n1_resilience(scene, sample_size=2, seed=7, config=cfg)
    assert "resilience_score" in out
    assert 0.0 <= out["resilience_score"] <= 1.0
    assert out["samples"] >= 1
    assert out["avg_trip_loss"] >= 0


def test_n1_resilience_empty_pop_is_safe():
    scene = Scene(
        name="empty",
        nodes=[SceneNode(id="A", x=0, y=0), SceneNode(id="B", x=1, y=0)],
        links=[
            SceneLink(
                id="AB",
                from_node="A",
                to_node="B",
                capacity_per_lane_per_hour=1000,
                length_m=100,
            )
        ],
    )
    cfg = SimConfig(city_tick_minutes=5, msa_max_iter=1, snapshot_hz=1)
    out = calculate_n1_resilience(scene, sample_size=1, seed=1, config=cfg)
    assert out["resilience_score"] == 1.0
    assert out["samples"] == 0
