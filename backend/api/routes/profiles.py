from fastapi import APIRouter, HTTPException
from core.config_profiles import get_all_profiles, get_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("")
def list_profiles():
    """List all available config profiles."""
    return get_all_profiles()

@router.get("/{profile_id}")
def get_profile_by_id(profile_id: str):
    """Get a specific profile."""
    try:
        profile = get_profile(profile_id)
        return profile.to_dict()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Profile {profile_id} not found")
