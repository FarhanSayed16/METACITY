# METACITY — Master Execution Plan & Checklist

> **Single source for project execution.** Plan details and checkboxes live in this one file.  
> Tick `[x]` only when verified. Do not start the next MP until the current phase **EXIT** box is checked.

| Field | Value |
|---|---|
| Project | METACITY |
| Document | **Master Execution Plan & Checklist v2.0** |
| Date | 19 September 2026 |
| Total phases | **30** (MP-01 … MP-30) |
| Hard MVP gate | **End of MP-22** |
| How to mark | `[x]` done · `[ ]` not done |
| Consolidates | Build Plan v3 · Backend v1.1 · Frontend v1.1 · Enhancements · Glossary · Architecture |

---

## Contents

1. [How to Use This File](#1-how-to-use-this-file)
2. [Document Map](#2-document-map)
3. [Progress Log](#3-progress-log)
4. [Tracks Overview](#4-tracks-overview)
5. [Master Phases MP-01 … MP-30 (Plan + Checklist)](#5-master-phases-mp-01--mp-30-plan--checklist)
6. [MVP Flagship Demo Checklist](#6-mvp-flagship-demo-checklist)
7. [Global Never-Skip Checks](#7-global-never-skip-checks)
8. [Effort Guidance](#8-effort-guidance)
9. [Definition of Done](#9-definition-of-done)
10. [Quick Index](#10-quick-index)

---

## 1. How to Use This File

1. Find the current **MP-xx** in §5.  
2. Read **Goal** and the sub-phase table.  
3. Build each sub-phase; tick its checkbox when done.  
4. Verify **Exit criteria**; tick the **EXIT** box.  
5. Update the **Progress Log** (§3).  
6. Only then move to the next MP.  

**Two people?** Split backend/frontend within a phase — still no advance until EXIT is green.

---

## 2. Document Map

| Need | Document |
|---|---|
| Vision / claims / product acceptance | `METACITY_DSA_Build_Plan_v3.md` |
| API / modules / jobs | `METACITY_Backend_Implementation_Plan.md` |
| UI / pages / design | `METACITY_Frontend_Implementation_Plan.md` |
| Adopted enhancements index | `METACITY_Enhancements.md` |
| Terms | `GLOSSARY.md` |
| Diagrams | `architecture/*.puml` |
| **What to build next + tick off** | **This file only** |

Conflict: *order of work* → this file · *API shape* → Backend · *UI* → Frontend · *product acceptance* → Build Plan v3.

---

## 3. Progress Log

> Reconciled 20 Sep 2026 against `METACITY_Full_System_Audit_MP01_MP30.md` after Waves A–D.  
> `[x]` = EXIT-complete. Unchecked = engineered but gaps remain (do not treat as shipped).

| MP | Status | Date done | Notes |
|---|---|---|---|
| MP-01 | [x] | 2026-09 | Foundations complete |
| MP-02 | [ ] | | Design system partial (Assumptions route / Storybook optional) |
| MP-03 | [ ] | | Package = `metacity-core` / import `core` (docs aligned Wave D); health extras optional |
| MP-04 | [x] | 2026-09 | Scene + templates |
| MP-05 | [x] | 2026-09 | DSA suite |
| MP-06 | [ ] | | Projects API thin load_template convenience |
| MP-07 | [ ] | | OpenAPI types committed (Wave D); Assumptions page still gap |
| MP-08 | [ ] | | `profile_id` persist + worker apply (Wave D); presets OK |
| MP-09 | [x] | 2026-09 | Clock/world |
| MP-10 | [ ] | | Validation depth soft vs plan wording |
| MP-11 | [x] | 2026-09 | Population/plans (+ AM/PM sampling Wave D) |
| MP-12 | [x] | 2026-09 | Runner/golden |
| MP-13 | [ ] | | Prod compose worker added (Wave A); polish left |
| MP-14 | [ ] | | WS limits + soak (Wave B); snapshot delta optional |
| MP-15 | [ ] | | 2D ortho network (Wave A); presentation polish left |
| MP-16 | [ ] | | BPR/routing modules underused by runner |
| MP-17 | [ ] | | `final_gap` in UI (Wave B); deeper gap UX left |
| MP-18 | [ ] | | Demand peaks generated + flow export honesty (Wave D); no particle trails |
| MP-19 | [ ] | | History/restore OK; editor UX polish left |
| MP-20 | [ ] | | Ghost preview (Wave A); further scenario UX left |
| MP-21 | [ ] | | Compare core strong; flagship reliability |
| MP-22 | [ ] | | **← MVP GATE** — demos/screenshots landed; tag when committed |
| MP-23 | [ ] | | Evac engine+UI; KPI/host fixes Wave C |
| MP-24 | [ ] | | Hospital works; not true DES event queue |
| MP-25 | [ ] | | 3D presentation; many stubs reduced Wave C |
| MP-26 | [ ] | | Year/sensitivity/warm-start APIs Wave C; UI thin |
| MP-27 | [ ] | | OSM schema fixed Wave A; GTFS/fixture polish left |
| MP-28 | [ ] | | Calibration evaluate + fit helpers Wave C |
| MP-29 | [ ] | | Flood/outage + isolation KPIs Waves A/C |
| MP-30 | [ ] | | Verifier+planner UI Waves A/C; Docker worker Wave A |

---

## 4. Tracks Overview

| Track | Phases | Goal |
|---|---|---|
| **A · Foundations** | MP-01 … MP-05 | Repo, schema, DSA, design system |
| **B · Platform skeleton** | MP-06 … MP-08 | Projects API + project UI |
| **C · Simulation core** | MP-09 … MP-12 | World runs offline |
| **D · Live platform** | MP-13 … MP-15 | Jobs + WS + live map |
| **E · Traffic realism** | MP-16 … MP-18 | BPR, MSA, modes, peaks, flow viz |
| **F · Evidence MVP** | MP-19 … MP-22 | Edit → scenario → compare → report → **MVP** |
| **G · Extended** | MP-23 … MP-26 | Evac, hospital, 3D polish, land use |
| **H · Credibility & product** | MP-27 … MP-30 | OSM, calibration, disasters, ML/Docker |

```text
A → B → C → D → E → F  =  MVP (demo & stop)
         ↘ G → H       =  Extended / product
```

---

## 5. Master Phases MP-01 … MP-30 (Plan + Checklist)

---

### MP-01 — Repository, DX, and Governance

**Goal:** Anyone can clone, install, and run empty smoke checks.  
**Refs:** Backend §23 · Enhancements DX · Architecture README

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-01.1 | Monorepo layout | `backend/`, `frontend/`, `docs/`, `architecture/`, root README |
| [x] | MP-01.2 | Tooling | Makefile/justfile: setup, dev, test, lint, docker stubs |
| [x] | MP-01.3 | Editor config | `.editorconfig` + ignore files |
| [x] | MP-01.4 | CONTRIBUTING | Setup, how to add algorithm/API/UI tool, PR checklist |
| [x] | MP-01.5 | ADRs | `docs/decisions/` — Python BE, Level-1 traffic, R3F-first, SQLite, no-auth |
| [x] | MP-01.6 | CI skeleton | GitHub Actions: pytest discover + frontend build placeholder |
| [x] | MP-01.7 | Compose stub | `docker-compose.dev.yml` (api/worker/frontend) |

**Exit:** Root README works; CI green on smoke; CONTRIBUTING + ≥3 ADRs exist.  
- [x] **MP-01 EXIT PASSED**

---

### MP-02 — Design System and Application Shell (Frontend)

**Goal:** Civic Steel UI shell with routing and empty pages.  
**Refs:** Frontend §3–7, §11–12

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-02.1 | Vite + React + TS | App boots at localhost |
| [x] | MP-02.2 | Theme tokens | Civic Steel colours, type, spacing, motion |
| [x] | MP-02.3 | UI primitives | Button, Input, Badge, CalibrationBadge stub, Table, Modal, Toast, Skeleton |
| [x] | MP-02.4 | App shell | TopBar, ProjectNav stub, StatusBar, layouts |
| [x] | MP-02.5 | Router | Welcome, Projects, Settings, Assumptions, 404 |
| [x] | MP-02.6 | Icons + fonts | Lucide; Manrope/Plus Jakarta + mono for KPIs |
| [x] | MP-02.7 | Storybook stub | Optional: Button + Badge stories |

**Exit:** Welcome + Projects empty states render; tokens used (no random colours).  
- [ ] **MP-02 EXIT PASSED**

---

### MP-03 — Backend Package, Settings, Logging, Health

**Goal:** Installable `metacity-core` (import as `core`) + FastAPI health with dependency status.  
**Refs:** Backend §4, §9, §14

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-03.1 | Packaging | `pip install -e .` imports `core` (distro name `metacity-core`) |
| [x] | MP-03.2 | Version + config | `model_version`, default sim config |
| [x] | MP-03.3 | Structured logging | JSON: `ts`, `level`, `event`, `run_id` |
| [x] | MP-03.4 | FastAPI shell | main, settings, CORS, error envelope |
| [x] | MP-03.5 | Health route | API, SQLite, data dir, versions, worker stub |
| [x] | MP-03.6 | .env.example | Ports, data path, workers, snapshot Hz |

**Exit:** `GET /health` structured OK; logs are JSON.  
- [ ] **MP-03 EXIT PASSED**

---

### MP-04 — Scene Contract, JSON Schema, Templates

**Goal:** Single scene contract + ≥2 loadable templates.  
**Refs:** Build Plan §14 · Backend §5.2

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-04.1 | schema_version 1.0 | nodes, links, zones, facilities, parameters, calibration_status |
| [x] | MP-04.2 | Python validators | scene (+ building/hospital stubs) |
| [x] | MP-04.3 | Formal JSON Schema | `data/schemas/scene_schema.json` |
| [x] | MP-04.4 | Nexus City template | Hand-crafted baseline road city |
| [x] | MP-04.5 | Campus or Hospital | Second template |
| [x] | MP-04.6 | Fixture suite | CI golden fixtures |
| [x] | MP-04.7 | migrate stub | Chain-ready migrations |

**Exit:** Both templates validate; CI schema green.  
- [x] **MP-04 EXIT PASSED**

---

### MP-05 — DSA Algorithm Foundation

**Goal:** Core algorithms implemented and unit-tested (academic spine).  
**Refs:** Build Plan §16 · Backend §5.3

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-05.1 | Graph + Union-Find | Adjacency list; connectivity |
| [x] | MP-05.2 | Heap | Binary min-heap + tests |
| [x] | MP-05.3 | BFS + components | Reachability |
| [x] | MP-05.4 | Dijkstra + A* | Shortest path + tests |
| [x] | MP-05.5 | Hypothesis start | Property tests for path optimality |
| [x] | MP-05.6 | Demo hooks | CLI/notebook stubs |

**Exit:** Unit tests green for graph, heap, BFS, Dijkstra, A*.  
- [x] **MP-05 EXIT PASSED**

---

### MP-06 — Persistence and Project API

**Goal:** Create/list/get projects; attach scenes; SQLite + paths.  
**Refs:** Backend §7, §9.2

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-06.1 | SQLite bootstrap | Project table (+ stubs for later entities) |
| [x] | MP-06.2 | Repositories | Project CRUD |
| [x] | MP-06.3 | Paths helper | Canonical `data/` layout |
| [x] | MP-06.4 | Projects routes | POST/GET; load_template |
| [x] | MP-06.5 | Scenes routes | GET + validate |
| [x] | MP-06.6 | Templates routes | List templates |

**Exit:** API creates project from Nexus City; returns scene JSON.  
- [ ] **MP-06 EXIT PASSED**

---

### MP-07 — Frontend Project Experience

**Goal:** User creates and opens a project from UI.  
**Refs:** Frontend P0–P3 · §13.4 · §26

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-07.1 | API client | REST + errors |
| [x] | MP-07.2 | OpenAPI → TS | Typegen pipeline wired |
| [x] | MP-07.3 | Project Dashboard | List, empty state |
| [x] | MP-07.4 | New Project Wizard | Name → template → create |
| [x] | MP-07.5 | Project Overview | Summary + Open Workspace CTA |
| [x] | MP-07.6 | API-down page | Full-page retry |

**Exit:** Welcome → New Project (template) → Overview works.  
- [ ] **MP-07 EXIT PASSED**

---

### MP-08 — Presets, Profiles, and Asset Discovery

**Goal:** Discoverable presets and config profiles.  
**Refs:** Backend profiles/presets · Frontend wizard

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-08.1 | Config profiles | `default`, `fast_demo`, `presentation`, `academic` |
| [x] | MP-08.2 | Profiles API | List/get |
| [x] | MP-08.3 | Bypass preset | Highway Bypass scenario definition |
| [x] | MP-08.4 | Presets API | `GET /presets` |
| [x] | MP-08.5 | Wizard profile pick | UI selects profile at create |

**Exit:** UI lists templates + profiles + presets from API.  
- [ ] **MP-08 EXIT PASSED**

---

### MP-09 — Core Foundation: Clock, World, RNG

**Goal:** Pure core holds a world and advances time deterministically.  
**Refs:** Backend §5.1 · Build Plan §10.1

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-09.1 | Clock | 1-min tick (5-min configurable) |
| [x] | MP-09.2 | RNG | Seeded PRNG; single-thread golden rule documented |
| [x] | MP-09.3 | World container | Network/agents placeholders |
| [x] | MP-09.4 | Scene → world | Loader from validated JSON |
| [x] | MP-09.5 | CLI/notebook smoke | Advance N ticks without API |

**Exit:** Same seed → identical clock advance in two CLI runs.  
- [x] **MP-09 EXIT PASSED**

---

### MP-10 — Network Model and Validation

**Goal:** Road graph from scene; connectivity checks.  
**Refs:** Backend §5.4

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-10.1 | Network model | Nodes, links, attributes |
| [x] | MP-10.2 | Graph build | Scene → DSA graph |
| [x] | MP-10.3 | Cost helpers | Free-flow time from speed/length |
| [x] | MP-10.4 | Validation | Dangling nodes, capacity, Union-Find |
| [x] | MP-10.5 | Network tools API | Connectivity check endpoint |

**Exit:** Nexus City connected; broken fixture fails validation.  
- [ ] **MP-10 EXIT PASSED**

---

### MP-11 — Population, Agents, Activity Plans

**Goal:** Synthetic people with diverse daily plans on the network.  
**Refs:** Backend §5.5 · Build Plan plan diversity

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-11.1 | Households / persons | Generator from zones/facilities |
| [x] | MP-11.2 | Vehicles | Car availability binding |
| [x] | MP-11.3 | Plan templates (≥5) | Worker, student, retired, shift, caregiver |
| [x] | MP-11.4 | Activity scheduler | Advance by clock |
| [x] | MP-11.5 | Scale sanity | ≥200 agents on Nexus City |

**Exit:** 200+ agents with typed plans load into world.  
- [x] **MP-11 EXIT PASSED**

---

### MP-12 — Replication Runner and Golden Tests

**Goal:** One full sim-day replication writes a Result artefact.  
**Refs:** Backend runner · reproducibility

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-12.1 | runner.py | `run_replication(config, seed) → Result` |
| [x] | MP-12.2 | Naive routing | Dijkstra free-flow (upgrade MP-16) |
| [x] | MP-12.3 | Metrics skeleton | Travel-time stub KPIs |
| [x] | MP-12.4 | Results writer | Parquet/JSON under `data/runs/{id}/` |
| [x] | MP-12.5 | Golden harness | Single-thread KPI/hash lockfile |
| [x] | MP-12.6 | meta.json | versions, params, seed, calibration_status |

**Exit:** CLI writes artefacts; golden test passes twice.  
- [x] **MP-12 EXIT PASSED**

---

### MP-13 — Job Manager and Workers

**Goal:** Multi-seed jobs via API; states tracked; orphans recovered.  
**Refs:** Backend §8 · runs API

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-13.1 | Run persistence | Statuses include `interrupted` |
| [x] | MP-13.2 | Job manager | Queue + process pool |
| [x] | MP-13.3 | Replication worker | Calls core; writes results |
| [x] | MP-13.4 | Progress bus | In-memory pub/sub |
| [x] | MP-13.5 | Runs API | Enqueue, status, metrics, retry |
| [x] | MP-13.6 | Orphan scan | On boot: `running` → `interrupted` |

**Exit:** 10-seed batch completes; retry works on interrupted.  
- [ ] **MP-13 EXIT PASSED**

---

### MP-14 — WebSocket Snapshots

**Goal:** Live stream of progress and link metrics.  
**Refs:** Build Plan §15.2 · Frontend WS rules

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-14.1 | Snapshot builder | `t`, link_metrics, agents_sample |
| [x] | MP-14.2 | Rate limit | Cap 2–10 Hz |
| [x] | MP-14.3 | WS endpoint | `/runs/{id}/stream` |
| [x] | MP-14.4 | Sampling | Never full population dump |
| [x] | MP-14.5 | Load smoke | Multi-client short soak |

**Exit:** Client gets snapshots without stalling worker.  
- [ ] **MP-14 EXIT PASSED**

---

### MP-15 — Live Workspace Map (2D + Basic 3D)

**Goal:** Map shows network + live congestion; camera toggle.  
**Refs:** Frontend §9, §14

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-15.1 | Workspace layout | Rails, inspector, layers, sim strip |
| [x] | MP-15.2 | R3F scene | Ground, roads, building extrusions |
| [x] | MP-15.3 | WS consumer | simStore; prefer latest frame |
| [x] | MP-15.4 | Congestion colours | V/C + legend when layer on |
| [x] | MP-15.5 | 2D / 3D toggle | Ortho ↔ perspective |
| [x] | MP-15.6 | Selection | Click link → inspector |
| [x] | MP-15.7 | Sim strip | Play/pause/speed vs active run |

**Exit:** Live/replay at ≥2 Hz; basic 3D works.  
- [ ] **MP-15 EXIT PASSED**

---

### MP-16: Routing and BPR Congestion
**Status:** DONE
**Goal:** Implement the BPR function for travel time and integrate it into the routing logic (A*).
**Refs:** Build Plan §10.4–10.5 · Backend transport

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-16.1 | BPR module | α=0.15, β=4 defaults |
| [x] | MP-16.2 | Assignment | Volumes on links |
| [x] | MP-16.3 | Congestion update | Travel times from BPR |
| [x] | MP-16.4 | Congested routing | Dijkstra/A* on current costs |
| [x] | MP-16.5 | Property tests | A* ≡ Dijkstra; BPR checks |
| [x] | MP-16.6 | UI V/C | Snapshot colours match backend |

**Exit:** Congested corridor TT &gt; free-flow; tests green.  
- [ ] **MP-16 EXIT PASSED**

---

### MP-17: Equilibrium (MSA) and Gap Metadata
**Status:** DONE
**Goal:** Day-to-day learning converges; gap recorded.  
**Refs:** Build Plan §10.6

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-17.1 | MSA loop | Documented method |
| [x] | MP-17.2 | Stop rules | ε or max iterations |
| [x] | MP-17.3 | equilibrium meta | method, final_gap, iterations |
| [x] | MP-17.4 | UI shows gap | Run Detail / status |
| [x] | MP-17.5 | Toy test | Gap decreases |

**Exit:** Runs expose `final_gap`; toy network converges.  
- [ ] **MP-17 EXIT PASSED**

---

### MP-18: Mode Choice, Transit, Demand Profiles, Flow Animation
**Status:** DONE
**Goal:** Believable peaks and mode shift; honest Level-1 viz.  
**Refs:** Enhancements 5.3–5.4 · Frontend §14.3

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-18.1 | Multinomial logit | Time/cost/wait utilities |
| [x] | MP-18.2 | Transit basic | Lines, stops, headway, ridership |
| [x] | MP-18.3 | Demand profiles | AM/PM/midday/evening shares |
| [x] | MP-18.4 | Plan templates wired | By person type |
| [x] | MP-18.5 | Flow export | Volume + direction for UI |
| [x] | MP-18.6 | Flow animation | Particles/ribbons (not fake microsim) |
| [x] | MP-18.7 | NumPy agents | Optional if 1k+ slow |

**Exit:** Distinct AM/PM peaks; transit share &gt; 0 when transit exists; flow anim on.  
- [ ] **MP-18 EXIT PASSED**

---

### MP-19: Road Editor and Scene History
**Status:** DONE
**Goal:** Edit roads in 2D; save; undo via history.  
**Refs:** Frontend §9.3 · Backend scene_history

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-19.1 | Edit tools | Select, add node/link, delete (confirm) |
| [x] | MP-19.2 | Inspector | Lanes, speed_kph, capacity, road_class |
| [x] | MP-19.3 | Validate on save | Connectivity + schema |
| [x] | MP-19.4 | Scene history | Last 10 versions |
| [x] | MP-19.5 | Undo UX | Ctrl+Z / restore |
| [x] | MP-19.6 | Unsaved guard | Block navigate if dirty |

**Exit:** Add link → save → reload persists; undo restores.  
- [ ] **MP-19 EXIT PASSED**

---

### MP-20: Scenario Engine and Presets UX
**Status:** DONE
**Goal:** Author diffs; validate; run scenario; use bypass preset.  
**Refs:** Build Plan §14.3 · Backend scenarios · Frontend P5–P6

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-20.1 | Ops catalogue | add_link, set_lanes, add_facility, close_link, … |
| [x] | MP-20.2 | Applier + validator | Semantic checks |
| [x] | MP-20.3 | Scenarios API | CRUD + validate |
| [x] | MP-20.4 | Scenario Library UI | Empty state: **Try Bypass preset** |
| [x] | MP-20.5 | Scenario Builder | Ordered changes + ghost preview |
| [x] | MP-20.6 | Scenario runs | Same seeds as baseline |

**Exit:** Bypass preset valid; seeds 0–9 complete.  
- [ ] **MP-20 EXIT PASSED**

---

### MP-21 — Comparison, Mechanism Trace, Trust UI

**Goal:** Evidence screen with CI labels and calibration honesty.  
**Refs:** Build Plan §17 · Frontend P9–P10 · Claims policy

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [ ] | MP-21.1 | Pairing by seed | Baseline vs scenario (2-arm) |
| [ ] | MP-21.2 | Statistics | Mean Δ, 95% CI, labels |
| [ ] | MP-21.3 | Mechanism MVP-lite | Top-3 drivers |
| [ ] | MP-21.4 | Comparison API | Payload includes badge |
| [ ] | MP-21.5 | Compare UI | Hub + Result table + Recharts |
| [ ] | MP-21.6 | Trust surfaces | CalibrationBadge + Assumptions drawer |
| [ ] | MP-21.7 | Rate limiting | Basic REST/WS limits |

**Exit:** Flagship comparison shows CI + badge + top-3 mechanisms.  
- [ ] **MP-21 EXIT PASSED**

---

### MP-22 — Reports, UX Polish, MVP Gate

**Goal:** Ship MVP demo pack; freeze MVP scope.  
**Refs:** Build Plan §21.1, §23 · Frontend §25–26

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [ ] | MP-22.1 | HTML report | Assumptions, seeds, KPIs, badge, disclaimer |
| [ ] | MP-22.2 | Screenshot capture | Toolbar → store → report slots |
| [ ] | MP-22.3 | Keyboard shortcuts | Space, Esc, 1–4, L, I, Ctrl+S/Z, 2/3, ? |
| [ ] | MP-22.4 | First-run onboarding | 4-step overlay; localStorage |
| [ ] | MP-22.5 | API-down banner | Mid-session; disable mutations |
| [ ] | MP-22.6 | DSA showcase | ≥3 demos (pathfinding, BPR/MSA, bridges/heap) |
| [ ] | MP-22.7 | Critical infra hooks | Bridges/betweenness endpoints |
| [ ] | MP-22.8 | MVP acceptance audit | v3 Phase 0–3 + §6 flagship script below |
| [ ] | MP-22.9 | Tag release | `mvp-1.0` + README demo steps |

**Exit:** Flagship demo &lt;15 min for a new user; all MVP boxes green.  
- [ ] **MP-22 EXIT PASSED — MVP GATE**

> **STOP here for MVP.** Continue MP-23+ only after a deliberate decision.

---

### MP-23 — Fire Evacuation Module

**Goal:** Campus fire drill simulation + UI.  
**Refs:** Build Plan §10.9 · Backend evacuation · Frontend P12

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-23.1 | Grid + graph | Building floor cells |
| [x] | MP-23.2 | Fire/smoke CA | Parameterised; uncalibrated labelled |
| [x] | MP-23.3 | Crowd + stress | Panic/herding |
| [x] | MP-23.4 | Evac runner + KPIs | Clearance, trapped, bottlenecks |
| [x] | MP-23.5 | Evac API / job type | Standalone OK |
| [x] | MP-23.6 | Evacuation Workspace UI | Floor, place fire, play, KPIs |
| [x] | MP-23.7 | Sensitive copy | “Simulated model outcomes” |

**Exit:** Campus fire run + UI playback works.  
- [ ] **MP-23 EXIT PASSED**

---

### MP-24 — Hospital Module and Module Registry

**Goal:** Hospital DES + dynamic module discovery.  
**Refs:** Build Plan §10.10 · Backend hospital · registry

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-24.1 | Resources + triage + flow | Beds, staff, severity |
| [x] | MP-24.2 | DES scheduler | Event queue |
| [x] | MP-24.3 | Hospital runner + KPIs | Wait, utilisation, throughput |
| [x] | MP-24.4 | Hospital API + UI | Surge compare (+beds) |
| [x] | MP-24.5 | Module registry | `GET /modules` |
| [x] | MP-24.6 | Dynamic nav | FE shows modules from API |

**Exit:** Surge changes wait time; nav reflects modules.  
- [ ] **MP-24 EXIT PASSED**

---

### MP-25 — 3D Polish and Presentation Features

**Goal:** Stakeholder-ready visualisation extras.  
**Refs:** Frontend §14.6–14.8 · §27

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-25.1 | Walkthrough / orbit | Documented controls |
| [x] | MP-25.2 | LOD + instancing | Meet fps targets |
| [x] | MP-25.3 | Day/night | Visual only |
| [x] | MP-25.4 | Split wipe | Baseline vs scenario map |
| [x] | MP-25.5 | Mini-map | Extent + viewport |
| [x] | MP-25.6 | URL deep links | `?mode=&layers=&view=` |
| [x] | MP-25.7 | Demo mode | Guided fullscreen walkthrough |
| [x] | MP-25.8 | Embed comparison HTML | Optional export |
| [x] | MP-25.9 | Drag-drop scene import | On Projects page |

**Exit:** Demo mode tells flagship story alone.  
- [ ] **MP-25 EXIT PASSED**

---

### MP-26 — Land Use, Utilities, Emissions, Analysis Tools

**Goal:** Year loop + resource/environment KPIs + analysis helpers.  
**Refs:** Build Plan Phase 6 · Backend landuse · Enhancements 5.1–5.2

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-26.1 | Year loop | Accessibility → housing shift (simplified) |
| [x] | MP-26.2 | Utilities | Electricity/water by zone |
| [x] | MP-26.3 | Traffic CO2 | Emissions KPI |
| [x] | MP-26.4 | Wire to comparison | New KPI rows |
| [x] | MP-26.5 | Warm-start | Faster re-eq + golden vs cold |
| [x] | MP-26.6 | Sensitivity sweeper | One-at-a-time curves |
| [x] | MP-26.7 | Accessibility heatmap | FE layer + legend |
| [x] | MP-26.8 | Project ZIP archive | Export/import |
| [x] | MP-26.9 | GeoJSON export | FeatureCollection |

**Exit:** Year/utilities/CO2 in compare; archive round-trips.  
- [ ] **MP-26 EXIT PASSED**

---

### MP-27 — Real Network Import (OSM + GTFS)

**Goal:** Real area → same `schema_version` scene.  
**Refs:** Build Plan Phase 7 · Backend geospatial · Frontend P14

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-27.1 | CRS helpers | Lon/lat ↔ local metres |
| [x] | MP-27.2 | OSM → scene | OSMnx converter |
| [x] | MP-27.3 | Import CI fixture | Schema validation on real extract |
| [x] | MP-27.4 | Attribution | ODbL strings mandatory |
| [x] | MP-27.5 | GTFS import | Transit when available |
| [x] | MP-27.6 | Import wizard UI | Bbox (MapLibre), progress, validate |
| [x] | MP-27.7 | Basemap banner | Dual renderer path explicit |

**Exit:** Small bbox imports; opens in workspace; attribution visible.  
- [ ] **MP-27 EXIT PASSED**

---

### MP-28 — Calibration and Credibility

**Goal:** First calibrated/partial report with error metrics.  
**Refs:** Build Plan §19 · Backend calibration

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-28.1 | Observed targets | Counts/speeds format |
| [x] | MP-28.2 | Fit helpers | Simple parameter adjustment |
| [x] | MP-28.3 | Error report | MAE/MAPE (or chosen) |
| [x] | MP-28.4 | Status promotion | Careful calibration_status rules |
| [x] | MP-28.5 | Calibration UI | Errors + status |
| [x] | MP-28.6 | Claims review | No overclaim in UI |

**Exit:** One network has numeric calibration report + correct badge.  
- [ ] **MP-28 EXIT PASSED**

---

### MP-29 — City-Scale Disasters

**Goal:** Flood/closure/outage on city graph (not a second fire engine).  
**Refs:** Build Plan Phase 8 · Backend city_disasters

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-29.1 | Event ops | close_link, flood, outage |
| [x] | MP-29.2 | Disaster rules | Apply onto network |
| [x] | MP-29.3 | Isolation KPIs | BFS / components |
| [x] | MP-29.4 | Disaster presets | Bridge flood pack |
| [x] | MP-29.5 | UI triggers | Scenario builder entries |
| [x] | MP-29.6 | Emergency access | Ambulance accessibility metric |

**Exit:** Bridge closure isolates; alternate restores access.  
- [ ] **MP-29 EXIT PASSED**

---

### MP-30 — ML Planner (Optional) and Stakeholder Hardening

**Goal:** Optional intelligence + production packaging.  
**Refs:** Build Plan Phases 9–10 · Backend ml/planner

| Done | ID | Sub-phase | What to make / do |
|:---:|---|---|---|
| [x] | MP-30.1 | Surrogate dataset | From past runs |
| [x] | MP-30.2 | Surrogate train/infer | Fast KPI screen |
| [x] | MP-30.3 | Planner candidates | Greedy/hill-climb |
| [x] | MP-30.4 | Mandatory verify | Top picks full-sim re-run |
| [x] | MP-30.5 | Planner UI | Assistive; LLM out of sim loop |
| [x] | MP-30.6 | Docker production | api, worker, frontend, optional db |
| [x] | MP-30.7 | Snapshot diffs | If bandwidth needed |
| [x] | MP-30.8 | Web Worker snapshots | If FE fps fails |
| [x] | MP-30.9 | Optional auth | Only if multi-user required |
| [x] | MP-30.10 | Backup script | SQLite + data/ rotation |
| [x] | MP-30.11 | API cookbook | curl multi-seed compare |
| [x] | MP-30.12 | Stakeholder pack | Presets, README, architecture exports |

**Exit:** `docker compose up` serves demo; planner verifies with full sim; docs complete.  
- [ ] **MP-30 EXIT PASSED**

---

## 6. MVP Flagship Demo Checklist

Run after **MP-22**. All must pass:

- [x] Load **Nexus City** template  
- [x] Run baseline (multi-seed)  
- [x] Apply **Eastern Highway Bypass** preset  
- [x] Comparison table with **95% CI** + **calibration badge**  
- [x] **2D + basic 3D** + Level-1 **flow animation**  
- [x] Run **≥3 DSA demos**  
- [x] Open **HTML report** with assumptions / disclaimer  

If any fail → MVP is **not** done.  
- [ ] **FLAGSHIP DEMO PASSED** (demos landed Wave B; tag mvp-1.0 when committed)

---

## 7. Global Never-Skip Checks

Re-verify at MVP (MP-22) and at project end (MP-30):

- [ ] Calibration badge on every comparison/report  
- [ ] Claims language follows policy (no “guarantees / predicts” without status)  
- [ ] Golden seed reproducibility (single-thread)  
- [ ] `core` (package `metacity-core`) has no API/DB/WS imports  
- [ ] All scenes carry `schema_version`  
- [ ] Level-1 traffic not presented as microsimulation  
- [ ] LLMs not inside agent decision loop  

---

## 8. Effort Guidance

| Block | Phases | Solo P50 |
|---|---|---|
| A–B Foundations + skeleton | MP-01…08 | ~4–6 weeks |
| C–D Core + live | MP-09…15 | ~6–8 weeks |
| E–F Traffic + MVP | MP-16…22 | ~6–8 weeks |
| **MVP total** | **MP-01…22** | **~16–22 weeks** |
| G Extended | MP-23…26 | ~8–12 weeks |
| H Credibility + product | MP-27…30 | ~12–18 weeks |

Do not skip EXIT boxes to “go faster.”

---

## 9. Definition of Done

An MP is **DONE** only when:

1. Every sub-phase checkbox in that MP is `[x]`  
2. **EXIT PASSED** is `[x]`  
3. Progress Log updated  
4. No known P0 bugs in that phase’s scope  
5. User-facing docs/README updated if behaviour changed  

---

## 10. Quick Index

| Need | Start at |
|---|---|
| Empty repo → health | MP-01…03 |
| Templates | MP-04 |
| DSA / viva algorithms | MP-05 (+ 16–17, 22) |
| First API project | MP-06…08 |
| First offline sim day | MP-09…12 |
| Live map | MP-13…15 |
| Real congestion | MP-16…18 |
| Edit + compare evidence | MP-19…22 |
| Campus fire / hospital | MP-23…24 |
| Stakeholder 3D | MP-25 |
| Year / utilities | MP-26 |
| Real city data | MP-27…28 |
| Flood / bridge | MP-29 |
| Optional AI + Docker | MP-30 |

---

*METACITY Master Execution Plan & Checklist v2.0 — follow this file only for day-to-day execution.*
