import json
import logging
from fastapi import APIRouter, HTTPException
from persistence.paths import get_templates_dir

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("")
def list_templates():
    """
    List available scene templates from data/templates/.
    Returns: [{name, description, filename, node_count, link_count}]
    """
    templates_dir = get_templates_dir()
    templates = []
    
    if not templates_dir.exists():
        return templates
        
    for p in templates_dir.glob("*.json"):
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            # Extract basic info
            nodes = data.get("nodes", [])
            links = data.get("links", [])
            
            templates.append({
                "name": p.stem.replace("_", " ").title(),
                "description": f"Template from {p.name}",
                "filename": p.name,
                "node_count": len(nodes),
                "link_count": len(links)
            })
        except Exception as e:
            logger.warning(f"Failed to read template {p.name}: {e}")
            
    return templates

@router.get("/{filename}")
def get_template(filename: str):
    """Return the full scene JSON for a given template."""
    template_path = get_templates_dir() / filename
    
    if not template_path.exists() or not template_path.is_file():
        raise HTTPException(status_code=404, detail=f"Template {filename} not found")
        
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading template {filename}: {e}")
        raise HTTPException(status_code=500, detail="Error reading template file")
