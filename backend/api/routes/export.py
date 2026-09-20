import json
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from persistence.results_writer import read_run_link_metrics
from core.schema.scene import Scene
import sqlite3

router = APIRouter(prefix="/projects", tags=["export"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.get("/{project_id}/geojson")
def export_geojson(
    project_id: str,
    run_id: str | None = Query(None, description="Optional completed run to attach link flow fields"),
    db: sqlite3.Connection = Depends(get_db),
):
    """
    Exports the project's scene as a standard GeoJSON FeatureCollection.
    When `run_id` is provided, link features include volume / capacity / vc_ratio / travel_time.
    """
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    try:
        with open(proj.scene_json_path, "r") as f:
            scene_data = json.load(f)
        scene = Scene(**scene_data)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load scene data")

    flow_by_id: dict[str, dict] = {}
    if run_id:
        metrics = read_run_link_metrics(run_id)
        for m in metrics:
            mid = m.get("id")
            if mid:
                flow_by_id[mid] = m
        
    features = []
    
    # Export Nodes as Point features
    for n in scene.nodes:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [n.x, n.y]  # Note: arbitrary local coordinates, not real lat/lon
            },
            "properties": {
                "id": n.id,
                "type": "node"
            }
        })
        
    # Build node map for fast coordinate lookup
    node_map = {n.id: n for n in scene.nodes}
    
    # Export Links as LineString features
    for l in scene.links:
        from_n = node_map.get(l.from_node)
        to_n = node_map.get(l.to_node)
        if from_n and to_n:
            props = {
                "id": l.id,
                "type": "link",
                "lanes": l.lanes,
                "speed_kph": l.speed_kph,
                "capacity_per_lane_per_hour": l.capacity_per_lane_per_hour,
            }
            flow = flow_by_id.get(l.id)
            if flow:
                props["volume"] = flow.get("volume")
                props["capacity"] = flow.get("capacity")
                props["vc_ratio"] = flow.get("vc_ratio")
                props["travel_time"] = flow.get("travel_time")
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [from_n.x, from_n.y],
                        [to_n.x, to_n.y]
                    ]
                },
                "properties": props
            })
            
    geojson = {
        "type": "FeatureCollection",
        "features": features,
        "properties": {
            "project_id": project_id,
            "run_id": run_id,
            "flow_note": (
                "Link volume/vc_ratio attached from run link_metrics when run_id is set. "
                "Map dashes encode relative volume, not particle trails."
                if run_id else
                "Pass ?run_id=… to attach simulated link flows."
            ),
        },
    }
    
    return JSONResponse(content=geojson)
