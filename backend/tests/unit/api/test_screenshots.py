"""Wave B: screenshot upload + report embedding."""
import base64
from pathlib import Path
from reports.html_builder import generate_comparison_report


TINY_PNG = base64.b64encode(
    # Minimal 1x1 PNG
    bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
        "0000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
    )
).decode("ascii")


def test_report_includes_screenshot_section():
    html = generate_comparison_report(
        comparison_stats={
            "travel_time": {"diff_mean": -1.0, "ci_lower": -2, "ci_upper": 0, "p_value": 0.01, "significant": True},
            "trips": {"diff_mean": 5, "ci_lower": 1, "ci_upper": 9, "p_value": 0.02, "significant": True},
        },
        mechanisms=["Link X relieved"],
        calibration_status="synthetic_uncalibrated",
        model_version="1.0.0",
        seed_count=3,
        screenshot_urls=[{"url": f"data:image/png;base64,{TINY_PNG}", "label": "Workspace"}],
    )
    assert "Evidence Screenshots" in html
    assert "data:image/png;base64," in html
    assert "Workspace" in html


def test_screenshot_upload_endpoint(tmp_path, monkeypatch):
    from persistence import paths as paths_mod
    monkeypatch.setattr(paths_mod, "get_data_dir", lambda: tmp_path)
    # Also patch screenshots route's importer
    from api.routes import screenshots as shots_mod
    monkeypatch.setattr(shots_mod, "get_data_dir", lambda: tmp_path)

    from fastapi.testclient import TestClient
    from api.main import app

    client = TestClient(app)
    res = client.post(
        "/screenshots",
        json={
            "image_base64": f"data:image/png;base64,{TINY_PNG}",
            "run_id": "run_demo",
            "slot": "workspace",
            "label": "Test shot",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["id"]
    assert (tmp_path / "screenshots" / f"{body['id']}.png").exists()

    listed = client.get("/screenshots", params={"run_id": "run_demo"})
    assert listed.status_code == 200
    assert any(s["id"] == body["id"] for s in listed.json())
