import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_list_profiles():
    response = client.get("/profiles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(p["id"] == "default" for p in data)
    assert any(p["id"] == "academic" for p in data)

def test_get_profile():
    response = client.get("/profiles/default")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "default"
    assert "config" in data
    assert data["config"]["snapshot_hz"] == 5

def test_list_presets():
    response = client.get("/presets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(p["id"] == "highway_bypass" for p in data)
