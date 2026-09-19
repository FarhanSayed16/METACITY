# METACITY — Complete Project & DSA Build Plan

## AI-Assisted City & Infrastructure Simulation Platform

> **Build It Virtually First.**

| Field | Value |
|---|---|
| Project | METACITY |
| Document | **Build Plan v3.0** — sole authoritative product document |
| Date | 19 September 2026 |
| Status | Planning complete. Ready to start Phase 0 |
| Primary stack | Python (simulation, ML, API), React + TypeScript (web client) |
| Academic angle | Hand-implemented DSA (graphs, pathfinding, heaps, flow, centrality) with tests and demos |
| Purpose | One clean document: idea, claims, stack, data contracts, algorithms, roadmap, and end product |
| Companions | `METACITY_Backend_Implementation_Plan.md` (API/modules SoT) · `METACITY_Frontend_Implementation_Plan.md` (UI SoT) · `METACITY_Enhancements.md` (adopted register) · **`METACITY_Master_Plan.md` (execution plan + checklist — follow this for build order)** |

### Document status

This file is the **only** product/plan authority for vision, phases, and **acceptance criteria**. Backend and frontend plans expand implementation detail; on conflict about *what to build and when*, **this v3 wins**. On conflict about *API shapes or UI structure*, the respective companion plan wins.

### Document history

| Version | Date | Notes |
|---|---|---|
| v1 / Complete Project | earlier | Initial vision draft (superseded) |
| v2 Specification | 19 Sep 2026 | Detailed draft (superseded) |
| **v3.0 Build Plan** | 19 Sep 2026 | Sole plan + companions |
| v3.0 + enhancements merge | 19 Sep 2026 | Demand profiles, plan diversity, doc authority clarified; companions updated to v1.1 |

---

## Contents

1. [The Idea — What Are We Building?](#1-the-idea--what-are-we-building)
2. [The Problem We Solve](#2-the-problem-we-solve)
3. [How It Works — End-to-End Flow](#3-how-it-works--end-to-end-flow)
4. [Real-World Use Cases](#4-real-world-use-cases)
5. [What the End Product Looks Like](#5-what-the-end-product-looks-like)
6. [Complete Feature List](#6-complete-feature-list)
7. [Scope — In, Extended, Out](#7-scope--in-extended-out)
8. [The Simulated World — What Is Inside](#8-the-simulated-world--what-is-inside)
9. [Agent and Behaviour System](#9-agent-and-behaviour-system)
10. [Simulation Engine](#10-simulation-engine)
11. [2D and 3D Visualisation](#11-2d-and-3d-visualisation)
12. [Technical Stack](#12-technical-stack)
13. [System Architecture](#13-system-architecture)
14. [Data Model, Scene Schema and Formats](#14-data-model-scene-schema-and-formats)
15. [API and Real-Time Snapshots](#15-api-and-real-time-snapshots)
16. [Algorithms and DSA Usage](#16-algorithms-and-dsa-usage)
17. [Scenario Engine — Before vs After Comparison](#17-scenario-engine--before-vs-after-comparison)
18. [Metrics, KPIs and Reports](#18-metrics-kpis-and-reports)
19. [Validation, Calibration and Uncertainty](#19-validation-calibration-and-uncertainty)
20. [Taking It to a Higher Level](#20-taking-it-to-a-higher-level)
21. [Implementation Roadmap](#21-implementation-roadmap)
22. [Cut List — Academic Demo vs Product](#22-cut-list--academic-demo-vs-product)
23. [Flagship Demonstration](#23-flagship-demonstration)
24. [Testing Strategy](#24-testing-strategy)
25. [Non-Functional Requirements](#25-non-functional-requirements)
26. [Security, Privacy, Ethics and Licensing](#26-security-privacy-ethics-and-licensing)
27. [Risks and How We Handle Them](#27-risks-and-how-we-handle-them)
28. [Open Decisions](#28-open-decisions)
29. [Final Vision](#29-final-vision)
30. [Glossary](#30-glossary)
31. [Appendix A — Default Parameters](#appendix-a--default-parameters)

---

## 1. The Idea — What Are We Building?

### Claims policy (read first)

| Say | Do not say |
|---|---|
| Decision-support and simulation environment | Predicts the future of a city |
| Compares alternatives with quantified uncertainty | Guarantees outcomes |
| Modelled under stated assumptions | Realistic / accurate (without an error measure) |
| Calibrated against [named dataset] (only once true) | Presenting demo output as a real forecast |
| Synthetic city — not for real-world decisions (until calibrated) | We invented digital twins / urban simulation |

Every comparison screen and report must show a visible **calibration status** badge: `synthetic_uncalibrated` | `partially_calibrated` | `calibrated` plus model version and seed list.

### Canonical one-line pitch

> **METACITY lets you model a proposed development, simulate how a synthetic population responds, and compare alternatives with evidence — before building it.**

### In one paragraph

**METACITY** is a simulation platform that lets a government authority, infrastructure builder, college, hospital, or city planner **virtually design and test a proposed development before it is physically built**. The user creates (or imports) a virtual city or area with roads, buildings, and facilities. The system populates it with simulated people, vehicles, and systems. It then runs a **modelled** simulation of traffic, behaviour, and resource use under stated assumptions. The user can change the design and compare results. Everything is visible as a **2D map** and a **3D walkthrough** so stakeholders can see both appearance and modelled performance before construction.

### The core loop

```text
Real-world requirement (e.g., "we need a new highway")
        ↓
Design it virtually on the platform
        ↓
Populate with simulated people, vehicles, systems
        ↓
Run the simulation (seeded, reproducible)
        ↓
See results: traffic, behaviour, resource usage, 3D preview
        ↓
Change the design and simulate again
        ↓
Compare alternatives (Design A vs B vs C) with confidence ranges
        ↓
Present to stakeholders with data, assumptions, and 3D visuals
        ↓
Make an informed real-world decision (human decision-makers remain in charge)
```

### What makes this special

This is **not** just a 3D model viewer or a static map tool. It is:

- A **simulation** — the virtual city is alive under model rules. People move, traffic builds, resources are consumed, emergencies can be triggered.
- A **comparison tool** — multiple designs with numbers and uncertainty.
- A **cascade explorer** — shows how one change can affect travel, land use (later), utilities, and emergency access under the model.
- A **presentation tool** — 3D view and reports for stakeholders.
- A **DSA showcase** — core algorithms implemented from scratch with tests and demos.

### Definition of success

| Stage | Success means |
|---|---|
| **Hard MVP (end of Phase 3)** | Deterministic simulator on synthetic templates; baseline vs scenario with paired seeds and CI; 2D + basic 3D; comparison table in UI |
| **Demo-complete (end of Phase 4)** | Fire evacuation + hospital modules runnable on campus/hospital templates |
| **Credibility (Phase 7)** | One real OSM network imported; first calibration with reported error |
| **Research (Phase 9)** | Surrogate-assisted planner produces verified alternatives |
| **Product (post Phase 10)** | External planner finds output useful on a real question |

---

## 2. The Problem We Solve

### Why this matters

When a government builds a highway, a developer builds a factory, or a college expands, decisions affect thousands of people. Today those decisions often rely on:

- Static maps and blueprints
- Isolated traffic studies
- Guesswork about how people will react
- No scientific comparison of alternatives
- No way to explore cascading effects under a shared model

### The cascade problem

A single infrastructure change creates a chain of effects (modelled where modules exist):

```text
New Highway Built
        ↓
Traffic patterns change across the city
        ↓
Some areas get less congestion, others get more
        ↓
People change where they live and work (year loop — later phase)
        ↓
Housing demand shifts
        ↓
Businesses relocate to better-connected areas
        ↓
Electricity and water demand changes
        ↓
Emergency response times change
        ↓
Pollution patterns change
        ↓
The city differs in ways a static study may miss
```

**METACITY lets you explore these cascades in a virtual laboratory before they happen in the real world** — with explicit assumptions and calibration status.

### Who faces this problem

| Who | Their question |
|---|---|
| Government urban planning department | "If we build this highway, what happens to city traffic under our model?" |
| State highway authority | "Which road design gives the best traffic improvement?" |
| Infrastructure developer | "Will the new factory jam surrounding roads?" |
| College administration | "If there's a fire, how fast can we evacuate? Where are the bottlenecks?" |
| Hospital administration | "Can we handle a mass-casualty event? What if we add 20 beds?" |
| Municipal corporation | "Where should we put the new metro station for maximum impact?" |
| Real estate developer | "How will a new township affect traffic and utilities?" |
| Disaster management authority | "What if the river floods and cuts off the main bridge?" |

---

## 3. How It Works — End-to-End Flow

### Step 1: Create or Import the Area

Three ways to define the physical environment. **All three produce the same JSON scene format** (`schema_version` required). Build them in this order:

**Build order (decided):**

1. **Option C first: Load a template** — Hand-craft 2–3 JSON scene files (Nexus City road network, College Campus floor plan, City Hospital layout). No external dependencies. Simulation, routing, congestion, and basic 3D are proven against these templates first. **Effort: 1–2 days** (Phase 0 deliverable).

2. **Option A second: Draw from scratch** — Visual editor writes the **same JSON**. Split delivery:
   - **Editor MVP:** road nodes/links only (**~1–2 weeks**)
   - **Next:** facility placer
   - **With evacuation module:** building grid / corridor editor
   - Full road + building + transit + hospital editors are **not** a single 2–3 week block

3. **Option B last: Import real data** — Split into two efforts:
   - **Minimal OSM → same JSON network:** user enters a location → OSMnx + GeoPandas → converter → scene JSON. **Effort: ~2–3 weeks** (network + footprints; uncalibrated).
   - **Calibration against observed traffic:** separate **~4–5 weeks** inside Phase 7 (together Phase 7 ≈ 6–8 weeks).

```text
Template (hand-crafted JSON)  ──┐
                                 ├──→  Same schema_version JSON  ──→  Simulation Engine
Editor (user draws → JSON)    ──┤
                                 │
OSM Import (real data → JSON) ──┘
```

### Step 2: Configure the World

- **Population:** people, income distribution, car ownership, work locations
- **Facilities:** homes, offices, factories, shops, hospitals, schools, parks
- **Transport:** bus routes, metro lines, stations, schedules
- **Utilities:** electricity and water supply zones and capacities
- **Environment:** weather, green spaces, terrain
- **Policies (data fields):** speed limits, capacity; richer policies (parking, congestion charges, actuated signals) are **deferred** — see §10.7

### Step 3: Run the Baseline Simulation

Simulate a normal day (or longer):

- People follow daily plans
- Vehicles load the network; congestion updates travel times
- Transit carries passengers
- Hospitals serve patients (when that module is active)
- Resources are accounted for (when utility module is active)
- Traffic assignment moves toward equilibrium under the stated method

Watch in real time on the 2D map or basic/full 3D view. Calibration badge remains visible.

### Step 4: Create a Scenario

Examples: add a highway, place a metro station, add a factory, close a road, add homes, flood a link.

### Step 5: Run the Scenario Simulation

Agents adapt (routes, modes; later years: housing). Traffic redistributes.

### Step 6: Compare and Analyse

Side-by-side KPIs with paired seeds, differences, and 95% CI. Label `distinguishable` or `inconclusive`. Show calibration status and assumptions.

```text
                          Baseline    Scenario A    Difference     Status
Average travel time       32 min      24 min        -8 min         modelled
Peak congestion index     78%         45%           -33%           modelled
...
Calibration: synthetic_uncalibrated | model_version: 0.x | seeds: 0–9
```

### Step 7: View in 3D

Orbit, walkthrough (polish phase), traffic visualisation, before/after split (polish).

### Step 8: Generate Report

MVP: **HTML report** (print to PDF). Required sections: metrics, assumptions, seeds, calibration badge, model version, screenshot placeholders, recommendations. Full branded PDF later.

---

## 4. Real-World Use Cases

### 4.1 Highway and Road Planning

Import or template network → baseline traffic → each proposed route as a scenario → compare travel time, congestion, bottlenecks → 3D preview → report with assumptions.

### 4.2 Metro / Public Transport Planning

Mode split → proposed stations → ridership and car reduction → station placement alternatives.

### 4.3 Campus / College Fire Evacuation

Floor plan → occupants → fire start → evacuation, bottlenecks, alternatives → 3D walkthrough of building.

### 4.4 Hospital Emergency Planning

Configure beds/staff → normal flow → mass-casualty surge → test interventions → report on wait times and throughput (mortality claims only if model defines them and status is labelled).

### 4.5 Industrial / Factory Site Planning

Worker shifts and trucks → surrounding traffic impact → access road / stagger shifts.

### 4.6 Disaster Management (city-scale)

Bridge closure / flood → reroute, isolation, ambulance access → alternate bridge / evacuation routes. Uses the **event engine** on the city graph (not a second fire model).

### 4.7 New Township / Residential Development

Homes + school + market + access → commuting and utility demand → metro / wider access road tests (year-loop effects in later phase).

---

## 5. What the End Product Looks Like

### 5.1 The web application

Browser-based. Open, load a project/template, work on the map.

**MVP auth:** single-user local, **no accounts**. Multi-user and auth are post-MVP (Phase 10).

### 5.2 Main screens (priority tags)

| Screen | Priority | Notes |
|---|---|---|
| 1. Project Dashboard | **MVP** | List/create projects; load templates |
| 2. Map View | **MVP** | 2D default + basic 3D extrusions; layers; replay 1x–100x |
| 3. Editor | **MVP (roads)** → Next | Roads first; facilities next; building grid with evacuation |
| 4. Scenario Builder | **MVP** | Simple change list + validate |
| 5. Simulation Controls | **MVP** | Play, pause, step, reset, speed **1x–100x**, seed |
| 6. Comparison Dashboard | **MVP** | Table first; charts next; delta maps later |
| 7. 3D Walkthrough | **Next** (basic 3D in MVP map) | Orbit polish, first-person, split slider, day/night |
| 8. Report Generator | **Next** | HTML MVP; PDF polish later |
| 9. Agent Explorer | **Later** | Inspect individual agents |
| Hospital Configurator | **Next** (with Phase 4) | Departments, beds, staff |

#### Map View details

- **2D mode (default):** orthographic top-down; roads coloured by congestion; buildings as footprints; vehicles as dots/flows.
- **3D mode (MVP):** same Three.js scene, perspective camera, simple extruded boxes.
- **3D polish (Phase 5):** LOD, instancing polish, walkthrough, day/night, split slider.
- **Layers:** roads, buildings, traffic, congestion heatmap, zones, transit, utilities, environment.
- **Replay speed:** **1x–100x** everywhere (1000x only if later justified and performance-tested).

---

## 6. Complete Feature List

### 6.1 Core features (MVP must-have)

| # | Feature | Description |
|---|---|---|
| 1 | **City/area creation (templates + editor)** | Load JSON templates; draw roads (editor MVP). OSM is **credibility must-have**, not MVP |
| 2 | **Road network** | Nodes, links (lanes, speed, capacity); signals as optional fixed delay later |
| 3 | **Buildings and facilities** | Homes, offices, factories, shops, hospitals, schools, parks |
| 4 | **Synthetic population** | Homes, workplaces, income, car ownership, daily routines |
| 5 | **Traffic simulation (Level 1)** | Volume-delay (BPR), routing, equilibrium; animated flows |
| 6 | **Public transport (basic)** | Bus/metro lines, stops, headway, ridership |
| 7 | **Agent-based behaviour** | Route, mode, departure choices |
| 8 | **Scenario engine** | Diffs, multi-seed runs, paired comparison |
| 9 | **2D map view** | Layers, animations, heatmaps |
| 10 | **Basic 3D city view** | Extrusions, same scene as 2D |
| 11 | **Comparison dashboard** | Before/after tables; CI labels |
| 12 | **Infrastructure editor (roads)** | Add/remove/modify links and nodes |
| 13 | **Simulation controls** | Play, pause, speed 1x–100x, reset, step, seed |
| 14 | **Report export (HTML)** | Metrics, assumptions, calibration badge |
| 15 | **Reproducibility** | Same seed → same results (golden tests) |
| 15a | **Mechanism tracing (MVP-lite)** | Top-3 drivers of KPI change (full tracing later) |

### 6.2 Simulation modules

| # | Module | Phase | Description |
|---|---|---|---|
| 16 | **Road and highway planning** | 2–3 | Traffic impact of new/modified roads |
| 17 | **Fire and evacuation** | 4 | Building CA fire, smoke, panic, crowd |
| 18 | **Hospital emergency** | 4 | DES, triage, beds, surge |
| 19 | **City-scale disasters** | 8 | Flood, outage, bridge closure (event engine on city graph) |
| 20 | **Industrial site impact** | 3+ | Factory traffic generation |

### 6.3 Advanced features (should have)

| # | Feature | Description |
|---|---|---|
| 21 | **Land use model** | Housing demand, migration over years |
| 22 | **Utility demand** | Electricity and water per zone |
| 23 | **Emissions estimation** | CO2 from traffic |
| 24 | **Emergency accessibility** | Response time maps |
| 25 | **Multi-seed statistics** | Confidence intervals (also in MVP comparison) |
| 26 | **Full mechanism tracing** | Agent/link/zone level explanation |
| 27 | **Critical infrastructure analysis** | Betweenness, bridges, removal impact |
| 28 | **AI-assisted planning** | Suggest interventions (post-MVP) |
| 29 | **GIS/GeoJSON + OSM import** | Real networks (Phase 7) |
| 29a | **GTFS transit import** | Phase 7 with real data |
| 30 | **Day/night cycle** | Visual only (Phase 5 polish) |

### 6.4 Stretch features (could have)

| # | Feature | Description |
|---|---|---|
| 31 | **ML surrogate model** | Fast screening from simulator runs |
| 32 | **Natural language scenario creation** | Assist authoring only — LLMs stay out of the sim loop |
| 33 | **Real-time data feeds** | Live traffic digital twin |
| 34 | **VR/AR walkthrough** | Immersive viewing |
| 35 | **Multi-user collaboration** | Accounts, annotate |
| 36 | **CAD/BIM import** | Architecture models |
| 37 | **External transport engines** | Optional SUMO/MATSim adapter |

---

## 7. Scope — In, Extended, Out

| Tier | Includes | When |
|---|---|---|
| **In (MVP)** | Templates, road editor MVP, Level-1 traffic, scenarios, multi-seed CI, 2D + basic 3D, comparison table, HTML report skeleton, DSA library with tests | Phases 0–3 |
| **Extended** | Evacuation, hospital, land use, utilities, emissions, OSM+GTFS, calibration, city disasters, 3D polish, full tracing, critical infrastructure | Phases 4–8 |
| **Optional / research** | ML surrogate, AI planner, NL authoring, live feeds, VR, multi-user, CAD/BIM, SUMO/MATSim | Phase 9–10+ |
| **Out of scope** | Metaverse / unconstrained AI society; replacing professional engineers; guaranteed forecasts; microscopic car-following as MVP; full rent/developer land market; waste logistics as a first-class module |

---

## 8. The Simulated World — What Is Inside

### 8.1 The virtual city

```text
THE VIRTUAL CITY
    |
    +-- Physical layer
    |   +-- Roads (lanes, speed, capacity; optional signal delay)
    |   +-- Buildings (residential, commercial, industrial, public)
    |   +-- Infrastructure (bridges, flyovers, tunnels, parking as data)
    |   +-- Public transport (stops, stations, routes)
    |   +-- Utilities (power, water zones)
    |   +-- Environment (parks, water, terrain, weather)
    |
    +-- People layer
    |   +-- Households, persons, vehicles
    |   +-- Behaviour (route, mode, adaptation)
    |
    +-- Activity layer
    |   +-- Daily plans, traffic, transit usage, resource accounting
    |
    +-- Event layer
        +-- Normal (rush hour)
        +-- Planned (construction, closure)
        +-- Emergency (building fire module; city flood/closure module)
```

### 8.2 How the city is generated

**Synthetic demonstration city:** size → road hierarchy → zones → facilities → population → daily plans → vehicles → transit.

**Real area (Phase 7):** OSM download → internal nodes/links → footprints/land use → synthetic population from aggregate stats → GTFS if available → calibrate if observed data exists → always show calibration status.

---

## 9. Agent and Behaviour System

### 9.1 What is an agent?

Independent decision-making entities. Traffic is the **emergent** result of many choices under model rules — not scripted paths.

### 9.2 Person agent

| Attribute | Description |
|---|---|
| ID | Unique identifier |
| Household | Membership |
| Age group | Child, student, adult, senior |
| Employment | Worker, student, unemployed, retired |
| Home / Workplace / School | Locations |
| Income | Affects mode and (later) housing |
| Car available / Transit pass | Mode eligibility |
| Daily plan | Ordered activities |
| Current location / activity | Runtime state |
| Preferences | Mode preference weights |

### 9.3 How agents make decisions

```text
Next activity from daily plan
        →
Choose mode (multinomial logit: time, cost, wait, transfers)
        →
Route (A* / Dijkstra on congested network)
        →
Travel (time from BPR / assignment)
        →
Update experience → may re-route next iteration / day
```

### 9.4 How agents create traffic

Morning peak → volumes rise → BPR increases times → partial reassignment toward equilibrium → gap recorded in run metadata.

### 9.5 Evacuation agent (fire module)

Stress 0–1; states Calm → Alert → Panic → Following; speed modified by stress and density; herding at high stress.

### 9.6 Hospital patient agent

Arrival, severity 1–5, state machine through triage → treatment → ward → discharge.

---

## 10. Simulation Engine

### 10.1 Time model

| Clock | Resolution | Use |
|---|---|---|
| **City day loop** | Base tick = **1 simulated minute** (configurable to 5 min for speed) | Traffic, activities, transit |
| **Day length** | 1,440 minutes (288 ticks at 5-min resolution) | One sim-day |
| **Evacuation** | **1 simulated second** per tick on building grid | Fire CA + crowd |
| **Hospital DES** | Continuous event time (priority queue); mapped to sim clock for logging | Patient events |
| **Year loop** | **1 year** aggregate step | Land use / migration (Phase 6) |

### 10.2 Module boundaries

| Shared across modules | Isolated |
|---|---|
| Clock interface, seeded RNG, scenario ops, metrics bus, result writers | Campus fire **grid graph** vs city **road graph** |
| | Hospital DES may run **standalone** for demos |

Do not require one giant unified physics. Compose modules through shared services.

### 10.3 How the city day simulation runs

```text
For each tick:
  1. Advance clock
  2. Process scheduled events (closures, surges)
  3. Update environment (if active)
  4. Update agents (activity → mode → route → move)
  5. Update traffic volumes; recompute BPR times
  6. Update resources / hospital (if coupled)
  7. Collect metrics
  8. Optionally emit UI snapshot (rate-limited)
```

### 10.4 Transport fidelity levels

| Level | What it is | When |
|---|---|---|
| **Level 1 (MVP)** | Volume-delay (BPR) + time-binned / iterative assignment; UI animates flows or sampled agents | Phases 1–3 |
| **Level 2 (later)** | Queue-based / mesoscopic | After MVP if needed |
| **Optional** | SUMO/MATSim via adapter (`load_network`, `run`, `get_volumes`) | Explicitly optional — not required for DSA demo |

Moving dots/3D cars are **visualisation** of Level-1 flows unless Level 2 is implemented. Do not claim microscopic car-following in MVP.

### 10.5 Congestion model (BPR)

```text
t = t0 × (1 + α × (v/c)^β)
Default: α = 0.15, β = 4
```

Industry-standard volume-delay. Parameters in Appendix A; mark uncalibrated until Phase 7.

### 10.6 Equilibrium (day-to-day learning)

**Method:** Method of Successive Averages (MSA) **or** partial reassignment (re-route a fraction of agents each iteration — default 15% as a starting heuristic; prefer MSA for reporting).

**Stop when:** relative gap &lt; ε (default 0.01) **or** max iterations (default 50).

**Record in run metadata:** `equilibrium_method`, `final_gap`, `iterations`.

### 10.7 Policy knobs — MVP vs later

| Knob | MVP behaviour |
|---|---|
| Speed, lanes, capacity | Fully active |
| Traffic signals | Optional **fixed delay** per node; actuated signals later |
| Parking rules, congestion charges | Data fields only until a later phase defines behaviour |

### 10.8 Two timescales

**Day loop:** operational (traffic, evacuation, hospital).

**Year loop (Phase 6):**

```text
Year N accessibility metrics
        →
Housing demand shift (simplified rules — not a full rent market)
        →
Updated population / job locations
        →
Day loop for Year N+1
```

**Not modelled in MVP/early year loop:** endogenous rents, developer supply, full firm relocation theory.

### 10.9 Fire and evacuation (Phase 4)

Cellular automaton on 1 m grid. **Parameters are illustrative defaults** (Appendix A), labelled uncalibrated:

- Fire spread probability per adjacent floor cell per tick (default 0.05)
- Smoke spreads faster than fire
- A* to exits; panic and queuing rules as in agent section

### 10.10 Hospital DES (Phase 4)

Priority queue of events: arrive → triage → treat → ward → discharge. Resource-constrained queues.

---

## 11. 2D and 3D Visualisation

### 11.1 Dual rendering paths (explicit)

| Context | Stack |
|---|---|
| **Synthetic city, campus, hospital** | **Three.js / R3F only** — one scene, two cameras (ortho = 2D, perspective = 3D) |
| **Real geographic basemap (Phase 7+)** | **MapLibre GL** (+ deck.gl or Three overlay) for satellite/OSM context; simulation layers on top |

Do not pretend MapLibre is the same as the Three.js dual-camera path. Synthetic-first avoids dual-renderer cost until Phase 7.

### 11.2 How 3D is generated (synthetic path)

Roads → planes by lane width; buildings → extrusions (floors × 3 m); vehicles/people → instanced simple meshes; fire → coloured cells; lighting ambient + sun.

### 11.3 Performance strategy

- Instanced meshes, LOD (dots when zoomed out)
- Simulation in worker/process; snapshots at configurable rate
- **UI target:** 30+ fps with 5,000 displayed agents on a mid-range laptop
- **Sim targets (MVP):** see §25

---

## 12. Technical Stack

### 12.1 Overview

```text
+----------------------------------------------------+
|  FRONTEND — React + TypeScript + Three.js/R3F      |
|  (+ MapLibre/deck.gl only for real basemaps later) |
|  Charts: Recharts (default)                        |
+----------------------------------------------------+
            |  REST API + WebSocket  |
+----------------------------------------------------+
|  BACKEND — Python 3.12 + FastAPI + workers         |
|  METACITY-core (pure library, pyproject package)    |
+----------------------------------------------------+
            |
|  SQLite + Parquet/DuckDB → PostgreSQL/PostGIS later |
```

### 12.2 Why these technologies

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Standard web UI |
| 3D | Three.js via R3F | Mature web 3D; instancing |
| Real maps (later) | MapLibre + deck.gl | GIS basemap path |
| Charts | **Recharts** (default); ECharts optional | KPI dashboards |
| State | Zustand | Light, WS-friendly |
| Backend | Python 3.12 + FastAPI | Sim + ML + API in one language |
| Sim core | NumPy + SciPy; custom DSA | Vectorisation + hand-written algorithms |
| Routing | Custom Dijkstra/A*; rustworkx optional | DSA demo + optional speed |
| Geospatial | GeoPandas, Shapely, OSMnx | OSM import |
| ML (later) | scikit-learn, XGBoost, Optuna | Surrogate, calibration |
| Storage MVP | SQLite + Parquet via DuckDB | Zero infra |
| Storage prod | PostgreSQL + PostGIS | Multi-user later |
| Realtime | FastAPI WebSocket | Snapshot stream |
| Parallel | multiprocessing process pool | Multi-seed runs |
| Packaging | `pyproject.toml` → import `metacity_core` | Clean library boundary |
| Test | pytest, Vitest | Backend / frontend |
| CI | GitHub Actions | On every commit |
| Deploy | Docker Compose | api, worker, frontend; db optional |

### 12.3 How to run it

**Development:**

```bash
# Terminal 1 — backend
cd backend
pip install -e .
uvicorn api.main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# http://localhost:5173
```

**Production (Compose services):**

| Service | Role |
|---|---|
| `api` | FastAPI |
| `worker` | Simulation job processes |
| `frontend` | Static UI via Nginx |
| `db` | Optional Postgres (not required for MVP SQLite) |

```bash
docker compose up
```

---

## 13. System Architecture

### 13.1 Architecture diagram

```text
                      +----------------------------------+
                      |      Web Client (Browser)        |
                      |  React + TypeScript              |
                      |  Three.js / R3F                  |
                      |  MapLibre (real basemap later)   |
                      |  Recharts | Editor | Controls    |
                      +---------------+------------------+
                                      |
                                      | REST + WebSocket
                                      |
                      +---------------v------------------+
                      |      FastAPI Backend             |
                      |  Routes: projects, scenarios,    |
                      |          runs, results, reports  |
                      |  Job Manager (MVP: process pool) |
                      |  Workers: one replication each   |
                      |  METACITY-core (pure library)     |
                      |  Intelligence: scenarios;        |
                      |    ML/planner later              |
                      +---------------+------------------+
                                      |
                      +---------------v------------------+
                      |  SQLite | Parquet+DuckDB         |
                      |  GeoJSON scenes                  |
                      |  Postgres+PostGIS later          |
                      +----------------------------------+
```

### 13.2 Key design principle

`METACITY-core` is a **pure Python library**: no web, no DB, no rendering. Usable from API, workers, notebooks, and CLI.

### 13.3 Job model (MVP)

| Item | MVP decision |
|---|---|
| Queue | In-process / local process pool (no Redis required) |
| Job states | `queued` \| `running` \| `completed` \| `failed` |
| Progress | WebSocket keyed by `run_id` |
| Results | Parquet under `data/runs/{run_id}/` + SQLite metadata |
| Crash | Failed state + error message; re-run by new job |
| Production later | Redis/RQ or similar — optional |

### 13.4 Repository structure

```text
METACITY/   (product name: METACITY)
+-- backend/
|   +-- pyproject.toml             # package: metacity_core
|   +-- core/                      # Pure simulation library
|   |   +-- clock.py
|   |   +-- world.py
|   |   +-- agents/
|   |   +-- transport/
|   |   +-- evacuation/
|   |   +-- hospital/
|   |   +-- events/
|   |   +-- metrics/
|   |   +-- tracing/
|   |   +-- rng.py
|   |   +-- algorithms/            # DSA implementations
|   |       +-- graph.py, dijkstra.py, astar.py, bfs.py
|   |       +-- heap.py, max_flow.py, betweenness.py
|   |       +-- bridges.py, spatial_index.py, union_find.py
|   +-- scenarios/
|   +-- ml/                        # later
|   +-- planner/                   # later
|   +-- api/
|   |   +-- main.py, routes/, schemas/, ws/
|   +-- workers/
|   +-- data/                      # templates, generators
|   +-- tests/
|
+-- frontend/
|   +-- src/
|   |   +-- components/ Map/ Scene3D/ Editor/ Dashboard/ Controls/ Report/
|   |   +-- hooks/ store/ api/ types/
|   +-- vite.config.ts, package.json
|
+-- docs/                          # This build plan
+-- docker-compose.yml
+-- README.md
```

---

## 14. Data Model, Scene Schema and Formats

### 14.1 Core data entities

| Entity | Key fields | Purpose | Phase |
|---|---|---|---|
| **Project** | id, name, study area, created_at | Container | 0 |
| **Node** | id, x, y, type | Junction | 0 |
| **Link** | id, from, to, lanes, speed, capacity, road_class | Road segment | 0 |
| **Zone** | id, name, land_use, geometry | Aggregation | 0 |
| **Facility** | id, type, zone, node, capacity, jobs, dwellings | Place | 0 |
| **Transit Line** | id, mode, stops, headway, capacity, fare | Transit | 2 |
| **Household** | id, income, cars, dwelling, members | People group | 1 |
| **Person** | id, household, age, job, home, workplace, daily_plan, prefs | Agent | 1 |
| **Vehicle** | id, household, type, current_link | Mobile unit | 1 |
| **Activity / Plan step** | person_id, purpose, location, start, duration | Schedule | 1 |
| **Scenario** | id, baseline_ref, changes[], overrides{} | Diff | 3 |
| **Run** | id, scenario, seeds[], status, results, gap_meta | Execution | 3 |
| **Comparison** | id, run_A, run_B, metrics, differences | Before/after | 3 |
| **Event** | id, type, time, targets, params | Closures, surges | 4/8 |
| **BuildingFloor / GridCell** | floor_id, x, y, walkable, material | Evacuation | 4 |
| **Signal (optional)** | node_id, fixed_delay_s | Delay model | later |
| **Snapshot frame** | t, link metrics, sampled agents | UI stream | 1 |
| **Report artifact** | run_ids, html_path, assumptions | Export | 3 |

### 14.2 Scene JSON schema (contract)

Every template, editor export, and OSM converter output **must** validate against this contract.

**Coordinates:** synthetic templates use **local metres** with origin (0,0). Real imports use **EPSG:4326** lon/lat plus a stored projected local frame for simulation.

**Minimal scene shape:**

```json
{
  "schema_version": "1.0",
  "scene_id": "nexus_city_baseline",
  "name": "Nexus City",
  "crs": "local_metres",
  "bounds": { "min_x": 0, "min_y": 0, "max_x": 8000, "max_y": 8000 },
  "nodes": [
    { "id": "N1", "x": 100, "y": 200, "type": "intersection" }
  ],
  "links": [
    {
      "id": "L1",
      "from": "N1",
      "to": "N2",
      "lanes": 2,
      "speed_kph": 50,
      "capacity": 1200,
      "road_class": "arterial"
    }
  ],
  "zones": [
    { "id": "Z1", "name": "North Residential", "land_use": "residential", "polygon": [] }
  ],
  "facilities": [
    { "id": "F1", "type": "home", "zone": "Z1", "node": "N1", "dwellings": 40 }
  ],
  "transit_lines": [],
  "population_ref": "embedded_or_file",
  "parameters": { "bpr_alpha": 0.15, "bpr_beta": 4 },
  "calibration_status": "synthetic_uncalibrated"
}
```

**Building / evacuation scenes** may be separate files with `schema_version`, `grid`, `exits`, `stairs`, `initial_occupants`.

**Hospital config** may be a scene module: departments, beds, staff counts, arrival processes.

### 14.3 Scenario format

Scenarios store **diffs only**:

```json
{
  "schema_version": "1.0",
  "scenario_id": "sc_bypass",
  "baseline": "nexus_city_baseline",
  "name": "Eastern highway bypass",
  "changes": [
    { "op": "add_link", "from": "N10", "to": "N22", "lanes": 2, "speed_kph": 80 },
    { "op": "set_lanes", "target": "L5", "new_value": 3 },
    { "op": "add_facility", "type": "factory", "zone": "Z5", "jobs": 800 }
  ],
  "seeds": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
}
```

### 14.4 Schema drift prevention

- Golden fixture scenes in `backend/data/templates/`
- CI validates templates + editor samples + (later) OSM converter output against `schema_version`
- Converter and editor must bump version deliberately with a migration note

---

## 15. API and Real-Time Snapshots

### 15.1 Minimal REST API (MVP)

| Method | Path | Purpose |
|---|---|---|
| POST | `/projects` | Create project |
| GET | `/projects` | List projects |
| GET | `/projects/{id}` | Get project |
| POST | `/projects/{id}/load_template` | Load scene template |
| POST | `/scenarios` | Create scenario |
| GET | `/scenarios/{id}` | Get scenario |
| POST | `/runs` | Enqueue run (`scenario_id`, `seeds`) |
| GET | `/runs/{id}` | Status, progress, gap metadata |
| GET | `/runs/{id}/metrics` | KPI vector / time series |
| POST | `/comparisons` | Pair baseline vs scenario runs |
| GET | `/comparisons/{id}` | Table + CI + calibration badge |
| GET | `/reports/{comparison_id}` | HTML report |

Auth: **none** for MVP (localhost trust).

**API source of truth:** the endpoint catalogue in the **Backend Implementation Plan** is authoritative and may expand beyond this minimal list. This section remains the product-level contract summary.

Full OpenAPI is generated by FastAPI from Pydantic schemas in code; frontend types are generated from that OpenAPI.

### 15.2 WebSocket snapshot

`WS /runs/{run_id}/stream`

**Minimal payload:**

```json
{
  "run_id": "r1",
  "t": 480,
  "progress": 0.33,
  "link_metrics": [{ "id": "L1", "volume": 900, "vc": 0.75, "tt_min": 4.2 }],
  "agents_sample": [{ "id": "P12", "x": 120, "y": 400, "mode": "car" }],
  "flags": { "equilibrium_iter": 3 }
}
```

**Rules:**
- Emit **2–10 Hz** max (configurable)
- Sample agents; never require full population dumps for UI
- UI must not block the simulator on render

---

## 16. Algorithms and DSA Usage

Every core algorithm is implemented from scratch (optional rustworkx only as a **verified fallback**, not a substitute for DSA demos).

| # | Algorithm / DS | Where used | Why |
|---|---|---|---|
| 1 | Graph (adjacency list) | Roads, corridors | Spatial foundation |
| 2 | Dijkstra | Weighted shortest path | Classic routing |
| 3 | A* | Heuristic routing | Faster routing |
| 4 | BFS | Reachability | Connectivity |
| 5 | Binary min-heap | PQ for routing, triage, DES | O(log n) |
| 6 | Max-flow (Edmonds-Karp) | Evacuation bound | Exit capacity |
| 7 | Betweenness centrality | Critical roads | Through-traffic |
| 8 | Bridge detection (Tarjan) | Single points of failure | Disconnect risk |
| 9 | Connected components | Validation | Edit checks |
| 10 | Union-Find | Fast connectivity | Editor |
| 11 | Grid-to-graph | Floor plans | Evacuation graph |
| 12 | Cellular automaton | Fire/smoke | Spread model |
| 13 | Spatial index (grid) | Neighbours | Local queries |
| 14 | Discrete-event scheduler | Hospital, events | Time-ordered events |
| 15 | BPR volume-delay | Congestion | Standard formula |
| 16 | Multinomial logit | Mode choice | Probabilistic modes |
| 17 | Seeded PRNG | All randomness | Reproducibility |
| 18 | Paired t-test / CI | Comparison | Multi-seed stats |
| 19 | Greedy heuristic | Road suggestion | Planner later |
| 20 | Hill climbing | Exit placement | Evacuation optim |

### 16.1 DSA showcase map (algorithm → demo → test)

| Algorithm | Module | Demo scene / story | Test file (planned) |
|---|---|---|---|
| Graph + Union-Find | Editor validation | Break a link → show disconnect | `test_union_find.py` |
| Dijkstra / A* | Transport | Commute routing on Nexus City | `test_shortest_path.py` |
| Binary heap | Routing + hospital | Triage order under surge | `test_heap.py` |
| BPR + MSA | Traffic | Congestion colours + gap → 0 | `test_equilibrium.py` |
| Multinomial logit | Mode choice | Metro opens → mode shift | `test_mode_choice.py` |
| CA + A* grid | Evacuation | Lab fire → bottleneck corridor | `test_evac_fire.py` |
| Max-flow | Evacuation | Theoretical exit bound vs sim | `test_max_flow.py` |
| Tarjan bridges | Critical infra | Remove bridge → isolation | `test_bridges.py` |
| Betweenness | Critical infra | Highlight critical corridors | `test_betweenness.py` |
| DES heap | Hospital | 100-casualty surge queues | `test_hospital_des.py` |
| Paired CI | Scenarios | Bypass vs baseline table | `test_comparison_ci.py` |

This table is the **academic/DSA spine** of the project — keep demos runnable even if product features slip.

---

## 17. Scenario Engine — Before vs After Comparison

### 17.1 How comparison works

```text
1. BASELINE: 10 seeds → KPI per seed
2. SCENARIO: same seeds → KPI per seed
3. COMPARE: paired differences → mean → 95% CI
   → label distinguishable | inconclusive
4. TRACE (MVP-lite): top-3 mechanisms (e.g. % switching to bypass)
5. REPORT: all metrics + assumptions + calibration badge
```

### 17.2 Example comparison output

```text
Comparison: Highway Bypass (Scenario A) vs Current Network (Baseline)
Seeds: 10 paired runs
Calibration: synthetic_uncalibrated | model_version: 0.3.0

Metric                         Baseline    Scenario A    Diff      95% CI           Label
Average travel time (min)      32.4        24.1          -8.3      [-9.5, -7.1]     Distinguishable
Total delay (veh-hours)        1,240       680           -560      [-620, -500]     Distinguishable
Congestion index (%)           78          45            -33       [-38, -28]       Distinguishable
Car mode share (%)             82          71            -11       [-14, -8]        Distinguishable
CO2 emissions (t/day)          450         380           -70       [-85, -55]       Distinguishable
Emergency response (min)       14          11            -3        [-4, -2]         Distinguishable

Mechanism trace (MVP-lite):
  1. 18% of commuters from Z19–Z21 switched from ring road to bypass
  2. Ring road peak V/C dropped from 1.12 to 0.87
  3. 9% switched from car to bus (relative time)

Assumptions: Synthetic city. BPR α=0.15, β=4. MSA ε=0.01.
```

---

## 18. Metrics, KPIs and Reports

### 18.1 What we measure

| Category | Metric | Unit |
|---|---|---|
| **Traffic** | Average travel time | minutes |
| | Total delay | vehicle-hours/day |
| | Congestion index | percent |
| | Peak speed | km/h |
| **Transit** | Ridership per line | passengers/day |
| | Transit mode share | percent |
| **Accessibility** | Jobs within 30/45 min | count |
| | Population within 15 min of hospital | percent |
| **Land use** | Population by zone | persons |
| | Housing occupancy | percent |
| **Utilities** | Peak electricity / water | kW / m³/hr |
| **Environment** | CO2 from traffic | tonnes/day |
| **Emergency** | Ambulance response time | minutes |
| **Evacuation** | Clearance time; trapped count; bottlenecks; panic rate | various |
| **Hospital** | ER wait; bed utilisation; throughput | various |

### 18.2 Report requirements (MVP)

HTML document including: title, model version, calibration badge, seeds, parameter summary, KPI table with CI, MVP-lite mechanism list, map/3D screenshot placeholders, disclaimer that outputs are model results.

---

## 19. Validation, Calibration and Uncertainty

| Stage | What we do |
|---|---|
| **Always** | Seeded runs; CI on paired differences; assumptions panel |
| **Synthetic** | Face validity + sensitivity on key parameters |
| **Phase 7** | Compare modelled volumes/times to observed counts where available; report MAE/MAPE or similar |
| **Never** | Hide calibration status; present uncalibrated output as forecast |

Uncertainty communication: UI explains `inconclusive` (CI crosses zero / policy threshold).

---

## 20. Taking It to a Higher Level

### 20.1 Maturity levels

| Level | What it is | Who |
|---|---|---|
| 1 Academic | Synthetic city, DSA, basic UI | Students, professors |
| 2 Research | Reproducible experiments | Researchers |
| 3 Planning prototype | OSM + calibration + reports | Consultants |
| 4 Government tool | Multi-stakeholder, validated models | Municipalities |
| 5 Product | Cloud, multi-tenant | Industry |

**Gate:** Do not market Level 4+ until Phase 7 calibration exists and claims policy is enforced in UI.

### 20.2 How to present to decision makers

Problem → live demo → comparison with CI → 3D → report with assumptions and calibration badge.

### 20.3 Stakeholder-specific views

Mayor (summary), transport engineer (V/C tables), planner (zones), environment (emissions), emergency (coverage), public (simple before/after).

---

## 21. Implementation Roadmap

### 21.1 Hard MVP cutoff

**MVP = end of Phase 3.** Public demo definition:

1. Load Nexus City template  
2. Run baseline (multi-seed)  
3. Apply bypass scenario  
4. Show comparison table with CI + calibration badge  
5. Show 2D map + basic 3D extrusions  
6. Run at least three DSA demos from §16.1  

Phases **4+** are demo-complete / extended. Phases **7–10** are **post-MVP / optional for product** (still valuable, not required to claim MVP done).

### 21.2 Phase overview

| Phase | Name | Duration | Key output | Track |
|---|---|---|---|---|
| **0** | Foundations | 2 weeks | Repo, `schema_version`, **JSON templates**, package layout | MVP |
| **1** | Simulation Core + basic view | 5–6 weeks | Agents on map; 2D + **basic 3D**; snapshots | MVP |
| **2** | Traffic and Transport | 5–6 weeks | BPR, mode choice, MSA/gap, transit basic, **AM/PM demand profiles**, **diverse activity plan templates** | MVP |
| **3** | Scenario Engine + Comparison | 4–5 weeks | Multi-seed CI, **comparison dashboard**, HTML report, DSA demos | **MVP END** |
| **4** | Evacuation and Hospital | 4–5 weeks | Building fire CA + hospital DES (standalone OK) | Extended |
| **5** | 3D Visualisation polish | 4–5 weeks | Walkthrough, LOD, day/night, split slider | Extended |
| **6** | Land Use, Utilities, Advanced | 5–6 weeks | Year loop, housing rules, utilities, emissions | Extended |
| **7** | Real Data and Calibration | 6–8 weeks | OSM (**2–3 wk** import) + GTFS + **calibration (~4–5 wk)** | Credibility |
| **8** | City Events and Disasters | 4–6 weeks | Flood, outage, bridge closure on **city event engine** | Extended |
| **9** | ML and AI Planner | 6–8 weeks | Surrogate, planner (needs stable scenario library) | Optional |
| **10** | Polish and Stakeholder Ready | 5–6 weeks | Reports, presets, Docker, optional auth | Optional |

**Duration guidance:** MVP (0–3) ≈ **16–19 weeks** solo (P50). Full table through Phase 10 ≈ **50–60 weeks** solo P50 / longer at P80. With 2–3 developers, compress carefully without skipping acceptance tests.

**Ordering note:** City disasters (**Phase 8**) come **before** ML (**Phase 9**). Building fire stays in Phase 4 only.

### 21.3 Acceptance criteria (pass/fail)

#### Phase 0

- [ ] Repo layout matches §13.4; `pip install -e .` imports `metacity_core`
- [ ] `schema_version` validator exists
- [ ] ≥2 templates load: Nexus City + Campus **or** Hospital
- [ ] CI runs empty/pytest discover

#### Phase 1

- [ ] ≥200 agents simulate one day on template
- [ ] Same seed → identical agent trajectory hash (single-thread golden test)
- [ ] Map shows agents/flows; basic 3D extrusions toggle
- [ ] WS or poll delivers snapshots ≥2 Hz without stalling sim

#### Phase 2

- [ ] BPR updates travel times; V/C visible on links
- [ ] Mode choice logit produces nonzero transit share when transit exists
- [ ] Equilibrium stops with `final_gap` recorded &lt; ε or at max iter
- [ ] Dijkstra/A* unit tests pass; routing used by agents
- [ ] **Time-dependent demand profiles** produce distinct AM/PM peaks (not flat all-day load)
- [ ] **≥5 activity plan templates** assigned by person type

#### Phase 3 (MVP gate)

- [ ] Scenario diff applies (`add_link`, `set_lanes`, …)
- [ ] Built-in scenario **presets** listable via API / UI
- [ ] 10 paired seeds → comparison table with 95% CI labels
- [ ] Calibration badge visible in UI
- [ ] Mechanism trace MVP-lite returns ≤3 drivers
- [ ] HTML report generates for a comparison (with screenshot placeholders)
- [ ] ≥3 entries from §16.1 DSA showcase runnable

> Companion backend/frontend checklists must **reference** these criteria, not invent conflicting gates.

#### Phase 4

- [ ] Fire spreads on campus grid; agents evacuate; clearance time KPI
- [ ] Hospital DES surge changes wait time when beds added
- [ ] Modules run without requiring full city year-loop

#### Phase 5

- [ ] First-person or orbit walkthrough; LOD does not drop below target fps on demo scene

#### Phase 6

- [ ] Year step changes zone population under accessibility rule
- [ ] Utility and emissions KPIs appear in comparison

#### Phase 7

- [ ] OSM bbox → valid `schema_version` scene
- [ ] Attribution/license note shown
- [ ] Calibration report shows error metric vs observed (even if poor)

#### Phase 8

- [ ] Flood/closure event removes link capacity; isolation/reachability KPIs update
- [ ] No duplicate fire engine — reuses events + city graph

#### Phase 9

- [ ] Surrogate predicts a KPI within stated tolerance on holdout runs
- [ ] Planner proposes ≥1 intervention verified by full sim

#### Phase 10

- [ ] `docker compose up` serves UI + API + worker
- [ ] Stakeholder preset loads flagship demo in &lt;3 clicks

### 21.4 What to build first (summary)

```text
ESSENTIAL (MVP — Phases 0–3)
  Algorithm library + tests
  Simulation engine + Level-1 traffic
  Scenario engine + comparison dashboard
  2D map + basic 3D
  HTML report + calibration badge

IMPORTANT (Phases 4–6)
  Evacuation + hospital
  3D polish
  Land use / utilities / emissions

CREDIBILITY (Phase 7)
  OSM + GTFS + calibration

VALUABLE (Phase 8)
  City-scale disasters

ADVANCED (Phases 9–10)
  ML surrogate + AI planner
  Multi-user, cloud, live feeds
```

---

## 22. Cut List — Academic Demo vs Product

### Never cut (academic / DSA core)

- Algorithm library with tests and §16.1 demos
- Traffic Level-1 + scenario comparison with CI
- 2D map + basic 3D
- Reproducibility / golden seeds
- Calibration status labelling

### Cut first if time is short (product extras)

- ML and AI planner
- Multi-user / auth / cloud
- Real-time data feeds, VR, CAD/BIM
- Full 3D polish (keep basic extrusions)
- Deep year-loop land market
- Actuated signals, parking, congestion pricing behaviour

### Cut only after MVP is safe

- OSM calibration (keep synthetic demo)
- City disaster pack (keep highway + evacuation stories)

---

## 23. Flagship Demonstration

**Name:** Eastern Highway Bypass (Nexus City)

**Story:** City faces peak congestion on the ring road. Three alternatives: do nothing, 2-lane bypass, 4-lane bypass.

**Success criteria for a live demo:**

1. Load template &lt; 10 seconds  
2. Show baseline congestion colours  
3. Run Scenario B (4-lane) with ≥5 seeds (10 preferred)  
4. Display comparison table with CI + `synthetic_uncalibrated`  
5. Show MVP-lite mechanism trace  
6. Toggle basic 3D  
7. Optional: Tarjan demo — remove a bridge, show isolation  

**Secondary demos:** Campus fire evacuation; hospital surge (Phase 4+).

---

## 24. Testing Strategy

| Layer | What |
|---|---|
| **Unit** | Each DSA module; BPR; logit; schema validator |
| **Golden seed** | Single-thread full day hash/KPI lockfile |
| **Scenario** | Diff apply + comparison CI smoke |
| **Performance** | Bench: agents × links × wall time |
| **Frontend** | Vitest for store/API client; manual map smoke |
| **CI** | GitHub Actions on every commit: pytest + schema fixtures |

Parallel multi-seed runs are allowed for speed but **must not** be the source of golden reproducibility tests.

---

## 25. Non-Functional Requirements

| NFR | Target |
|---|---|
| Reproducibility | Same seed + same software version → same KPIs (single-thread) |
| Sim performance (MVP) | ~1,000 agents, small template network: **&lt; 30 s wall / sim-day** on a mid laptop |
| Multi-seed | 10 seeds via process pool on all CPU cores |
| Memory (MVP) | Comfortable on 16 GB RAM for template demos |
| UI | 30+ fps with 5,000 displayed agents |
| Provenance | Every result stores `model_version`, `schema_version`, parameters, seeds, calibration status |
| Logging | Run start/end, errors, equilibrium gap |

---

## 26. Security, Privacy, Ethics and Licensing

| Topic | Rule |
|---|---|
| **Auth** | None in MVP; localhost single-user |
| **Privacy** | Synthetic population only; no real personal data |
| **Census** | Use aggregate statistics only; do not redistribute restricted microdata |
| **OSM** | Comply with **ODbL** — attribution in UI and reports |
| **Evacuation metrics** | “Trapped / casualties” are **model outcomes** for planning drills — present sensitively; not real predictions |
| **LLMs** | May help author scenarios/narration; **must not** drive agent decisions inside the sim loop |
| **Ethics** | Decision-support only; humans decide |

---

## 27. Risks and How We Handle Them

| # | Risk | Mitigation |
|---|---|---|
| 1 | Scope explosion | Hard MVP at Phase 3; cut list §22 |
| 2 | 3D performance | Instancing, LOD, profile first |
| 3 | Unrealistic traffic | Level-1 BPR/logit/MSA; calibrate later; label status |
| 4 | Overpromising | Claims policy + calibration badge |
| 5 | Real data unavailable | Templates first; OSM open data |
| 6 | Sim bottleneck | NumPy, multiprocessing, sampling |
| 7 | Too complex for users | Templates, presets, flagship demo |
| 8 | Schema drift | Fixtures + `schema_version` CI |
| 9 | Dual renderer complexity | Three-only until Phase 7 |
| 10 | CI misread by non-experts | `inconclusive` education in UI |
| 11 | Academic vs product clash | DSA showcase map separate from product roadmap |
| 12 | Licensing / attribution gaps | Checklist in OSM/GTFS import |
| 13 | Nondeterminism from threads/floats | Golden tests single-thread; document parallel limits |

---

## 28. Open Decisions

Resolve during Phase 0–2; update this table when decided.

| Decision | Options | Default leaning |
|---|---|---|
| City tick | 1 min vs 5 min | 1 min accuracy / 5 min speed toggle |
| Equilibrium | MSA vs fixed 15% re-route | **MSA** for reported runs |
| Real basemap | MapLibre+deck vs Three overlay | MapLibre + overlay |
| External engines | None vs SUMO/MATSim adapter | **None** for MVP/DSA |
| Charts | Recharts vs ECharts | **Recharts** |
| Report PDF | Browser print vs dedicated lib | Print HTML for MVP |
| Package name | `metacity_core` vs `metacity_core` | `metacity_core` |

---

## 29. Final Vision

### What we are building

> **METACITY is a virtual laboratory for cities and infrastructure.** Design a proposed development, populate it with a synthetic population, simulate under stated assumptions, and compare alternatives in 2D and 3D with evidence — before building in the real world.

### The workflow

```text
Requirement → Design → Simulate → Compare → Visualise → Decide → Implement
```

### The principle

> **Build it virtually first.**

### The value

| For | METACITY provides |
|---|---|
| Government | Evidence-oriented infrastructure exploration |
| Infrastructure builders | Impact simulation before construction |
| Colleges | Evacuation drills and bottleneck finding |
| Hospitals | Surge planning under resource constraints |
| Citizens | Understandable before/after visuals |
| Researchers / students | Reproducible experiments and DSA demos |

### One-line pitch

> **METACITY lets you model a proposed development, simulate how a synthetic population responds, and compare alternatives with evidence — before building it.**

---

## 30. Glossary

| Term | Meaning |
|---|---|
| **BPR** | Bureau of Public Roads volume-delay function |
| **MSA** | Method of Successive Averages (equilibrium assignment) |
| **DES** | Discrete-event simulation |
| **V/C** | Volume / capacity ratio |
| **KPI** | Key performance indicator |
| **Mechanism trace** | Explanation of *why* a KPI changed |
| **Calibration status** | synthetic_uncalibrated / partially_calibrated / calibrated |
| **schema_version** | Version of the scene JSON contract |
| **Level-1 traffic** | BPR + assignment (not microscopic) |
| **Hard MVP** | End of Phase 3 acceptance gate |
| **ODbL** | Open Data Commons Open Database License (OSM) |

---

## Appendix A — Default Parameters

Illustrative defaults. Always written into run metadata. Tune in calibration.

| Parameter | Default | Notes |
|---|---|---|
| `bpr_alpha` | 0.15 | Standard |
| `bpr_beta` | 4 | Standard |
| `msa_epsilon` | 0.01 | Relative gap |
| `msa_max_iter` | 50 | Cap |
| `reassignment_fraction` | 0.15 | If using partial reassignment heuristic |
| Mode logit: time coeff | −0.03 / min | Placeholder |
| Mode logit: cost coeff | −0.005 / currency unit | Placeholder |
| Mode logit: wait/transfer penalties | TBD | Set in Phase 2 |
| City tick | 1 min | Configurable to 5 |
| Evacuation tick | 1 s | Building grid |
| Fire spread p | 0.05 / neighbour / tick | **Uncalibrated illustrative** |
| Smoke spread | faster than fire | Illustrative |
| Panic stress threshold | 0.7 | Illustrative |
| Comparison seeds | 10 | Paired |
| Snapshot rate | 2–10 Hz | Cap |
| Lane width visual | 3.5 m | Rendering |
| Floor height visual | 3.0 m | Rendering |

---

*This is the sole living project document. Update it as the project evolves; do not fork parallel plans.*
