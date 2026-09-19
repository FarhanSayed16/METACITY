from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    data_dir: str = "data"
    db_path: str = "data/metacity.db"
    api_port: int = 8000
    worker_count: int = 4
    snapshot_hz: int = 5
    cors_origins: list[str] = ["http://localhost:5173"]
    log_level: str = "info"

    class Config:
        env_file = ".env"
        env_prefix = "METACITY_"
