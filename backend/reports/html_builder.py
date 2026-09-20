from datetime import datetime, timezone
import json

def generate_comparison_report(
    comparison_stats: dict,
    mechanisms: list[str],
    calibration_status: str,
    model_version: str,
    seed_count: int,
    screenshot_urls: list[dict] | None = None,
) -> str:
    """
    Generate a complete standalone HTML report with:
    - Title and model version header
    - Calibration badge (colour-coded: green/yellow/red)
    - Parameter summary table (seeds, MSA iterations, BPR params)
    - KPI comparison table with Mean, 95% CI, Δ, significance label
    - Mechanism trace section (top-3 drivers)
    - Disclaimer: "These are modelled estimates, not predictions..."
    - Assumptions section listing all model limitations
    - Generated timestamp
    Styled with inline CSS (no external dependencies).
    """
    
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Badge colors
    badge_color = "#ef4444" # red
    badge_label = "Synthetic / Uncalibrated"
    if calibration_status == "calibrated":
        badge_color = "#22c55e" # green
        badge_label = "Calibrated"
    elif calibration_status == "partially_calibrated":
        badge_color = "#eab308" # yellow
        badge_label = "Partially Calibrated"
        
    tt_stats = comparison_stats.get("travel_time", {})
    trips_stats = comparison_stats.get("trips", {})
    
    mechanisms_html = "".join([f"<li>{m}</li>" for m in mechanisms])
    if not mechanisms:
        mechanisms_html = "<li>No significant localized mechanisms detected.</li>"

    shots = screenshot_urls or []
    if shots:
        shots_inner = "".join([
            f'''<figure style="margin:0 0 16px 0;">
                <img src="{s.get('url')}" alt="{s.get('label', 'screenshot')}"
                     style="max-width:100%; border:1px solid var(--border-color); border-radius:6px;" />
                <figcaption style="font-size:0.85em; color:#6b7280; margin-top:6px;">{s.get('label', 'Workspace')}</figcaption>
            </figure>'''
            for s in shots if s.get("url")
        ])
        screenshots_html = f'''
    <div class="card">
        <h2>Evidence Screenshots</h2>
        <p style="font-size: 0.9em; color: #6b7280;">Captured from the workspace during evaluation.</p>
        {shots_inner}
    </div>'''
    else:
        screenshots_html = ""
        
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>METACITY Comparison Report</title>
    <style>
        :root {{
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            --text-color: #374151;
            --border-color: #e5e7eb;
            --bg-color: #f9fafb;
        }}
        body {{
            font-family: var(--font-family);
            color: var(--text-color);
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
            max-width: 900px;
            margin: 0 auto;
        }}
        h1, h2, h3 {{ color: #111827; }}
        h1 {{ border-bottom: 2px solid var(--border-color); padding-bottom: 10px; }}
        .header-meta {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; font-size: 0.9em; color: #6b7280; }}
        .badge {{
            display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 0.8em; font-weight: 600;
            color: #fff; background-color: {badge_color};
        }}
        .card {{
            border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 24px;
            background-color: var(--bg-color);
        }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
        th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }}
        th {{ background-color: #f3f4f6; font-weight: 600; font-size: 0.9em; }}
        .text-right {{ text-align: right; }}
        .positive {{ color: #22c55e; font-weight: 600; }}
        .negative {{ color: #ef4444; font-weight: 600; }}
        .neutral {{ color: #6b7280; }}
        .sig {{ color: #22c55e; font-weight: bold; }}
        .disclaimer {{ font-size: 0.85em; color: #9ca3af; margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 20px; }}
        .assumptions li {{ margin-bottom: 8px; font-size: 0.9em; }}
    </style>
</head>
<body>
    <h1>Simulation Comparison Report</h1>
    <div class="header-meta">
        <div>
            <strong>Model Version:</strong> {model_version} <br>
            <strong>Generated:</strong> {timestamp}
        </div>
        <div>
            <span class="badge">{badge_label}</span>
        </div>
    </div>

    <div class="card">
        <h2>Key Performance Indicators (KPIs)</h2>
        <p style="font-size: 0.9em; color: #6b7280;">Analysis based on {seed_count} paired seeds.</p>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Mean &Delta;</th>
                    <th class="text-right">95% CI</th>
                    <th class="text-right">p-value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Travel Time (mins)</td>
                    <td class="text-right {'negative' if tt_stats.get('diff_mean', 0) > 0 else 'positive'}">
                        {'+' if tt_stats.get('diff_mean', 0) > 0 else ''}{tt_stats.get('diff_mean', 0):.2f}
                    </td>
                    <td class="text-right neutral">
                        [{tt_stats.get('ci_lower', 0):.2f}, {tt_stats.get('ci_upper', 0):.2f}]
                    </td>
                    <td class="text-right {'sig' if tt_stats.get('significant') else 'neutral'}">
                        {tt_stats.get('p_value', 1.0):.4f} {'*' if tt_stats.get('significant') else ''}
                    </td>
                </tr>
                <tr>
                    <td>Completed Trips</td>
                    <td class="text-right {'positive' if trips_stats.get('diff_mean', 0) > 0 else 'negative'}">
                        {'+' if trips_stats.get('diff_mean', 0) > 0 else ''}{trips_stats.get('diff_mean', 0):.0f}
                    </td>
                    <td class="text-right neutral">
                        [{trips_stats.get('ci_lower', 0):.1f}, {trips_stats.get('ci_upper', 0):.1f}]
                    </td>
                    <td class="text-right {'sig' if trips_stats.get('significant') else 'neutral'}">
                        {trips_stats.get('p_value', 1.0):.4f} {'*' if trips_stats.get('significant') else ''}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="card">
        <h2>Mechanism Trace</h2>
        <p style="font-size: 0.9em; color: #6b7280;">Top drivers explaining the KPI shifts, derived from localized volume-delay metrics.</p>
        <ul>
            {mechanisms_html}
        </ul>
    </div>

    {screenshots_html}

    <div class="card assumptions">
        <h2>Model Assumptions & Limitations</h2>
        <ul>
            <li><strong>Static Departure Times:</strong> Agents do not dynamically adjust their departure times to avoid congestion.</li>
            <li><strong>BPR Volume-Delay:</strong> Link travel times are estimated using the standard Bureau of Public Roads (BPR) function, which may overestimate delays at extreme V/C ratios.</li>
            <li><strong>Synthetic Demand:</strong> If marked as synthetic, the agent population is mathematically generated rather than derived from empirical census data.</li>
            <li><strong>Multinomial Logit Choice:</strong> Mode choices (Car, Walk, Transit) rely on simple fixed utilities, without modeling complex household vehicle constraints.</li>
        </ul>
    </div>

    <div class="disclaimer">
        <strong>Disclaimer:</strong> These are modelled estimates, not predictions. The METACITY engine utilizes macroscopic volume-delay approximation and synthetic agent routing. Results should be interpreted as directional indicators of policy impact rather than exact future measurements. Always consider the Calibration Badge level before relying on these figures for real-world infrastructure decisions.
    </div>

</body>
</html>
"""
    return html
