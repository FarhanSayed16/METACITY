"""Phase 8 — twin asset inventory + disaster lab ops integration checks."""
from pathlib import Path
import re

from core.schema.scene import Scene, SceneNode, SceneLink, SceneZone
from core.scenarios.applier import apply_scenario
from core.disasters.emergency_access import compute_isolation_metrics
from core.network.builder import build_network_from_scene


ROOT = Path(__file__).resolve().parents[3]
ASSETS = ROOT / "frontend" / "public" / "assets"
REGISTRY = ROOT / "frontend" / "src" / "assets" / "AssetRegistry.ts"


def test_twin_asset_registry_files_exist():
    src = REGISTRY.read_text(encoding="utf-8")
    paths = set(re.findall(r"A\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+\.glb)'", src))
    paths |= set(re.findall(r"relativePath:\s*'([^']+\.glb)'", src))
    assert len(paths) >= 40, f"expected ≥40 registry GLBs, got {len(paths)}"
    missing = [p for p in paths if not (ASSETS / p).is_file()]
    assert not missing, f"missing GLBs: {missing[:5]}"


def test_disaster_lab_flood_increases_isolation():
    scene = Scene(
        name="LabFlood",
        nodes=[
            SceneNode(id="a", x=0, y=0),
            SceneNode(id="b", x=500, y=0),
            SceneNode(id="c", x=1000, y=0),
        ],
        links=[
            SceneLink(id="ab", from_node="a", to_node="b", lanes=2, speed_kph=50),
            SceneLink(id="bc", from_node="b", to_node="c", lanes=2, speed_kph=50),
        ],
        zones=[SceneZone(id="z", name="Z", land_use="mixed", center_x=500, center_y=0)],
    )
    before = compute_isolation_metrics(build_network_from_scene(scene))
    flooded = apply_scenario(scene, [{"type": "flood", "data": {"water_level": 10.0}}])
    after = compute_isolation_metrics(build_network_from_scene(flooded))
    assert after["isolation_ratio"] >= before["isolation_ratio"]


def test_disaster_lab_close_link_and_outage_ops():
    scene = Scene(
        name="LabClose",
        nodes=[
            SceneNode(id="a", x=0, y=0),
            SceneNode(id="b", x=100, y=0),
            SceneNode(id="c", x=200, y=0),
        ],
        links=[
            SceneLink(id="ab", from_node="a", to_node="b", lanes=2, speed_kph=40),
            SceneLink(id="bc", from_node="b", to_node="c", lanes=2, speed_kph=40),
        ],
        zones=[],
    )
    closed = apply_scenario(scene, [{"type": "close_link", "data": {"id": "ab"}}])
    ab = next(l for l in closed.links if l.id == "ab")
    assert ab.capacity_per_lane_per_hour == 0

    outaged = apply_scenario(scene, [{"type": "outage", "data": {"link_ids": ["bc"]}}])
    bc = next(l for l in outaged.links if l.id == "bc")
    assert bc.capacity_per_lane_per_hour == 0


def test_agents_sample_progress_fields_in_snapshot_builder_contract():
    """Documented sample shape for City Twin (Phase 7/8)."""
    sample = {
        "id": "agent_1",
        "x": 10.0,
        "y": 20.0,
        "mode": "car",
        "link_id": "L1",
        "progress": 0.5,
    }
    assert 0.0 <= sample["progress"] <= 1.0
    assert sample["mode"] in ("car", "walk", "transit")
