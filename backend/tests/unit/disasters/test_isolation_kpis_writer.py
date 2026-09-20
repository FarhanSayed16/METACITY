"""Wave C: isolation KPIs written into run artefacts."""
from core.schema.scene import Scene, SceneNode, SceneLink
from core.network.builder import build_network_from_scene
from core.disasters.emergency_access import compute_isolation_metrics
from core.disasters.flood import apply_flood
from persistence.results_writer import write_run_result, read_run_kpis, read_run_meta
from core.config import SimConfig
from core.metrics.collector import Result


def test_flood_increases_isolation(tmp_path, monkeypatch):
    from persistence import paths as paths_mod
    monkeypatch.setattr(paths_mod, "get_data_dir", lambda: tmp_path)

    scene = Scene(
        name="Iso",
        nodes=[
            SceneNode(id="edge", x=0, y=0),
            SceneNode(id="mid", x=500, y=0),
            SceneNode(id="far", x=1000, y=0),
        ],
        links=[
            SceneLink(id="a", from_node="edge", to_node="mid"),
            SceneLink(id="b", from_node="mid", to_node="far"),
        ],
    )
    base = compute_isolation_metrics(build_network_from_scene(scene))
    flooded = apply_flood(scene, water_level=10.0)
    after = compute_isolation_metrics(build_network_from_scene(flooded))
    assert after["isolation_ratio"] >= base["isolation_ratio"]

    result = Result(run_id="iso1", status="completed", final_gap=0.01, iterations=2)
    write_run_result("iso1", SimConfig(), 42, result, isolation=after)
    kpis = read_run_kpis("iso1")
    meta = read_run_meta("iso1")
    assert "isolation_ratio" in kpis
    assert "isolation" in meta
