import time
from fastapi.testclient import TestClient
from api.main import app

import os
os.makedirs("data", exist_ok=True)
from persistence.db import init_db
init_db()

client = TestClient(app)

def test_full_system_integration_flow():
    with TestClient(app) as client:
        # 1. Create a Project
        project_payload = {
            "name": "Integration Test Project",
            "description": "End to end test",
            "scene_json_path": "data/templates/nexus_city_baseline.json"
        }
        res = client.post("/projects", json=project_payload)
        assert res.status_code == 200, res.text
        project_id = res.json()["id"]

        # 2. Get the scene
        res = client.get(f"/projects/{project_id}/scene")
        assert res.status_code == 200, res.text
        assert "nodes" in res.json()

        # 3. Create a Baseline Scenario
        scen_payload = {
            "project_id": project_id,
            "name": "Baseline",
            "diff_ops": []
        }
        res = client.post("/scenarios", json=scen_payload)
        assert res.status_code == 200, res.text
        baseline_id = res.json()["id"]
    
        # 4. Trigger Baseline Run
        run_payload = {
            "scenario_id": baseline_id,
            "seeds": [42]
        }
        res = client.post("/runs", json=run_payload)
        assert res.status_code == 200, res.text
        run_id = res.json()[0]["id"]
    
        # 5. Poll for completion (timeout 10s)
        for _ in range(20):
            time.sleep(0.5)
            res = client.get(f"/runs/{run_id}")
            assert res.status_code == 200
            status = res.json()["status"]
            if status in ["completed", "error"]:
                break
                
        assert status == "completed", f"Run failed to complete: {res.json()}"
    
        # 6. Fetch metrics
        res = client.get(f"/runs/{run_id}/metrics")
        assert res.status_code == 200, res.text
        metrics = res.json()
        assert "total_trips" in metrics
    
        # 7. For MVP comparison test, we'll just compare baseline against itself
        comp_payload = {
            "baseline_scenario_id": baseline_id,
            "target_scenario_id": baseline_id
        }
        res = client.post("/comparisons", json=comp_payload)
        assert res.status_code == 200, res.text
        comp_result = res.json()
        assert comp_result["samples"] == 1
        
        # 8. Fetch Report
        res = client.get("/reports/some_id")
        assert res.status_code == 200, res.text
        assert "text/html" in res.headers["content-type"]
        assert "Comparison Report" in res.text
