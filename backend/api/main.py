from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import health, projects, scenes, scenarios, runs, comparisons, reports
from api.ws import runs_stream
from api.settings import Settings
from persistence.db import init_db
from jobs.manager import job_manager
from contextlib import asynccontextmanager

settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    job_manager.shutdown()

app = FastAPI(
    title="METACITY API",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(projects.router)
app.include_router(scenes.router)
app.include_router(scenarios.router)
app.include_router(runs.router)
app.include_router(comparisons.router)
app.include_router(reports.router)
app.include_router(runs_stream.router)
