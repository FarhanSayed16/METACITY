import sqlite3
from pathlib import Path
from typing import Generator
from api.settings import Settings

settings = Settings()

def get_db_connection():
    settings = Settings()
    db_string = settings.db_path
    
    if not db_string.startswith("sqlite:"):
        db_path = Path(db_string)
        if db_path.parent:
            try:
                db_path.parent.mkdir(parents=True, exist_ok=True)
            except OSError:
                pass
                
    conn = sqlite3.connect(
        db_string.replace("sqlite:///", "") if db_string.startswith("sqlite:///") else db_string,
        timeout=15.0,
        check_same_thread=False
    )
    conn.execute("PRAGMA journal_mode=WAL;")  # Enable Write-Ahead Logging for better concurrency
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database schema."""
    with get_db_connection() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                scene_json_path TEXT NOT NULL,
                profile_id TEXT NOT NULL DEFAULT 'default',
                calibration_status TEXT NOT NULL DEFAULT 'synthetic_uncalibrated',
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS scenarios (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                diff_json TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
            
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                scenario_id TEXT NOT NULL,
                seed INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP,
                error_msg TEXT,
                FOREIGN KEY(scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
            );
            
            CREATE TABLE IF NOT EXISTS comparisons (
                id TEXT PRIMARY KEY,
                baseline_run_ids TEXT NOT NULL,
                scenario_run_ids TEXT NOT NULL,
                result_json TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL
            );
        ''')
        
        # Migration: add profile_id column to existing projects tables
        try:
            conn.execute("ALTER TABLE projects ADD COLUMN profile_id TEXT NOT NULL DEFAULT 'default'")
        except Exception:
            pass  # Column already exists
            
        # Migration: add calibration_status column to existing projects tables
        try:
            conn.execute("ALTER TABLE projects ADD COLUMN calibration_status TEXT NOT NULL DEFAULT 'synthetic_uncalibrated'")
        except Exception:
            pass
        
        conn.commit()
