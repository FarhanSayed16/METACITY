import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Optional
from persistence.models import Project, Scenario, Run, Comparison

# Helper functions
def now() -> datetime:
    return datetime.now(timezone.utc)

class ProjectRepository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def create(self, name: str, description: str, scene_json_path: str, profile_id: str = "default") -> Project:
        proj = Project(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            scene_json_path=scene_json_path,
            profile_id=profile_id,
            calibration_status="synthetic_uncalibrated",
            created_at=now(),
            updated_at=now()
        )
        self.conn.execute(
            "INSERT INTO projects (id, name, description, scene_json_path, profile_id, calibration_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (proj.id, proj.name, proj.description, proj.scene_json_path, proj.profile_id, proj.calibration_status, proj.created_at, proj.updated_at)
        )
        self.conn.commit()
        return proj

    def get(self, proj_id: str) -> Optional[Project]:
        row = self.conn.execute("SELECT * FROM projects WHERE id = ?", (proj_id,)).fetchone()
        if row:
            return Project(**dict(row))
        return None

    def list_all(self) -> list[Project]:
        rows = self.conn.execute("SELECT * FROM projects ORDER BY created_at DESC").fetchall()
        return [Project(**dict(r)) for r in rows]

    def update_calibration_status(self, proj_id: str, status: str):
        self.conn.execute(
            "UPDATE projects SET calibration_status = ?, updated_at = ? WHERE id = ?",
            (status, now(), proj_id)
        )
        self.conn.commit()

class ScenarioRepository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def create(self, project_id: str, name: str, diff_json: str) -> Scenario:
        scen = Scenario(
            id=str(uuid.uuid4()),
            project_id=project_id,
            name=name,
            diff_json=diff_json,
            created_at=now()
        )
        self.conn.execute(
            "INSERT INTO scenarios (id, project_id, name, diff_json, created_at) VALUES (?, ?, ?, ?, ?)",
            (scen.id, scen.project_id, scen.name, scen.diff_json, scen.created_at)
        )
        self.conn.commit()
        return scen

    def get(self, scen_id: str) -> Optional[Scenario]:
        row = self.conn.execute("SELECT * FROM scenarios WHERE id = ?", (scen_id,)).fetchone()
        if row:
            return Scenario(**dict(row))
        return None

    def list_by_project(self, project_id: str) -> list[Scenario]:
        rows = self.conn.execute("SELECT * FROM scenarios WHERE project_id = ? ORDER BY created_at DESC", (project_id,)).fetchall()
        return [Scenario(**dict(r)) for r in rows]

class RunRepository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def create(self, scenario_id: str, seed: int) -> Run:
        r = Run(
            id=str(uuid.uuid4()),
            scenario_id=scenario_id,
            seed=seed,
            status="pending",
            created_at=now()
        )
        self.conn.execute(
            "INSERT INTO runs (id, scenario_id, seed, status, created_at) VALUES (?, ?, ?, ?, ?)",
            (r.id, r.scenario_id, r.seed, r.status, r.created_at)
        )
        self.conn.commit()
        return r

    def update_status(self, run_id: str, status: str, error_msg: str = None):
        if status in ("completed", "error"):
            self.conn.execute("UPDATE runs SET status = ?, completed_at = ?, error_msg = ? WHERE id = ?",
                              (status, now(), error_msg, run_id))
        else:
            self.conn.execute("UPDATE runs SET status = ?, error_msg = ? WHERE id = ?",
                              (status, error_msg, run_id))
        self.conn.commit()

    def mark_orphans_interrupted(self):
        """Marks any runs stuck in 'running' as 'interrupted'. Called on boot after crash recovery.
        Note: 'pending' runs are NOT marked — they should be retried by the worker pool."""
        self.conn.execute("UPDATE runs SET status = 'interrupted', error_msg = 'Server restarted' WHERE status = 'running'")
        self.conn.commit()

    def get(self, run_id: str) -> Optional[Run]:
        row = self.conn.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
        if row:
            return Run(**dict(row))
        return None

    def list_by_scenario(self, scenario_id: str) -> list[Run]:
        rows = self.conn.execute("SELECT * FROM runs WHERE scenario_id = ? ORDER BY created_at DESC", (scenario_id,)).fetchall()
        return [Run(**dict(r)) for r in rows]

    def list_by_project(self, project_id: str) -> list[dict]:
        """Join runs with scenarios for a project; returns dicts with scenario_name."""
        rows = self.conn.execute(
            """
            SELECT r.*, s.name AS scenario_name
            FROM runs r
            JOIN scenarios s ON s.id = r.scenario_id
            WHERE s.project_id = ?
            ORDER BY r.created_at DESC
            """,
            (project_id,),
        ).fetchall()
        return [dict(r) for r in rows]
