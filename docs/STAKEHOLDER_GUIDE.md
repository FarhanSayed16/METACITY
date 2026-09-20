# METACITY: Stakeholder Guide

Welcome to the METACITY Stakeholder Guide. This document is designed for planners, policymakers, and non-technical stakeholders to understand how to interpret the outputs of the METACITY simulator.

## What is METACITY?

METACITY is a macroscopic, multi-seed traffic simulation and urban planning platform. It allows city planners to design road networks, propose infrastructure changes (like new bypasses, bridge closures, or hospital relocations), and statistically measure the impact of those changes on city-wide traffic.

### Core Philosophy: Macroscopic & Statistical
Unlike microscopic simulators (which model individual cars and lane-changing behavior), METACITY models **aggregate flows** across the city network. This allows for extremely rapid evaluation of city-scale changes.

Because traffic is inherently chaotic, a single simulation run is never enough. METACITY enforces **multi-seed replication** and computes **95% Confidence Intervals (CI)** for all metrics, ensuring that you only make decisions based on statistically significant data, not random noise.

## Understanding the Reports

When you receive a METACITY comparison report, you will see several key components:

### 1. The Calibration Badge
At the top of every report is a Calibration Status Badge:
- 🟢 **Calibrated (GEH < 5):** The baseline model strongly aligns with real-world traffic counts. You can highly trust these results.
- 🟡 **Partially Calibrated (GEH < 10):** The baseline model loosely aligns with reality. Use results for directional guidance, but not precise engineering.
- 🔴 **Synthetic / Uncalibrated:** The baseline model has not been validated against real-world data. Results are purely theoretical.

*METACITY enforces this badge to prevent the overclaiming of model accuracy.*

### 2. Paired T-Tests & 95% Confidence Intervals
When comparing a "Scenario" (e.g., building a bypass) to the "Baseline":
- We run both the Baseline and the Scenario 5+ times using the exact same random seeds.
- We perform a **Paired T-Test** to compare the results.
- The report will tell you if the difference is **Statistically Significant**. If the p-value is > 0.05, the simulator concludes that the intervention had no measurable effect beyond random noise.

### 3. Key Performance Indicators (KPIs)
- **Average Travel Time:** The average time it takes for a trip to complete.
- **Congestion (V/C Ratio):** Volume-to-Capacity ratio. A V/C > 1.0 means the road is carrying more cars than it was designed for, leading to gridlock.
- **Isolation Metrics:** During disaster scenarios (e.g., floods), this measures how many nodes (neighborhoods) are completely severed from the rest of the city.
- **Emergency Access:** The average time required to reach the nearest hospital.

## Limitations & Assumptions

As a macroscopic simulator, METACITY has limitations:
1. **No Micro-Interactions:** It does not model red lights, stop signs, or individual pedestrian crossings.
2. **Static Capacity:** Capacity is calculated mathematically per hour (e.g., 1800 cars/lane/hour) and does not account for weather-induced friction unless explicitly configured.
3. **Trip Generation:** Currently, population generation is stochastic and evenly distributed. It does not ingest demographic census data in this MVP phase.

## The AI Planner (Assistant)
METACITY includes an ML-based Surrogate model that can suggest optimal parameters (like signal timings or lane expansions). Note that the AI **only suggests**; every AI proposal must be explicitly verified by a full, multi-seed ground-truth simulation before it is presented to you. This guarantees the AI cannot hallucinate results.
