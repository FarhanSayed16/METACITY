from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import health, projects, scenes, scenarios, runs, comparisons, reports, modules, export, predict, network_tools, templates, profiles, presets
from api.ws import runs_stream
from api.settings import Settings
from persistence.db import init_db, get_db_connection
from persistence.repositories import RunRepository
from jobs.manager import job_manager
from contextlib import asynccontextmanager

import logging
import json

settings = Settings()

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "ts": self.formatTime(record),
            "level": record.levelname.lower(),
            "event": record.getMessage(),
            "module": record.module,
            "run_id": getattr(record, "run_id", None)
        })

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.basicConfig(level=settings.log_level.upper(), handlers=[handler])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("METACITY API starting")
    init_db()
    
    # Recover orphans
    with get_db_connection() as conn:
        RunRepository(conn).mark_orphans_interrupted()
        
    # Start background workers polling
    await job_manager.start_polling()
    
    yield
    # Shutdown
    job_manager.shutdown()

app = FastAPI(
    title="METACITY API",
    version="0.1.0",
    lifespan=lifespan
)

from api.middleware.rate_limit import RateLimitMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

# Register routes
app.include_router(health.router)
app.include_router(projects.router)
app.include_router(scenes.router)
app.include_router(scenarios.router)
app.include_router(runs.router)
app.include_router(comparisons.router)
app.include_router(templates.router)
app.include_router(profiles.router)
app.include_router(presets.router)
app.include_router(reports.router)
app.include_router(modules.router)
app.include_router(export.router)
app.include_router(predict.router)
app.include_router(network_tools.router)
app.include_router(runs_stream.router)
from api.routes import evacuation, hospital, archive, import_geo, calibration, planner, screenshots, analysis
app.include_router(archive.router)
app.include_router(import_geo.router)
app.include_router(evacuation.router)
app.include_router(hospital.router)
app.include_router(calibration.router)
app.include_router(planner.router)
app.include_router(screenshots.router)
app.include_router(analysis.router)
