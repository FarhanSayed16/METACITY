import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    data_dir: str = os.getenv("METACITY_DATA_DIR", "data")
    db_path: str = os.getenv("METACITY_DB_PATH", "sqlite:///data/metacity.db")
    cors_origins: list[str] = os.getenv("METACITY_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    api_port: int = 8000
    worker_count: int = 4
    snapshot_hz: int = 5
    log_level: str = "info"

    class Config:
        env_file = ".env"
        env_prefix = "METACITY_"
