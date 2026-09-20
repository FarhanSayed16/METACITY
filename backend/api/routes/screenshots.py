"""Screenshot capture storage for embedding into HTML reports."""
from datetime import datetime, timezone
from pathlib import Path
import base64
import uuid
import re

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from persistence.paths import get_data_dir

router = APIRouter(prefix="/screenshots", tags=["screenshots"])


class ScreenshotUpload(BaseModel):
    image_base64: str = Field(..., description="PNG as data URL or raw base64")
    run_id: str | None = None
    comparison_id: str | None = None
    slot: str = "workspace"
    label: str = ""


def _screenshots_dir() -> Path:
    d = get_data_dir() / "screenshots"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _strip_data_url(raw: str) -> bytes:
    raw = raw.strip()
    if "," in raw and raw.startswith("data:"):
        raw = raw.split(",", 1)[1]
    return base64.b64decode(raw)


@router.post("")
def upload_screenshot(req: ScreenshotUpload):
    try:
        data = _strip_data_url(req.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image payload")

    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Screenshot too large (max 8MB)")

    shot_id = str(uuid.uuid4())
    path = _screenshots_dir() / f"{shot_id}.png"
    path.write_bytes(data)

    meta = {
        "id": shot_id,
        "run_id": req.run_id,
        "comparison_id": req.comparison_id,
        "slot": req.slot,
        "label": req.label or req.slot,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "path": str(path.name),
    }
    meta_path = _screenshots_dir() / f"{shot_id}.json"
    import json
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta


@router.get("/{shot_id}")
def get_screenshot_meta(shot_id: str):
    import json
    meta_path = _screenshots_dir() / f"{shot_id}.json"
    if not meta_path.exists():
        raise HTTPException(status_code=404, detail="Screenshot not found")
    return json.loads(meta_path.read_text(encoding="utf-8"))


@router.get("/{shot_id}/file")
def get_screenshot_file(shot_id: str):
    if not re.fullmatch(r"[0-9a-fA-F-]{36}", shot_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    path = _screenshots_dir() / f"{shot_id}.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Screenshot file not found")
    return FileResponse(path, media_type="image/png")


@router.get("")
def list_screenshots(run_id: str | None = None, comparison_id: str | None = None):
    import json
    results = []
    for meta_path in _screenshots_dir().glob("*.json"):
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        if run_id and meta.get("run_id") != run_id:
            continue
        if comparison_id and meta.get("comparison_id") != comparison_id:
            continue
        results.append(meta)
    results.sort(key=lambda m: m.get("created_at", ""), reverse=True)
    return results
