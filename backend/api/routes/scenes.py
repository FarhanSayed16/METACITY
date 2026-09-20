"""Scene API — CRUD for project scenes with history/restore support."""
from fastapi import APIRouter, Depends, HTTPException
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from core.schema.scene import Scene
import json
import os
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

router = APIRouter(prefix="/projects/{project_id}/scene", tags=["scenes"])


def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def _get_history_dir(scene_path: str) -> Path:
    return Path(os.path.dirname(scene_path)) / "history"


@router.get("")
def get_scene(project_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    try:
        with open(proj.scene_json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("")
def update_scene(project_id: str, scene: Scene, db: sqlite3.Connection = Depends(get_db)):
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    errors = scene.validate_references()
    if errors:
        raise HTTPException(status_code=400, detail=f"Validation errors: {', '.join(errors)}")
        
    try:
        # 1. Save history before overwriting (keep last 10)
        if os.path.exists(proj.scene_json_path):
            history_dir = _get_history_dir(proj.scene_json_path)
            history_dir.mkdir(parents=True, exist_ok=True)
            
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            history_path = history_dir / f"scene_{ts}.json"
            shutil.copy2(proj.scene_json_path, str(history_path))
            
            # Clean up old history (keep last 10)
            history_files = sorted(history_dir.glob("scene_*.json"), key=lambda p: p.stat().st_mtime)
            while len(history_files) > 10:
                oldest = history_files.pop(0)
                oldest.unlink()
                
        # 2. Save new scene
        with open(proj.scene_json_path, 'w', encoding='utf-8') as f:
            f.write(scene.model_dump_json(indent=2))
        return {"status": "success", "message": "Scene updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def list_scene_history(project_id: str, db: sqlite3.Connection = Depends(get_db)):
    """List available scene history versions (most recent first)."""
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    history_dir = _get_history_dir(proj.scene_json_path)
    if not history_dir.exists():
        return []
    
    versions = []
    for p in sorted(history_dir.glob("scene_*.json"), key=lambda f: f.stat().st_mtime, reverse=True):
        stat = p.stat()
        versions.append({
            "filename": p.name,
            "timestamp": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "size_bytes": stat.st_size
        })
    
    return versions


@router.post("/restore")
def restore_scene_version(project_id: str, body: dict, db: sqlite3.Connection = Depends(get_db)):
    """
    Restore a previous scene version. 
    Body: { "filename": "scene_20260920_103015.json" }
    The current scene is saved to history before restoring.
    """
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    filename = body.get("filename")
    if not filename:
        raise HTTPException(status_code=400, detail="'filename' is required in the request body")
    
    history_dir = _get_history_dir(proj.scene_json_path)
    restore_path = history_dir / filename
    
    if not restore_path.exists():
        raise HTTPException(status_code=404, detail=f"History version '{filename}' not found")
    
    # Validate the historical scene before restoring
    try:
        with open(restore_path, 'r', encoding='utf-8') as f:
            scene_data = json.load(f)
        scene = Scene.model_validate(scene_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid scene in history: {e}")
    
    # Save current scene to history first
    try:
        if os.path.exists(proj.scene_json_path):
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            current_backup = history_dir / f"scene_{ts}.json"
            shutil.copy2(proj.scene_json_path, str(current_backup))
        
        # Restore
        shutil.copy2(str(restore_path), proj.scene_json_path)
        
        return {
            "status": "success",
            "message": f"Scene restored from {filename}",
            "restored_from": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
