"""Scenario presets API — serves persisted JSON presets from data/presets/."""
import json
import logging
from fastapi import APIRouter, HTTPException
from persistence.presets import get_presets_dir

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/presets", tags=["presets"])


@router.get("")
def list_presets():
    """
    List available scenario presets from data/presets/.
    Returns: [{id, name, description}]
    """
    presets_dir = get_presets_dir()
    presets = []
    
    if not presets_dir.exists():
        return presets
        
    for p in presets_dir.glob("*.json"):
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            presets.append({
                "id": p.stem,
                "name": data.get("name", p.stem.replace("_", " ").title()),
                "description": data.get("description", ""),
                "ops_count": len(data.get("ops", []))
            })
        except Exception as e:
            logger.warning(f"Failed to read preset {p.name}: {e}")
            
    return presets


@router.get("/{preset_id}")
def get_preset(preset_id: str):
    """
    Get a single preset by ID (filename stem), including its full ops.
    """
    presets_dir = get_presets_dir()
    preset_path = presets_dir / f"{preset_id}.json"
    
    if not preset_path.exists():
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found")
    
    try:
        with open(preset_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {
            "id": preset_id,
            "name": data.get("name", preset_id.replace("_", " ").title()),
            "description": data.get("description", ""),
            "ops": data.get("ops", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read preset: {e}")
