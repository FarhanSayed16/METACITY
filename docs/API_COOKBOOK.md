# METACITY API Cookbook

This cookbook demonstrates how to programmatically control METACITY using standard `curl` commands. This is useful for running large batch experiments, scripting CI/CD workflows, or building external tools that interact with METACITY's core simulation engine.

## 1. Create a Project from a Template

Create a new project workspace based on the "Nexus City Baseline" template.

```bash
curl -X POST http://localhost:8000/projects \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My Nexus Project",
    "description": "Baseline evaluation for 2026",
    "scene_json_path": "data/templates/nexus_city_baseline.json",
    "profile_id": "default"
  }'
```

*Note: Save the `id` returned from the response, it will be used as `PROJECT_ID` below.*

## 2. Apply a Scenario Preset

If you want to apply a predefined scenario (e.g., Eastern Highway Bypass) to an existing scene:

```bash
curl -X POST "http://localhost:8000/scenarios/apply?project_id=PROJECT_ID&preset_id=highway_bypass"
```

## 3. Run a Multi-Seed Simulation Batch

Run the macroscopic simulation across multiple random seeds to build 95% Confidence Intervals.

```bash
curl -X POST http://localhost:8000/runs \
  -H 'Content-Type: application/json' \
  -d '{
    "scenario_id": "SCENARIO_ID",
    "seeds": [42, 99, 7, 13, 55],
    "run_name": "Bypass Test Runs"
  }'
```

## 4. Compare Scenarios (A/B Testing)

Compare a baseline set of runs against a scenario set of runs to compute statistical significance and paired T-tests.

```bash
curl -X POST http://localhost:8000/comparisons \
  -H 'Content-Type: application/json' \
  -d '{
    "baseline_run_ids": ["run_1", "run_2", "run_3"],
    "scenario_run_ids": ["run_4", "run_5", "run_6"]
  }'
```

## 5. Download the HTML Stakeholder Report

Generate a portable, interactive HTML report for the comparison, complete with the Calibration Badge and 95% CIs.

```bash
curl http://localhost:8000/reports/COMPARISON_ID > report.html
```

## 6. AI Planner: Find Optimal Scenarios

Query the ML Surrogate model to automatically propose optimal simulation parameters.

```bash
curl -X POST http://localhost:8000/planner/PROJECT_ID/search \
  -H 'Content-Type: application/json' \
  -d '{
    "objective": "minimize_travel_time",
    "n_candidates": 10
  }'
```
