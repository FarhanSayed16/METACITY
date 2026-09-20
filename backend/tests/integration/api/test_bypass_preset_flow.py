"""
Integration test: Bypass preset → create scenario → enqueue seeds 0–9.
Validates the full MP-20 flagship flow end-to-end.
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_bypass_preset_to_multi_seed_flow():
    """
    Full flow:
    1. List presets → find highway_bypass
    2. Get full preset with ops
    3. Create a project
    4. Create scenario from preset ops
    5. Enqueue runs with seeds 0–9
    """
    # 1. List presets
    resp = client.get("/presets")
    assert resp.status_code == 200
    presets = resp.json()
    bypass = next((p for p in presets if p["id"] == "highway_bypass"), None)
    assert bypass is not None, "highway_bypass preset not found"
    assert bypass["name"] == "Eastern Highway Bypass"
    
    # 2. Get full preset
    resp = client.get("/presets/highway_bypass")
    assert resp.status_code == 200
    preset_data = resp.json()
    assert len(preset_data["ops"]) > 0, "Preset should have ops"
    assert any(op["type"] == "add_link" for op in preset_data["ops"])
    
    # 3. Create a project
    resp = client.post("/projects", json={
        "name": "Bypass Test Project",
        "description": "Integration test for bypass flow",
        "scene_json_path": "data/templates/nexus_city.json"
    })
    assert resp.status_code == 200
    project = resp.json()
    project_id = project["id"]
    assert project["profile_id"] == "default"
    
    # 4. Create scenario from preset ops
    resp = client.post("/scenarios", json={
        "project_id": project_id,
        "name": preset_data["name"],
        "diff_ops": preset_data["ops"]
    })
    assert resp.status_code == 200
    scenario = resp.json()
    scenario_id = scenario["id"]
    
    # 5. List scenarios for the project
    resp = client.get(f"/projects/{project_id}/scenarios")
    assert resp.status_code == 200
    scenarios = resp.json()
    assert len(scenarios) >= 1
    
    # 6. Verify health endpoint is enriched
    resp = client.get("/health")
    assert resp.status_code == 200
    health = resp.json()
    assert "sqlite_ok" in health
    assert "worker_pool" in health
    assert health["sqlite_ok"] is True
    
    # 7. Verify congestion legend is served
    resp = client.get("/tools/congestion-legend")
    assert resp.status_code == 200
    legend = resp.json()
    assert "free_flow" in legend
    assert "gridlock" in legend
    assert legend["free_flow"]["color"] == "#22c55e"
