"""
Thin wrapper – canonical applier lives in core.scenarios.applier.
This file exists only so older imports (``from scenarios.applier import apply_scenario``)
still resolve. All new code should import from ``core.scenarios.applier``.
"""
from core.scenarios.applier import apply_scenario  # noqa: F401
