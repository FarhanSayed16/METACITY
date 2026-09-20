"""Health check endpoint — reports API, SQLite, and worker status."""
from fastapi import APIRouter
from pathlib import Path
from core.version import MODEL_VERSION, SCHEMA_VERSION
from api.settings import Settings
from persistence.db import get_db_connection
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["ops"])
settings = Settings()


@router.get("/health")
def health_check():
    # SQLite probe
    sqlite_ok = False
    try:
        with get_db_connection() as conn:
            conn.execute("SELECT 1")
        sqlite_ok = True
    except Exception as e:
        logger.warning(f"SQLite health check failed: {e}")
    
    # Worker pool status (best-effort)
    worker_status = "unknown"
    try:
        from jobs.manager import job_manager
        active_futures = sum(1 for f in job_manager.futures.values() if not f.done())
        worker_status = f"pool_size={job_manager.executor._max_workers}, active={active_futures}"
    except Exception:
        worker_status = "not_loaded"
    
    return {
        "status": "ok" if sqlite_ok else "degraded",
        "model_version": MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "data_dir_exists": Path(settings.data_dir).is_dir(),
        "db_path": settings.db_path,
        "sqlite_ok": sqlite_ok,
        "worker_pool": worker_status
    }
