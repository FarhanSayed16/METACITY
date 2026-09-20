import json
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from core.geo.osm_converter import fetch_osm_bbox, OSM_ATTRIBUTION
from core.geo.gtfs_parser import convert_gtfs_to_scene
import sqlite3

router = APIRouter(prefix="/import", tags=["import"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

@router.post("/osm")
def import_from_osm(
    south: float, west: float, north: float, east: float,
    project_name: str = "OSM Import",
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Fetch highways from Overpass API for the bounding box.
    Convert to METACITY scene JSON.
    Create a new project with the imported scene.
    """
    try:
        scene = fetch_osm_bbox(west, south, east, north)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch OSM data: {e}")
        
    # We can serialize and save it
    import os
    from persistence.paths import get_project_dir
    
    repo = ProjectRepository(db)
    proj = repo.create(
        name=project_name, 
        description=OSM_ATTRIBUTION, 
        scene_json_path="" # Temporary
    )
    
    project_dir = get_project_dir(proj.id)
    os.makedirs(project_dir, exist_ok=True)
    
    scene_json_path = os.path.join(project_dir, "scene.json")
    with open(scene_json_path, "w") as f:
        f.write(scene.model_dump_json(indent=2))
        
    # Update project with actual path
    db.execute("UPDATE projects SET scene_json_path = ? WHERE id = ?", (scene_json_path, proj.id))
    db.commit()
    proj.scene_json_path = scene_json_path
    
    return {
        "project_id": proj.id,
        "node_count": len(scene.nodes),
        "link_count": len(scene.links),
        "attribution": OSM_ATTRIBUTION
    }

@router.post("/gtfs")
def import_gtfs(
    stops: UploadFile = File(...),
    routes: UploadFile = File(...),
    trips: UploadFile = File(...),
    stop_times: UploadFile = File(...),
    ref_lat: float = Form(0.0),
    ref_lon: float = Form(0.0)
):
    """Parse GTFS data and return TransitLine and Node objects."""
    stops_txt = stops.file.read().decode('utf-8')
    routes_txt = routes.file.read().decode('utf-8')
    trips_txt = trips.file.read().decode('utf-8')
    stop_times_txt = stop_times.file.read().decode('utf-8')
    
    nodes, lines = convert_gtfs_to_scene(
        stops_txt, routes_txt, trips_txt, stop_times_txt, ref_lat, ref_lon
    )
    
    return {
        "transit_stops": [n.model_dump() for n in nodes],
        "transit_lines": [l.model_dump() for l in lines]
    }
