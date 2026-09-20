"""Scenario validator — semantic checks before persisting a scenario diff."""
from scenarios.ops_catalog import SCENARIO_OPS


def validate_scenario(diff_ops: list[dict]) -> list[str]:
    """
    Validate a list of scenario diff operations for correctness.
    
    Checks:
        - Each op has a valid 'type' from the ops catalog
        - Each op's 'data' contains all required fields
        
    Args:
        diff_ops: List of operation dicts [{type, data}, ...]
        
    Returns:
        List of error strings. Empty list means valid.
    """
    errors = []
    
    for i, op in enumerate(diff_ops):
        op_type = op.get("type")
        data = op.get("data", {})
        
        if not op_type:
            errors.append(f"Op #{i}: missing 'type' field")
            continue
            
        if op_type not in SCENARIO_OPS:
            errors.append(f"Op #{i}: unknown operation type '{op_type}'. Valid types: {list(SCENARIO_OPS.keys())}")
            continue
            
        spec = SCENARIO_OPS[op_type]
        required = spec.get("required_fields", [])
        
        for field in required:
            if field not in data:
                errors.append(f"Op #{i} ({op_type}): missing required field '{field}' in data")
                
    return errors
