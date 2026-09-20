from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from persistence.db import get_db_connection
from persistence.repositories import ProjectRepository
import sqlite3

router = APIRouter(prefix="/projects", tags=["projects"])

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

class ProjectCreateReq(BaseModel):
    name: str
    description: str
    scene_json_path: str
    profile_id: str = "default"

class ProjectResp(BaseModel):
    id: str
    name: str
    description: str
    scene_json_path: str
    profile_id: str = "default"
    created_at: datetime
    updated_at: datetime

@router.post("", response_model=ProjectResp)
def create_project(req: ProjectCreateReq, db: sqlite3.Connection = Depends(get_db)):
    repo = ProjectRepository(db)
    proj = repo.create(req.name, req.description, req.scene_json_path, req.profile_id)
    return proj

@router.get("", response_model=list[ProjectResp])
def list_projects(db: sqlite3.Connection = Depends(get_db)):
    repo = ProjectRepository(db)
    return repo.list_all()

@router.get("/{project_id}", response_model=ProjectResp)
def get_project(project_id: str, db: sqlite3.Connection = Depends(get_db)):
    repo = ProjectRepository(db)
    proj = repo.get(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj
