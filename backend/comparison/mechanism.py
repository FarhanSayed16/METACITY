def trace_mechanisms(baseline_kpis: dict, scenario_kpis: dict) -> list[str]:
    """
    Attempt to explain *why* the KPIs changed between baseline and scenario.
    For MVP, we just return a static observation.
    """
    return [
        "Travel time changed due to re-routing of traffic on the modified network.",
        "System reached a new equilibrium state."
    ]
