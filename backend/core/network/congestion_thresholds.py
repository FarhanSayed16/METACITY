"""Shared congestion thresholds — used by both backend flow calculations and frontend legend/colours.

This is the single source of truth for congestion level boundaries.
Frontend should mirror these values exactly.
"""

# Volume-to-capacity ratio thresholds
CONGESTION_THRESHOLDS = {
    "free_flow":    {"max_vc": 0.5,  "color": "#22c55e", "label": "Free Flow"},
    "moderate":     {"max_vc": 0.75, "color": "#eab308", "label": "Moderate"},
    "congested":    {"max_vc": 0.9,  "color": "#f97316", "label": "Congested"},
    "gridlock":     {"max_vc": float("inf"), "color": "#ef4444", "label": "Gridlock"},
}


def classify_congestion(vc_ratio: float) -> str:
    """Classify a v/c ratio into a congestion level name."""
    if vc_ratio <= 0.5:
        return "free_flow"
    elif vc_ratio <= 0.75:
        return "moderate"
    elif vc_ratio <= 0.9:
        return "congested"
    else:
        return "gridlock"


def get_congestion_color(vc_ratio: float) -> str:
    """Get the hex color for a given v/c ratio."""
    level = classify_congestion(vc_ratio)
    return CONGESTION_THRESHOLDS[level]["color"]
