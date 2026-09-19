# EvoCity Nexus — Backend Implementation Plan

> **No code.** Structure, modules, services, responsibilities, data flow, and build order only.  
> Aligns with `EvoCity_Nexus_DSA_Build_Plan_v3.md`.

| Field | Value |
|---|---|
| Project | EvoCity Nexus (METACITY) |
| Document | Backend Implementation Plan v1.0 |
| Date | 19 September 2026 |
| Stack | Python 3.12 · FastAPI · SQLite · Parquet/DuckDB · process-pool workers |
| Package name | `evocity_core` (pure simulation library) |
| Scope | Everything under `backend/` through MVP and later phases |

---

## Contents

1. [Purpose and Principles](#1-purpose-and-principles)
2. [Backend Layers at a Glance](#2-backend-layers-at-a-glance)
3. [Top-Level Folder Map](#3-top-level-folder-map)
4. [Layer A — Packaging and Configuration](#4-layer-a--packaging-and-configuration)
5. [Layer B — Pure Core (`evocity_core`)](#5-layer-b--pure-core-evocity_core)
6. [Layer C — Scenario and Intelligence Services](#6-layer-c--scenario-and-intelligence-services)
7. [Layer D — Persistence and Storage](#7-layer-d--persistence-and-storage)
8. [Layer E — Job System and Workers](#8-layer-e--job-system-and-workers)
9. [Layer F — API Surface (HTTP + WebSocket)](#9-layer-f--api-surface-http--websocket)
10. [Layer G — Data Assets (Templates, Generators, Imports)](#10-layer-g--data-assets-templates-generators-imports)
11. [Layer H — Reporting](#11-layer-h--reporting)
12. [Layer I — Later Modules (ML, Planner, GIS, Auth)](#12-layer-i--later-modules-ml-planner-gis-auth)
13. [Layer J — Tests and Quality](#13-layer-j--tests-and-quality)
14. [Cross-Cutting Concerns](#14-cross-cutting-concerns)
15. [Service Catalogue](#15-service-catalogue)
16. [Feature → Module Ownership Matrix](#16-feature--module-ownership-matrix)
17. [Request and Simulation Lifecycles](#17-request-and-simulation-lifecycles)
18. [Data Contracts the Backend Owns](#18-data-contracts-the-backend-owns)
19. [Build Order by Phase](#19-build-order-by-phase)
20. [MVP Backend Checklist](#20-mvp-backend-checklist)
21. [What Must Never Depend on What](#21-what-must-never-depend-on-what)
22. [Open Backend Decisions](#22-open-backend-decisions)

---

## 1. Purpose and Principles

### What the backend is for

- Own the **simulation truth** (world state, algorithms, metrics, reproducibility)
- Expose a **stable API** for the React frontend
- Run **multi-seed jobs** without blocking the API process forever
- Persist **projects, scenarios, runs, comparisons, reports**
- Stay honest: every result carries **model version, schema version, seeds, calibration status**

### Hard rules

| Rule | Meaning |
|---|---|
| **Pure core** | `core/` has no FastAPI, no SQLite, no WebSocket, no filesystem side effects beyond optional explicit I/O helpers |
| **One scene contract** | Templates, editor saves, OSM converter all validate the same `schema_version` |
| **Seeded RNG only** | All randomness goes through one RNG service |
| **Jobs are the unit of work** | One replication = one worker job; comparison aggregates completed runs |
| **Claims on every result** | Calibration badge + assumptions travel with metrics and reports |
| **DSA lives in core** | Hand-written algorithms under `core/algorithms/`; optional fast libraries only as verified fallbacks later |

---

## 2. Backend Layers at a Glance

```text
┌─────────────────────────────────────────────────────────────┐
│  F. API  (FastAPI routes, schemas, WebSocket)               │
├─────────────────────────────────────────────────────────────┤
│  E. Jobs / Workers  (enqueue, progress, process pool)       │
├─────────────────────────────────────────────────────────────┤
│  C. Domain services  (scenarios, compare, reports, import)  │
├─────────────────────────────────────────────────────────────┤
│  B. Pure core  (clock, world, agents, transport, modules)   │
│     └── algorithms (DSA)                                    │
├─────────────────────────────────────────────────────────────┤
│  D. Persistence  (SQLite metadata + Parquet results)        │
│  G. Data assets  (templates, fixtures, generators)          │
└─────────────────────────────────────────────────────────────┘
```

**Mental model:** API talks to services → services load scenes / apply scenarios → services enqueue runs → workers call core → results land in storage → API streams progress and returns metrics.

---

## 3. Top-Level Folder Map

Everything below lives under `backend/`. Folders are **logical modules**; each bullet is a file or subfolder that should exist as a named responsibility (not code).

```text
backend/
│
├── pyproject.toml                          # Package metadata, deps, entry points
├── README.md                               # How to install and run backend only
├── .env.example                            # Paths, ports, worker count, snapshot Hz
│
├── core/                                   # PURE LIBRARY — package: evocity_core
│   ├── __init__.py                         # Public exports / version
│   ├── version.py                          # model_version string
│   ├── clock.py
│   ├── world.py
│   ├── config.py                           # Sim parameter object (BPR, MSA, ticks)
│   ├── rng.py
│   ├── types/                              # Shared enums & lightweight records
│   ├── schema/                             # Scene / building / hospital validators
│   ├── algorithms/                         # DSA implementations
│   ├── network/                            # Road graph wrappers over algorithms
│   ├── agents/
│   ├── activity/
│   ├── transport/
│   ├── transit/
│   ├── population/
│   ├── events/
│   ├── evacuation/
│   ├── hospital/
│   ├── landuse/                            # Phase 6
│   ├── utilities/                          # Phase 6
│   ├── emissions/                          # Phase 6
│   ├── metrics/
│   ├── tracing/
│   ├── snapshot/                           # Build UI snapshot frames (pure)
│   └── runner.py                           # run_replication(config, seed) → Result
│
├── scenarios/                              # Diff apply, validate, build run configs
├── comparison/                             # Paired stats, CI labels
├── reports/                                # HTML report assembly
├── geospatial/                             # Phase 7 OSM/GTFS converters
├── calibration/                            # Phase 7 fit & error reports
├── ml/                                     # Phase 9
├── planner/                                # Phase 9
│
├── persistence/                            # DB models, repositories, paths
├── jobs/                                   # Job manager, states, progress bus
├── workers/                                # Process entrypoints
│
├── api/                                    # FastAPI application
│   ├── main.py
│   ├── deps.py                             # Shared dependencies
│   ├── settings.py
│   ├── routes/
│   ├── schemas/                            # Request/response Pydantic models
│   ├── ws/
│   └── middleware/                         # Logging, CORS, error envelope
│
├── data/
│   ├── templates/                          # Hand-crafted scenes
│   ├── fixtures/                           # Golden test scenes
│   ├── generators/                         # Synthetic city builders
│   ├── runs/                               # Runtime output (gitignored)
│   └── imports/                            # Cached OSM/GTFS artefacts (later)
│
└── tests/
    ├── unit/
    ├── integration/
    ├── golden/
    ├── performance/
    └── conftest.py
```

---

## 4. Layer A — Packaging and Configuration

### Responsibilities

- Define installable package `evocity_core`
- Pin runtime dependencies (FastAPI, NumPy, SciPy, Pydantic, DuckDB, etc.)
- Expose CLI entry points later if needed (`evocity-run`, `evocity-validate-scene`)
- Centralise environment settings: data directory, worker count, snapshot rate, DB path

### Files / units

| Unit | Responsibility |
|---|---|
| `pyproject.toml` | Package name, version, dependencies, pytest config |
| `api/settings.py` | App settings loaded from env |
| `core/version.py` | `model_version` stamped on every run |
| `core/config.py` | Simulation parameters object (Appendix A defaults) |
| `.env.example` | Documented knobs for local dev |

### Phase

Phase 0.

---

## 5. Layer B — Pure Core (`evocity_core`)

> This layer is the product’s scientific heart. It must be runnable from notebooks and tests with **zero** API.

### 5.1 Foundation

| File / module | Responsibility |
|---|---|
| `clock.py` | Simulation clock; city tick; evacuation tick; year step interface |
| `world.py` | Container for network, agents, facilities, zones, runtime state |
| `config.py` | Parameters: BPR α/β, MSA ε, tick length, snapshot options |
| `rng.py` | Seeded PRNG; child streams per subsystem if needed |
| `types/` | IDs, enums (mode, land_use, job status, calibration status) |
| `runner.py` | Single entry: run one replication → structured `Result` |

### 5.2 Schema (contract enforcement inside core)

| Module | Responsibility |
|---|---|
| `schema/scene.py` | Validate city scene JSON against `schema_version` |
| `schema/building.py` | Validate evacuation grid / floors / exits |
| `schema/hospital.py` | Validate hospital resource config |
| `schema/scenario.py` | Validate scenario diff ops |
| `schema/migrate.py` | Version bump helpers (when schema evolves) |

### 5.3 Algorithms (DSA spine)

Each unit is a **named algorithm file** with clear inputs/outputs and tests.

| Module | Algorithm | Used by |
|---|---|---|
| `algorithms/graph.py` | Adjacency-list graph | Network, corridors |
| `algorithms/dijkstra.py` | Dijkstra | Routing |
| `algorithms/astar.py` | A* | Routing with heuristic |
| `algorithms/bfs.py` | BFS | Reachability |
| `algorithms/heap.py` | Binary min-heap | Routing PQ, DES, triage |
| `algorithms/max_flow.py` | Edmonds–Karp | Evacuation bound |
| `algorithms/betweenness.py` | Betweenness centrality | Critical roads |
| `algorithms/bridges.py` | Tarjan bridges | Single points of failure |
| `algorithms/components.py` | Connected components | Validation |
| `algorithms/union_find.py` | Disjoint set | Fast connectivity in editor checks |
| `algorithms/grid_graph.py` | Grid → graph | Evacuation floors |
| `algorithms/spatial_index.py` | Grid spatial index | Neighbour queries |
| `algorithms/ca.py` | Cellular automaton step helpers | Fire/smoke |
| `algorithms/des_scheduler.py` | Discrete-event scheduler | Hospital / city events |
| `algorithms/bpr.py` | BPR volume-delay | Congestion |
| `algorithms/logit.py` | Multinomial logit | Mode choice |
| `algorithms/stats_paired.py` | Paired differences / CI helpers | Comparison (may live in comparison/ too) |

### 5.4 Network

| Module | Responsibility |
|---|---|
| `network/model.py` | Nodes, links, attributes (lanes, speed, capacity) |
| `network/builder.py` | Build graph from scene JSON |
| `network/validation.py` | Connectivity, dangling nodes, capacity sanity |
| `network/costs.py` | Free-flow and congested costs per link |
| `network/signals.py` | Optional fixed delay (later behaviour) |

### 5.5 Population and agents

| Module | Responsibility |
|---|---|
| `population/generator.py` | Build households/persons from scene + rules |
| `population/household.py` | Household record behaviour |
| `agents/person.py` | Person agent state |
| `agents/vehicle.py` | Vehicle binding to person/household |
| `agents/evacuee.py` | Evacuation-specific stress/state |
| `agents/patient.py` | Hospital patient state |
| `activity/plans.py` | Daily plan representation |
| `activity/scheduler.py` | Advance activities by clock |

### 5.6 Transport (Level-1 traffic)

| Module | Responsibility |
|---|---|
| `transport/routing.py` | Pathfinding facade over Dijkstra/A* |
| `transport/assignment.py` | Load paths onto links; accumulate volumes |
| `transport/congestion.py` | Apply BPR; update travel times |
| `transport/equilibrium.py` | MSA / partial reassignment loop; gap metric |
| `transport/animation_state.py` | Sampled positions for UI (not microscopic physics) |

### 5.7 Mode choice and transit

| Module | Responsibility |
|---|---|
| `transport/mode_choice.py` | Multinomial logit utilities and draw |
| `transit/network.py` | Lines, stops, headways |
| `transit/assignment.py` | Boarding / ridership accounting (MVP-simple) |

### 5.8 Events

| Module | Responsibility |
|---|---|
| `events/model.py` | Event types: closure, flood, surge, fire_start |
| `events/engine.py` | Schedule and apply events onto world |
| `events/city_disasters.py` | Phase 8: flood, outage, bridge closure rules |

### 5.9 Evacuation module (Phase 4)

| Module | Responsibility |
|---|---|
| `evacuation/grid.py` | Floor grid cells |
| `evacuation/fire.py` | Fire CA (parameterised, uncalibrated defaults) |
| `evacuation/smoke.py` | Smoke spread |
| `evacuation/crowd.py` | Movement, queuing, density |
| `evacuation/stress.py` | Panic / herding |
| `evacuation/runner.py` | Evacuation replication entry |

### 5.10 Hospital module (Phase 4)

| Module | Responsibility |
|---|---|
| `hospital/resources.py` | Beds, staff, departments |
| `hospital/triage.py` | Priority by severity |
| `hospital/flow.py` | Care pathway states |
| `hospital/runner.py` | DES replication entry (standalone OK) |

### 5.11 Land use, utilities, emissions (Phase 6)

| Module | Responsibility |
|---|---|
| `landuse/year_loop.py` | Year step; accessibility → demand shift |
| `landuse/housing.py` | Simplified housing demand rules |
| `utilities/demand.py` | Electricity / water by zone |
| `emissions/traffic_co2.py` | CO2 from vehicle-km |

### 5.12 Metrics, tracing, snapshots

| Module | Responsibility |
|---|---|
| `metrics/kpis.py` | Travel time, delay, V/C, ridership, etc. |
| `metrics/accessibility.py` | Jobs/hospital reachability |
| `metrics/emergency.py` | Response-time style metrics |
| `metrics/evac_kpis.py` | Clearance, trapped, bottlenecks |
| `metrics/hospital_kpis.py` | Wait, utilisation, throughput |
| `tracing/mvp_lite.py` | Top-3 mechanism drivers |
| `tracing/full.py` | Later: agent/link/zone level |
| `snapshot/builder.py` | Build rate-limited snapshot frames |
| `snapshot/sampling.py` | Agent sampling policy |

### 5.13 Core public API (conceptual)

The only functions the rest of the backend should need:

| Operation | Meaning |
|---|---|
| Validate scene | Schema check |
| Load world | Scene JSON → World |
| Apply scenario | Diff → new World / config |
| Run replication | `(world_or_config, seed) → Result` |
| Run evacuation / hospital | Module-specific runners |
| Build snapshot | From world at time t |
| Compute KPIs | From Result |

---

## 6. Layer C — Scenario and Intelligence Services

These sit **above** core. They may use persistence paths and orchestration, but still no HTTP types.

### 6.1 `scenarios/`

| Unit | Responsibility |
|---|---|
| `ops_catalog.py` | Allowed ops: `add_link`, `set_lanes`, `add_facility`, `close_link`, … |
| `applier.py` | Apply ordered changes to a scene/world |
| `validator.py` | Semantic checks (endpoints exist, capacity &gt; 0, connectivity) |
| `builder.py` | Build baseline + scenario run configs for jobs |
| `presets.py` | Flagship bypass and other demo scenarios |

### 6.2 `comparison/`

| Unit | Responsibility |
|---|---|
| `pairing.py` | Pair runs by seed |
| `statistics.py` | Mean diff, 95% CI, distinguishable / inconclusive |
| `assembler.py` | Comparison record + calibration badge + assumptions |
| `mechanism.py` | Call core MVP-lite tracing across paired results |

### 6.3 Critical infrastructure (valuable / later)

| Unit | Responsibility |
|---|---|
| `critical/bridges_service.py` | Orchestrate Tarjan + removal scenarios |
| `critical/betweenness_service.py` | Rank corridors for demos |

---

## 7. Layer D — Persistence and Storage

### 7.1 What is stored where

| Store | Contents |
|---|---|
| **SQLite** | Projects, scenarios metadata, run status, comparison metadata, report paths |
| **Parquet files** | Per-run time series, link metrics, KPI vectors, optional agent samples |
| **JSON files** | Scene snapshots attached to projects; scenario diffs |
| **HTML files** | Generated reports |
| **Postgres + PostGIS** | Later replacement for SQLite when multi-user |

### 7.2 `persistence/` layout

| Unit | Responsibility |
|---|---|
| `db.py` | Connection / session bootstrap |
| `models.py` | Tables: Project, Scenario, Run, Comparison, Report |
| `paths.py` | Canonical paths under `data/runs/{run_id}/` |
| `repositories/projects.py` | CRUD projects |
| `repositories/scenarios.py` | CRUD scenarios |
| `repositories/runs.py` | CRUD runs + status transitions |
| `repositories/comparisons.py` | CRUD comparisons |
| `results_writer.py` | Write Parquet/JSON result artefacts |
| `results_reader.py` | Read metrics for API and reports |
| `migrations/` or init script | Create schema on first boot (MVP-simple) |

### 7.3 Run artefact layout (conceptual)

```text
data/runs/{run_id}/
  meta.json              # seed, model_version, schema_version, params, status
  kpis.parquet           # final KPI vector
  link_timeseries.parquet
  equilibrium.json       # method, gap, iterations
  snapshots/             # optional recorded frames for replay
  error.txt              # if failed
```

### 7.4 Phase

MVP: SQLite + Parquet. Phase 10 optional: Postgres.

---

## 8. Layer E — Job System and Workers

### 8.1 Job manager (`jobs/`)

| Unit | Responsibility |
|---|---|
| `states.py` | `queued` \| `running` \| `completed` \| `failed` |
| `manager.py` | Enqueue, cancel (optional), list active |
| `progress_bus.py` | In-memory pub/sub for WebSocket (MVP) |
| `pool.py` | Process pool sizing from settings |
| `replication_job.py` | Payload: scene/scenario refs, seed, run_id |

### 8.2 Workers (`workers/`)

| Unit | Responsibility |
|---|---|
| `replication_worker.py` | Load config → call `core.runner` → write results → publish progress |
| `batch_runner.py` | Fan-out N seeds for one scenario |
| `health.py` | Worker alive / busy signals |

### 8.3 MVP constraints

- No Redis required
- API process owns the pool **or** a sibling worker process started by Compose
- Crash → mark run `failed` with error message; user re-enqueues
- Golden reproducibility tests **never** use the parallel pool

### 8.4 Production later

Optional Redis/RQ (or similar) behind the same `jobs/manager.py` interface — swap implementation, keep API stable.

---

## 9. Layer F — API Surface (HTTP + WebSocket)

### 9.1 Application shell (`api/`)

| Unit | Responsibility |
|---|---|
| `main.py` | App factory, router include, lifespan (DB init, pool start/stop) |
| `settings.py` | Env configuration |
| `deps.py` | Inject repositories, job manager |
| `middleware/logging.py` | Request logging |
| `middleware/errors.py` | Uniform error envelope |
| `middleware/cors.py` | Local frontend origin |

### 9.2 Route modules (`api/routes/`)

| Route module | Endpoints (conceptual) | Owns |
|---|---|---|
| `health.py` | Liveness / readiness | Ops |
| `projects.py` | Create, list, get, load template, save scene | Project lifecycle |
| `scenes.py` | Validate scene, get scene JSON | Schema gate |
| `scenarios.py` | Create, get, list, validate diff | Scenario CRUD |
| `runs.py` | Enqueue, get status, get metrics | Simulation jobs |
| `comparisons.py` | Create, get comparison table | Before/after |
| `reports.py` | Get HTML report | Export |
| `templates.py` | List available templates | Discovery |
| `network_tools.py` | Connectivity check, bridge list (DSA demos) | Editor / demos |
| `evac.py` | Enqueue evacuation run (Phase 4) | Campus module |
| `hospital.py` | Enqueue hospital run (Phase 4) | Hospital module |
| `geo_import.py` | OSM import job (Phase 7) | Real data |
| `calibration.py` | Calibration report (Phase 7) | Credibility |
| `planner.py` | Suggest interventions (Phase 9) | AI planner |

### 9.3 Request/response schemas (`api/schemas/`)

Mirror domain entities without leaking core internals:

- ProjectCreate / ProjectOut
- SceneOut / SceneValidateResult
- ScenarioCreate / ScenarioOut
- RunCreate / RunOut / RunMetricsOut
- ComparisonCreate / ComparisonOut (includes calibration badge)
- ReportOut
- ErrorOut
- SnapshotFrame (WS)

### 9.4 WebSocket (`api/ws/`)

| Unit | Responsibility |
|---|---|
| `runs_stream.py` | `WS /runs/{run_id}/stream` |
| `subscription.py` | Attach client to progress bus |
| `throttle.py` | Enforce 2–10 Hz |

### 9.5 Auth

| Phase | Behaviour |
|---|---|
| MVP | No auth; localhost trust |
| Phase 10 | Optional accounts module; do not sprinkle checks before then |

---

## 10. Layer G — Data Assets (Templates, Generators, Imports)

### 10.1 `data/templates/`

| Asset | Purpose |
|---|---|
| `nexus_city_baseline.json` | Flagship road city |
| `college_campus.json` | Evacuation building | 
| `city_hospital.json` | Hospital DES |
| `README.md` | How to author templates |

### 10.2 `data/fixtures/`

Golden scenes for CI schema + reproducibility locks.

### 10.3 Generators (`data/generators/` or `core/population` helpers)

| Unit | Responsibility |
|---|---|
| `synthetic_city.py` | Procedural ring/radial network (optional beyond hand templates) |
| `population_from_zones.py` | Assign homes/jobs from zone capacities |
| `daily_plans.py` | Build home→work→shop→home style plans |

### 10.4 Geospatial (`geospatial/`) — Phase 7

| Unit | Responsibility |
|---|---|
| `osm_download.py` | Fetch bbox via OSMnx |
| `osm_to_scene.py` | Convert to `schema_version` scene |
| `gtfs_import.py` | Transit lines from GTFS |
| `crs.py` | Lon/lat ↔ local metres |
| `attribution.py` | ODbL attribution strings for API/reports |

---

## 11. Layer H — Reporting

### `reports/`

| Unit | Responsibility |
|---|---|
| `html_builder.py` | Assemble HTML from comparison + assumptions |
| `sections.py` | Title, badge, seeds, KPI table, mechanism list, disclaimer |
| `assets.py` | Placeholder image slots for screenshots |
| `store.py` | Write file path; register in persistence |

**MVP:** HTML only (print to PDF in browser). Dedicated PDF engine is optional later.

---

## 12. Layer I — Later Modules (ML, Planner, GIS, Auth)

### 12.1 `calibration/` (Phase 7)

| Unit | Responsibility |
|---|---|
| `targets.py` | Observed counts/speeds input format |
| `fit.py` | Simple parameter adjustment helpers |
| `error_report.py` | MAE/MAPE style summary |
| `status.py` | Promote calibration_status carefully |

### 12.2 `ml/` (Phase 9)

| Unit | Responsibility |
|---|---|
| `dataset_builder.py` | Build training set from past runs |
| `surrogate_train.py` | Train regressor on KPIs |
| `surrogate_infer.py` | Fast screen candidates |
| `anomaly.py` | Flag odd run outputs |

### 12.3 `planner/` (Phase 9)

| Unit | Responsibility |
|---|---|
| `candidates.py` | Generate intervention candidates |
| `search.py` | Greedy / hill-climb over candidates |
| `verify.py` | Always verify top picks with full core sim |

### 12.4 Auth (Phase 10)

| Unit | Responsibility |
|---|---|
| `api/routes/auth.py` | Login/session if ever needed |
| `persistence` user table | Ownership of projects |

Keep LLMs **out** of `core/` agent decision loops forever.

---

## 13. Layer J — Tests and Quality

### Layout

```text
tests/
├── unit/
│   ├── algorithms/          # One file per DSA module
│   ├── transport/
│   ├── schema/
│   ├── scenarios/
│   └── metrics/
├── integration/
│   ├── test_run_pipeline.py
│   ├── test_comparison_api.py
│   └── test_ws_progress.py
├── golden/
│   ├── locks/               # Expected KPI hashes
│   └── test_seed_repro.py
└── performance/
    └── test_sim_day_budget.py
```

### What each class proves

| Class | Proves |
|---|---|
| Unit / algorithms | DSA correctness and edge cases |
| Unit / schema | Invalid scenes rejected |
| Integration | API → job → Parquet → metrics |
| Golden | Same seed → same KPI vector (single-thread) |
| Performance | MVP wall-time budget for 1k agents |

---

## 14. Cross-Cutting Concerns

| Concern | Where handled |
|---|---|
| Logging | API middleware + worker logs with `run_id` |
| Model provenance | `meta.json` on every run |
| Calibration badge | Comparison assembler + report sections |
| Error model | Typed failures: validation, job, internal |
| Config defaults | `core/config.py` + Appendix A of main plan |
| CORS | API middleware for Vite origin |
| Idempotency | New run_id per enqueue; no silent overwrite |
| Cancellation | Optional later; MVP fail/retry |

---

## 15. Service Catalogue

Think in **services** the frontend (or CLI) can call. Each service is implemented by one or more modules above.

| Service | Primary modules | Phase |
|---|---|---|
| **Project Service** | persistence + templates | 0–1 |
| **Scene Service** | schema + network builder | 0–1 |
| **Template Service** | data/templates | 0 |
| **Simulation Service** | core.runner + jobs | 1–2 |
| **Transport Service** | transport/* | 2 |
| **Transit Service** | transit/* | 2 |
| **Scenario Service** | scenarios/* | 3 |
| **Comparison Service** | comparison/* | 3 |
| **Metrics Service** | metrics/* | 1–3 |
| **Tracing Service** | tracing/mvp_lite | 3 |
| **Snapshot Service** | snapshot/* + ws | 1 |
| **Report Service** | reports/* | 3 |
| **Network Analysis Service** | algorithms bridges/betweenness | 3+ |
| **Evacuation Service** | evacuation/* | 4 |
| **Hospital Service** | hospital/* | 4 |
| **Land Use Service** | landuse/* | 6 |
| **Utilities Service** | utilities/* | 6 |
| **Emissions Service** | emissions/* | 6 |
| **Import Service** | geospatial/* | 7 |
| **Calibration Service** | calibration/* | 7 |
| **Disaster Service** | events/city_disasters | 8 |
| **Surrogate Service** | ml/* | 9 |
| **Planner Service** | planner/* | 9 |
| **Job Service** | jobs/* + workers | 1–3 |

---

## 16. Feature → Module Ownership Matrix

| Product feature | Backend owner |
|---|---|
| Load template city | Template + Scene + Project services |
| Road editor save | Scene validate + Project persist |
| Synthetic population | population/generator |
| Traffic congestion colours | transport + metrics + snapshot |
| Mode shift to metro | mode_choice + transit |
| Equilibrium gap in UI | transport/equilibrium → run meta |
| Add highway scenario | scenarios/applier |
| Multi-seed CI table | comparison/* |
| Top-3 why metrics changed | tracing/mvp_lite |
| HTML report | reports/* |
| Bridge removal demo | algorithms/bridges + Network Analysis |
| Campus fire drill | evacuation/* |
| Hospital surge | hospital/* |
| Year migration | landuse/year_loop |
| OSM import | geospatial/osm_to_scene |
| Flood closes bridge | events/city_disasters |
| AI suggests road | planner + verify via Simulation Service |

---

## 17. Request and Simulation Lifecycles

### 17.1 Create project from template

```text
Client → Project Service
       → Template Service (load JSON)
       → Scene Service (validate schema_version)
       → Persist project + scene
       → Return project id
```

### 17.2 Run baseline (multi-seed)

```text
Client → Runs API (scenario=baseline, seeds=[0..9])
       → Job Service enqueues 10 replication jobs
       → Each worker:
            load scene → World
            core.runner(seed)
            write Parquet + meta
            publish progress
       → Client WS subscribes per run or batch parent
       → Client fetches metrics when completed
```

### 17.3 Scenario compare

```text
Client → create Scenario (diff)
       → enqueue baseline runs (if missing)
       → enqueue scenario runs (same seeds)
       → Comparison Service pairs by seed
       → statistics + MVP-lite mechanisms
       → persist Comparison (badge + assumptions)
       → optional Report Service HTML
```

### 17.4 Evacuation (standalone)

```text
Client → Evacuation API + campus scene
       → worker calls evacuation.runner
       → KPIs: clearance, trapped, bottlenecks
```

---

## 18. Data Contracts the Backend Owns

| Contract | Producer | Consumers |
|---|---|---|
| Scene JSON `schema_version` | Templates, editor, OSM converter | Core loader, validator |
| Scenario diff JSON | Frontend / presets | Scenario applier |
| Run metadata JSON | Worker | API, reports, golden tests |
| Snapshot frame | Snapshot builder | WebSocket clients |
| KPI vector schema | Metrics | Comparison, charts, reports |
| Comparison payload | Comparison service | UI dashboard, reports |
| Calibration status enum | Scene + calibration service | UI badge everywhere |
| Error envelope | API middleware | Frontend |

Any change to these contracts requires a version bump and fixture updates.

---

## 19. Build Order by Phase

### Phase 0 — Foundations

1. Packaging (`pyproject.toml`, importable `evocity_core`)
2. Settings + folder skeleton
3. Schema validators (scene minimal)
4. Algorithms: graph, heap, union_find, bfs (start of DSA)
5. Hand templates (Nexus City + one more)
6. SQLite bootstrap + Project repository
7. Health + Projects + Templates API
8. Unit tests for schema + first algorithms

### Phase 1 — Simulation core + view feed

1. Clock, world, RNG, config
2. Network builder from scene
3. Population + person agents + daily plans
4. Runner loop (even with naive routing)
5. Snapshot builder + Runs API + progress bus + worker pool
6. Metrics skeleton
7. Golden seed test harness

### Phase 2 — Traffic and transport

1. Dijkstra, A*, BPR
2. Assignment + congestion
3. Equilibrium (MSA) + gap in meta
4. Mode choice logit + basic transit
5. Link metrics in snapshots
6. Algorithm unit tests + transport tests

### Phase 3 — Scenarios, comparison, MVP gate

1. Scenario ops + applier + validator
2. Batch multi-seed jobs
3. Comparison statistics + labels
4. Tracing MVP-lite
5. HTML reports
6. Bridges / betweenness demo endpoints
7. Integration tests for full compare pipeline

### Phase 4 — Evacuation and hospital

1. Grid graph, CA fire/smoke, crowd, stress
2. Evacuation runner + KPIs + API
3. Hospital DES + triage + API
4. Keep modules callable standalone

### Phase 5 — (Mostly frontend 3D polish)

Backend: richer snapshot fields if needed (heights already in scene); no new sim physics required.

### Phase 6 — Land use, utilities, emissions

1. Year loop service
2. Utility demand
3. Traffic CO2
4. Wire KPIs into comparison

### Phase 7 — Real data and calibration

1. OSM → scene converter
2. GTFS import
3. Attribution fields
4. Calibration error report
5. Schema fixtures from real imports

### Phase 8 — City disasters

1. Event ops for flood/closure/outage
2. Reachability / isolation metrics
3. Reuse events engine — do not fork fire model

### Phase 9 — ML and planner

1. Dataset from runs
2. Surrogate train/infer
3. Planner candidates + **mandatory** full-sim verify

### Phase 10 — Polish

1. Docker worker/api split hardening
2. Optional Postgres
3. Optional auth
4. Preset flagship demo endpoint pack

---

## 20. MVP Backend Checklist

Backend may claim MVP-ready when all are true:

- [ ] `evocity_core` installs and imports cleanly
- [ ] Nexus City template validates and loads
- [ ] Single-seed run writes meta + KPIs
- [ ] Multi-seed (10) jobs complete via pool
- [ ] Same seed golden test passes single-thread
- [ ] Scenario `add_link` / `set_lanes` applies
- [ ] Comparison returns CI + distinguishable labels
- [ ] Calibration badge always present
- [ ] WebSocket snapshot stream works at capped Hz
- [ ] HTML report generates for a comparison
- [ ] At least three DSA modules tested and demo-callable (pathfinding, BPR/MSA, bridges or heap/DES)

---

## 21. What Must Never Depend on What

```text
core/          ✗ must not import api/, jobs/, persistence/
algorithms/    ✗ must not import transport/ or api/
api/           ✓ may import services, persistence, jobs
workers/       ✓ may import core, persistence, jobs
scenarios/     ✓ may import core schema + network
comparison/    ✓ may import metrics helpers; not api
ml/ / planner/ ✓ may call core.runner; must not mutate agent brains via LLM
```

Dependency direction: **inward toward core**, never outward from core.

---

## 22. Open Backend Decisions

| Decision | Options | Default leaning |
|---|---|---|
| Package layout | Flat `core` vs `src/evocity_core` | Flat `backend/core` packaged as `evocity_core` |
| Job host | In-API process pool vs separate worker container | In-API pool for local MVP; Compose `worker` for prod-like |
| Progress bus | In-memory vs Redis pubsub | In-memory MVP |
| Result format | Parquet only vs Parquet + DuckDB views | Parquet + DuckDB read |
| Scenario apply | Mutate scene JSON vs mutate World only | Apply to scene JSON then rebuild World (auditable) |
| Hospital/evac process | Same worker type vs specialised | Same worker with `job_type` field |
| Stats library | Pure NumPy vs SciPy.stats | SciPy OK for CI helpers |

Resolve in Phase 0–1 and record here when decided.

---

## Appendix — One-Page Mental Map

| If you are building… | Start in… |
|---|---|
| A new algorithm | `core/algorithms/` + `tests/unit/algorithms/` |
| Agent behaviour | `core/agents/` + `activity/` |
| Congestion / equilibrium | `core/transport/` |
| Fire drill | `core/evacuation/` |
| ER surge | `core/hospital/` |
| “Add a road” feature | `scenarios/` then comparison |
| API endpoint | `api/routes/` + `api/schemas/` |
| Background sim | `jobs/` + `workers/` |
| Saving results | `persistence/` |
| Demo city | `data/templates/` |
| OSM | `geospatial/` |
| Report PDF/HTML | `reports/` |
| Surrogate / AI | `ml/` + `planner/` (verify with core) |

---

*Companion to the main Build Plan v3. Update this file when backend module boundaries change; keep it code-free.*
