from core.schema.scene import Scene

def validate_scenario(scene: Scene, ops: list[dict]) -> list[str]:
    """
    Check if a list of operations is valid to apply to the scene.
    Returns a list of error strings, or an empty list if valid.
    """
    errors = []
    # For MVP, validation is minimal. We just check op catalog keys.
    from .ops_catalog import SCENARIO_OPS
    
    for i, op in enumerate(ops):
        op_type = op.get("op")
        if not op_type or op_type not in SCENARIO_OPS:
            errors.append(f"Operation {i} has invalid type: {op_type}")
            
    return errors
