import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from persistence.paths import get_project_dir

router = APIRouter(prefix="/projects", tags=["archive"])

@router.get("/{project_id}/export")
def export_project_zip(project_id: str):
    """
    Bundles the project directory into a ZIP archive for export.
    """
    project_dir = get_project_dir(project_id)
    if not os.path.exists(project_dir):
        raise HTTPException(status_code=404, detail="Project not found")
        
    zip_filename = f"export_{project_id}"
    zip_path = shutil.make_archive(zip_filename, 'zip', project_dir)
    
    return FileResponse(zip_path, media_type="application/zip", filename=f"{project_id}.zip")

@router.post("/import")
def import_project_zip(file: UploadFile = File(...)):
    """
    Unpacks a ZIP archive into a new project directory.
    """
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Must be a .zip file")
        
    new_project_id = str(uuid.uuid4())[:8]
    project_dir = get_project_dir(new_project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    # Save uploaded zip temporarily
    temp_zip_path = os.path.join(project_dir, "temp.zip")
    with open(temp_zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Unpack
    shutil.unpack_archive(temp_zip_path, project_dir)
    os.remove(temp_zip_path)
    
    return {"status": "success", "project_id": new_project_id}
