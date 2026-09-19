from typing import Any

MIGRATIONS: dict[str, callable] = {
    # "0.9.0->1.0.0": migrate_09_to_10,
}

def migrate_scene(data: dict[str, Any], target_version: str = "1.0.0") -> dict[str, Any]:
    """Chain migrations from scene's version to target."""
    current = data.get("schema_version", "1.0.0")
    if current == target_version:
        return data
    raise ValueError(f"No migration path from {current} to {target_version}")
