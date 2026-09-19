from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
from core.schema.scene import Scene
import json
import sqlite3

router = APIRouter(prefix="/projects/{project_id}/scene", tags=["scenes"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

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
