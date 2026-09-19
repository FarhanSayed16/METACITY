def generate_comparison_report(stats: dict) -> str:
    """
    Generate a simple HTML report summarizing a comparison.
    """
    html = f"""
    <html>
    <head>
        <title>METACITY Comparison Report</title>
        <style>
            body {{ font-family: sans-serif; margin: 40px; }}
            .sig {{ color: green; font-weight: bold; }}
            .insig {{ color: gray; }}
        </style>
    </head>
    <body>
        <h1>Comparison Report</h1>
        <p>Runs sampled per scenario: {stats.get('samples', 0)}</p>
        
        <h2>Travel Time</h2>
        <ul>
            <li>Baseline Mean: {(stats.get('travel_time') or {}).get('baseline_mean', 0):.2f} min</li>
            <li>Scenario Mean: {(stats.get('travel_time') or {}).get('scenario_mean', 0):.2f} min</li>
            <li>Difference: {(stats.get('travel_time') or {}).get('diff_mean', 0):.2f} min</li>
        </ul>
        <p class="{'sig' if (stats.get('travel_time') or {}).get('significant') else 'insig'}">
            Statistically Significant: {(stats.get('travel_time') or {}).get('significant')}
        </p>
    </body>
    </html>
    """
    return html
