"""
Decision Mode orchestration — one-shot baseline vs infrastructure plan.

Creates a project from a template, baseline + plan scenarios, enqueues multi-seed
runs, and exposes status/result for the Impact briefing UI.
"""
from __future__ import annotations

import json
import shutil
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from comparison.mechanism import build_decision_narrative, trace_mechanisms
from comparison.pairing import pair_runs_by_seed
from comparison.statistics import compute_comparison
from jobs.manager import job_manager
from persistence.db import get_db_connection
from persistence.paths import get_data_dir, get_project_dir, get_templates_dir
from persistence.presets import get_presets_dir
from persistence.repositories import ProjectRepository, RunRepository, ScenarioRepository
from persistence.results_writer import read_run_kpis, read_run_link_metrics, read_run_meta
from scenarios.validator import validate_scenario

router = APIRouter(prefix="/decision", tags=["decision"])


def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def _decisions_dir() -> Path:
    path = get_data_dir() / "decisions"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _decision_path(decision_id: str) -> Path:
    return _decisions_dir() / f"{decision_id}.json"


def _save_decision(record: dict) -> None:
    path = _decision_path(record["id"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)


def _load_decision(decision_id: str) -> dict:
    path = _decision_path(decision_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Decision not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class DecisionRunReq(BaseModel):
    template_filename: str = "nexus_city_baseline.json"
    preset_id: str = "highway_bypass"
    project_id: str | None = None
    seeds: list[int] = Field(default_factory=lambda: [0, 1, 2])
    name: str | None = None


@router.post("/run")
def start_decision(req: DecisionRunReq, db: sqlite3.Connection = Depends(get_db)):
    """Create project (optional), baseline + plan scenarios, enqueue paired runs."""
    presets_dir = get_presets_dir()
    preset_path = presets_dir / f"{req.preset_id}.json"
    if not preset_path.exists():
        raise HTTPException(status_code=404, detail=f"Preset '{req.preset_id}' not found")

    with open(preset_path, "r", encoding="utf-8") as f:
        preset = json.load(f)
    plan_ops = preset.get("ops", [])
    errors = validate_scenario(plan_ops)
    if errors:
        raise HTTPException(status_code=422, detail=f"Invalid preset ops: {'; '.join(errors)}")

    project_repo = ProjectRepository(db)
    scenario_repo = ScenarioRepository(db)
    run_repo = RunRepository(db)

    if req.project_id:
        proj = project_repo.get(req.project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        project_id = proj.id
    else:
        template_path = get_templates_dir() / req.template_filename
        if not template_path.exists():
            # Also accept relative data/templates/... paths from older clients
            alt = Path(req.template_filename)
            if alt.exists():
                template_path = alt
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Template '{req.template_filename}' not found",
                )

        project_name = req.name or f"Decision — {preset.get('name', req.preset_id)}"
        proj = project_repo.create(
            name=project_name,
            description=f"Decision Mode: {preset.get('description', req.preset_id)}",
            scene_json_path="",
            profile_id="default",
        )
        project_dir = get_project_dir(proj.id)
        scene_path = project_dir / "scene.json"
        shutil.copy2(template_path, scene_path)
        db.execute(
            "UPDATE projects SET scene_json_path = ? WHERE id = ?",
            (str(scene_path), proj.id),
        )
        db.commit()
        project_id = proj.id

    baseline = scenario_repo.create(
        project_id,
        "Baseline (no change)",
        json.dumps([]),
    )
    plan = scenario_repo.create(
        project_id,
        preset.get("name", req.preset_id),
        json.dumps(plan_ops),
    )

    seeds = req.seeds or [0, 1, 2]
    baseline_run_ids: list[str] = []
    plan_run_ids: list[str] = []
    for seed in seeds:
        b_run = run_repo.create(baseline.id, seed)
        p_run = run_repo.create(plan.id, seed)
        baseline_run_ids.append(b_run.id)
        plan_run_ids.append(p_run.id)
        job_manager.enqueue(b_run.id)
        job_manager.enqueue(p_run.id)

    decision_id = str(uuid.uuid4())
    record = {
        "id": decision_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "project_id": project_id,
        "template_filename": req.template_filename,
        "preset_id": req.preset_id,
        "preset_name": preset.get("name", req.preset_id),
        "preset_description": preset.get("description", ""),
        "baseline_scenario_id": baseline.id,
        "plan_scenario_id": plan.id,
        "seeds": seeds,
        "baseline_run_ids": baseline_run_ids,
        "plan_run_ids": plan_run_ids,
        "status": "running",
    }
    _save_decision(record)

    return {
        "decision_id": decision_id,
        "project_id": project_id,
        "baseline_scenario_id": baseline.id,
        "plan_scenario_id": plan.id,
        "baseline_run_ids": baseline_run_ids,
        "plan_run_ids": plan_run_ids,
        "seeds": seeds,
        "status": "running",
        "preset_name": record["preset_name"],
    }


def _build_result(record: dict, db: sqlite3.Connection) -> dict:
    run_repo = RunRepository(db)
    baseline_runs = run_repo.list_by_scenario(record["baseline_scenario_id"])
    plan_runs = run_repo.list_by_scenario(record["plan_scenario_id"])
    pairs = pair_runs_by_seed(baseline_runs, plan_runs)
    if not pairs:
        raise HTTPException(
            status_code=400,
            detail="No matching completed runs with the same seeds found.",
        )

    stats = compute_comparison(pairs)
    b_run, s_run = pairs[0]
    b_kpis = read_run_kpis(b_run.id)
    s_kpis = read_run_kpis(s_run.id)
    b_lm = read_run_link_metrics(b_run.id)
    s_lm = read_run_link_metrics(s_run.id)
    b_meta = read_run_meta(b_run.id)

    mechanisms = trace_mechanisms(b_kpis, s_kpis, b_lm, s_lm, top_n=3)
    narrative = build_decision_narrative(
        stats,
        mechanisms,
        b_kpis,
        s_kpis,
        plan_name=record.get("preset_name", "the plan"),
    )

    isolation_delta = None
    if "isolation_ratio" in b_kpis or "isolation_ratio" in s_kpis:
        isolation_delta = {
            "baseline_isolation_ratio": b_kpis.get("isolation_ratio"),
            "target_isolation_ratio": s_kpis.get("isolation_ratio"),
            "delta_isolation_ratio": (
                (s_kpis.get("isolation_ratio") or 0) - (b_kpis.get("isolation_ratio") or 0)
            ),
        }

    return {
        "statistics": stats,
        "mechanisms": mechanisms,
        "narrative": narrative,
        "calibration_status": b_meta.get("calibration_status", "synthetic_uncalibrated"),
        "isolation_delta": isolation_delta,
        "baseline_kpis": b_kpis,
        "plan_kpis": s_kpis,
        "sample_baseline_run_id": b_run.id,
        "sample_plan_run_id": s_run.id,
        "citizen_impact": {
            "baseline": {
                "stress_index": b_kpis.get("stress_index", 0),
                "impatience_index": b_kpis.get("impatience_index", 0),
                "pct_trips_over_threshold": b_kpis.get("pct_trips_over_threshold", 0),
                "people_delayed": b_kpis.get("people_delayed", 0),
            },
            "plan": {
                "stress_index": s_kpis.get("stress_index", 0),
                "impatience_index": s_kpis.get("impatience_index", 0),
                "pct_trips_over_threshold": s_kpis.get("pct_trips_over_threshold", 0),
                "people_delayed": s_kpis.get("people_delayed", 0),
            },
        },
    }


@router.get("/{decision_id}")
def get_decision(decision_id: str, db: sqlite3.Connection = Depends(get_db)):
    """Poll decision status; include full Impact payload when all runs complete."""
    record = _load_decision(decision_id)
    run_repo = RunRepository(db)
    all_ids = list(record.get("baseline_run_ids", [])) + list(record.get("plan_run_ids", []))

    statuses = []
    completed = 0
    errored = 0
    for rid in all_ids:
        run = run_repo.get(rid)
        st = run.status if run else "missing"
        statuses.append({"run_id": rid, "status": st})
        if st == "completed":
            completed += 1
        elif st in ("error", "interrupted"):
            errored += 1

    total = len(all_ids) or 1
    payload = {
        **record,
        "runs": statuses,
        "progress": {
            "completed": completed,
            "errored": errored,
            "total": total,
            "fraction": completed / total,
        },
    }

    if errored and completed + errored >= total:
        payload["status"] = "error"
        _save_decision({**record, "status": "error"})
        return payload

    if completed >= total:
        try:
            result = _build_result(record, db)
            payload["status"] = "completed"
            payload["result"] = result
            record["status"] = "completed"
            _save_decision(record)
        except HTTPException as exc:
            payload["status"] = "waiting_compare"
            payload["compare_error"] = str(exc.detail)
        return payload

    payload["status"] = "running"
    return payload
