import sqlite3
from typing import Generator
from api.settings import Settings

settings = Settings()

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.db_path)
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
        conn.commit()
