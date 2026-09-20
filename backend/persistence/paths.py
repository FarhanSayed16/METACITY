import os
from pathlib import Path
from pydantic_settings import BaseSettings

class PathSettings(BaseSettings):
    data_dir: str = "data"

    class Config:
        env_file = ".env"
        env_prefix = "METACITY_"

settings = PathSettings()

def get_data_dir() -> Path:
    """Returns the canonical root data directory."""
    path = Path(settings.data_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_projects_dir() -> Path:
    """Returns the directory containing all project folders."""
    path = get_data_dir() / "projects"
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_project_dir(project_id: str) -> Path:
    """Returns the specific project directory."""
    path = get_projects_dir() / project_id
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_templates_dir() -> Path:
    """Returns the directory containing static scene templates."""
    path = get_data_dir() / "templates"
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_runs_dir() -> Path:
    """Returns the directory containing simulation runs/results."""
    path = get_data_dir() / "runs"
    path.mkdir(parents=True, exist_ok=True)
    return path
