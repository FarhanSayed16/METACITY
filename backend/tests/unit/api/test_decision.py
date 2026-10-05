"""Decision Mode orchestration API smoke tests."""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_decision_run_creates_project_and_scenarios():
    resp = client.post(
        "/decision/run",
        json={
            "template_filename": "nexus_city_baseline.json",
            "preset_id": "highway_bypass",
            "seeds": [0],
            "name": "Decision API Test",
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "running"
    assert data["decision_id"]
    assert data["project_id"]
    assert data["baseline_scenario_id"]
    assert data["plan_scenario_id"]
    assert len(data["baseline_run_ids"]) == 1
    assert len(data["plan_run_ids"]) == 1

    status = client.get(f"/decision/{data['decision_id']}")
    assert status.status_code == 200
    body = status.json()
    assert body["id"] == data["decision_id"]
    assert body["progress"]["total"] == 2
    assert body["status"] in ("running", "completed", "waiting_compare", "error")


def test_decision_unknown_preset_404():
    resp = client.post(
        "/decision/run",
        json={"preset_id": "does_not_exist_xyz", "seeds": [0]},
    )
    assert resp.status_code == 404
