from pathlib import Path
from .paths import get_data_dir

def get_presets_dir() -> Path:
    """Returns the directory containing static scenario presets."""
    path = get_data_dir() / "presets"
    path.mkdir(parents=True, exist_ok=True)
    return path
