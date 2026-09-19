from fastapi import APIRouter
from pathlib import Path
from core.version import MODEL_VERSION, SCHEMA_VERSION
from api.settings import Settings

router = APIRouter(tags=["ops"])
settings = Settings()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_version": MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "data_dir_exists": Path(settings.data_dir).is_dir(),
        "db_path": settings.db_path,
    }
