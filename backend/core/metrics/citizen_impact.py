"""
Citizen-impact scores derived from Level-1 trip delays.

These are NOT microsimulated emotions. They map travel-time burden to
simple 0–100 Stress / Impatience indices for decision briefings.
"""
from __future__ import annotations


def compute_citizen_impact(
    trip_durations_mins: list[float],
    threshold_mins: float = 30.0,
) -> dict[str, float | int]:
    """
    Derive citizen-facing KPIs from completed trip durations.

    Formulas (documented in Assumptions):
    - pct_trips_over_threshold = share of trips longer than threshold_mins
    - stress_index ≈ 45% avg-travel burden + 55% overtime share (capped 0–100)
    - impatience_index ≈ 70% overtime share + delay above 15 min (capped 0–100)
    """
    if not trip_durations_mins:
        return {
            "stress_index": 0.0,
            "impatience_index": 0.0,
            "pct_trips_over_threshold": 0.0,
            "threshold_mins": float(threshold_mins),
            "people_delayed": 0,
            "average_travel_time_mins": 0.0,
        }

    n = len(trip_durations_mins)
    avg = sum(trip_durations_mins) / n
    people_delayed = sum(1 for d in trip_durations_mins if d > threshold_mins)
    pct = people_delayed / n

    stress = min(100.0, (avg / 25.0) * 45.0 + pct * 55.0)
    impatience = min(100.0, pct * 70.0 + max(0.0, avg - 15.0) * 2.5)

    return {
        "stress_index": round(stress, 2),
        "impatience_index": round(impatience, 2),
        "pct_trips_over_threshold": round(pct, 4),
        "threshold_mins": float(threshold_mins),
        "people_delayed": int(people_delayed),
        "average_travel_time_mins": round(avg, 3),
    }


def citizen_day_blurb(baseline: dict, plan: dict) -> str:
    """One-sentence citizen-day summary for Impact briefing."""
    b_stress = float(baseline.get("stress_index", 0) or 0)
    p_stress = float(plan.get("stress_index", 0) or 0)
    b_tt = float(baseline.get("average_travel_time_mins", 0) or 0)
    p_tt = float(plan.get("average_travel_time_mins", 0) or 0)
    d_tt = p_tt - b_tt
    d_stress = p_stress - b_stress

    if d_tt < -0.5 and d_stress < -1:
        return (
            f"Typical trips get about {abs(d_tt):.1f} minutes faster; "
            f"citizen stress falls by {abs(d_stress):.1f} points."
        )
    if d_tt > 0.5 and d_stress > 1:
        return (
            f"Trips get about {d_tt:.1f} minutes slower; "
            f"citizen stress rises by {d_stress:.1f} points."
        )
    return (
        "Overall travel times stay similar; localized routes may still shift "
        "who waits and who benefits."
    )
