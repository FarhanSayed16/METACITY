def build_decision_narrative(
    stats: dict,
    mechanisms: list[str],
    baseline_kpis: dict,
    plan_kpis: dict,
    plan_name: str = "the plan",
) -> list[str]:
    """
    Plain-language bullets for Decision Mode Impact briefing.
    Combines travel-time stats, citizen scores, and mechanism traces.
    """
    from core.metrics.citizen_impact import citizen_day_blurb

    lines: list[str] = []
    tt = (stats or {}).get("travel_time") or {}
    if tt:
        b = tt.get("baseline_mean")
        s = tt.get("scenario_mean")
        if b is not None and s is not None:
            delta = s - b
            if delta < -0.3:
                lines.append(
                    f"With {plan_name}, average travel time falls from {b:.1f} to {s:.1f} minutes "
                    f"(about {abs(delta):.1f} min faster)."
                )
            elif delta > 0.3:
                lines.append(
                    f"With {plan_name}, average travel time rises from {b:.1f} to {s:.1f} minutes "
                    f"(about {delta:.1f} min slower)."
                )
            else:
                lines.append(
                    f"Average travel time stays near {b:.1f} minutes after {plan_name}."
                )
            if tt.get("significant"):
                lines.append("The travel-time change is statistically significant across paired seeds.")
            elif tt.get("ci_lower") is not None and tt.get("ci_upper") is not None:
                lines.append(
                    f"95% CI on the difference: [{tt['ci_lower']:.2f}, {tt['ci_upper']:.2f}] minutes."
                )

    lines.append(citizen_day_blurb(baseline_kpis or {}, plan_kpis or {}))

    b_delayed = int((baseline_kpis or {}).get("people_delayed", 0) or 0)
    p_delayed = int((plan_kpis or {}).get("people_delayed", 0) or 0)
    if b_delayed != p_delayed:
        direction = "fewer" if p_delayed < b_delayed else "more"
        lines.append(
            f"{abs(p_delayed - b_delayed)} {direction} trips exceed the long-delay threshold "
            f"after the plan ({b_delayed} → {p_delayed})."
        )

    for m in (mechanisms or [])[:3]:
        lines.append(m)

    # Deduplicate while preserving order
    seen = set()
    out = []
    for line in lines:
        if line and line not in seen:
            seen.add(line)
            out.append(line)
    return out or ["No significant network-wide change detected for this plan."]


def trace_mechanisms(
    baseline_kpis: dict[str, float],
    scenario_kpis: dict[str, float],
    baseline_link_metrics: list[dict],
    scenario_link_metrics: list[dict],
    top_n: int = 3,
) -> list[str]:
    """
    Identify top-N drivers of KPI change by comparing per-link metrics.
    Algorithm:
    1. For each link, compute Δ_travel_time = scenario_tt - baseline_tt
    2. Weight by volume: impact = Δ_tt * volume
    3. Sort by |impact| descending
    4. Translate top-N into human-readable explanations.
    """
    base_links = {m["id"]: m for m in baseline_link_metrics}
    scen_links = {m["id"]: m for m in scenario_link_metrics}
    
    impacts = []
    
    for link_id, scen_m in scen_links.items():
        base_m = base_links.get(link_id)
        if base_m:
            delta_tt = scen_m.get("travel_time", 0.0) - base_m.get("travel_time", 0.0)
            vol = scen_m.get("volume", 0.0)
            impact = delta_tt * vol
            
            # Additional detail for explanation
            b_vc = base_m.get("vc_ratio", 0.0)
            s_vc = scen_m.get("vc_ratio", 0.0)
            
            impacts.append({
                "id": link_id,
                "delta_tt": delta_tt,
                "volume": vol,
                "impact": impact,
                "abs_impact": abs(impact),
                "base_vc": b_vc,
                "scen_vc": s_vc,
                "is_new": False
            })
        else:
            # New link in scenario (e.g. bypass)
            impacts.append({
                "id": link_id,
                "delta_tt": scen_m.get("travel_time", 0.0),
                "volume": scen_m.get("volume", 0.0),
                "impact": 0.0,
                "abs_impact": scen_m.get("volume", 0.0) * 1000, # Artificial high impact for new active links
                "base_vc": 0.0,
                "scen_vc": scen_m.get("vc_ratio", 0.0),
                "is_new": True
            })

    # Sort by absolute impact
    impacts.sort(key=lambda x: x["abs_impact"], reverse=True)
    
    insights = []
    for item in impacts[:top_n]:
        if item["is_new"] and item["volume"] > 0:
            insights.append(
                f"New link {item['id']} absorbed {item['volume']:.0f} vehicles (V/C {item['scen_vc']:.2f})."
            )
        elif item["impact"] < -1.0: # Significant improvement
            insights.append(
                f"Link {item['id']} improved: V/C dropped from {item['base_vc']:.2f} to {item['scen_vc']:.2f} "
                f"(travel time reduced by {-item['delta_tt']:.1f} mins for {item['volume']:.0f} vehicles)."
            )
        elif item["impact"] > 1.0: # Significant degradation
            insights.append(
                f"Link {item['id']} worsened: V/C rose from {item['base_vc']:.2f} to {item['scen_vc']:.2f} "
                f"(travel time increased by {item['delta_tt']:.1f} mins for {item['volume']:.0f} vehicles)."
            )
            
    # Check for modal shift if transit ridership exists
    b_ridership = baseline_kpis.get("transit_ridership", 0)
    s_ridership = scenario_kpis.get("transit_ridership", 0)
    
    if s_ridership > b_ridership * 1.1:
        insights.append(f"Modal shift: Transit ridership increased by {(s_ridership - b_ridership):.0f} trips.")
        
    if not insights:
        insights.append("No significant localized changes detected; metrics are stable.")
        
    return insights
