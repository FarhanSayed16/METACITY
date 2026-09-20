# METACITY — Full System Audit (MP-01 … MP-30)

> **Purpose:** One comprehensive fix list so the system can be closed as complete before UI polish / next enhancement work.  
> **Date:** 20 September 2026  
> **Scope:** Re-check MP-01…20 (including prior audit fixes) + full audit MP-21…30  
> **Tests:** `pytest` → **92 passed**, 13 warnings (Waves A–D + Appendix A/B closed)  
> **Verdict:** Substantial product exists, but **the system is not EXIT-complete through Phase 30.** Master Plan Progress Log + EXIT boxes reconciled honestly (Wave D). Appendix A/B closed. Remaining work is Wave E UI polish + MVP tag when committed.

| Field | Value |
|---|---|
| Prior audit | `METACITY_Audit_MP01_MP20_Fixes.md` (many P0s fixed) |
| This document | Supersedes that file as the **current** fix queue |
| Honest status | **~70–80% engineered · ~40–50% EXIT-complete** |
| Safe next focus | Commit working tree; tag `mvp-1.0` when ready |

---

## Contents

1. [Executive verdict](#1-executive-verdict)
2. [Full scorecard MP-01 … MP-30](#2-full-scorecard-mp-01--mp-30)
3. [Prior audit (MP-01…20) — recheck](#3-prior-audit-mp-0120--recheck)
4. [MP-21 … MP-30 detailed gaps](#4-mp-21--mp-30-detailed-gaps)
5. [P0 — Must fix (system not shippable without these)](#5-p0--must-fix-system-not-shippable-without-these)
6. [P1 — Required for honest EXIT](#6-p1--required-for-honest-exit)
7. [P2 — Bugs, polish, risk reduction](#7-p2--bugs-polish-risk-reduction)
8. [Enhancements (after EXIT)](#8-enhancements-after-exit)
9. [UI enhancement candidates (later)](#9-ui-enhancement-candidates-later)
10. [Recommended execution waves](#10-recommended-execution-waves)
11. [Definition of “system complete”](#11-definition-of-system-complete)
12. [What is already solid](#12-what-is-already-solid)

---

## 1. Executive verdict

### What improved since the MP-01…20 audit

Many earlier **P0s are fixed**:

- Frontend `api.ts` no longer gitignored (`!frontend/src/lib/`)
- Workspace loads scene via `/projects/:id/map`
- Core ML dataset moved out of forbidden imports (stub re-export)
- Single scenario applier (`type`/`data`)
- Scene history + restore API
- Real presets JSON (`highway_bypass.json`, etc.) + UI uses API
- `workers/pool.py` exists for dev compose
- `agents_sample` populated; `final_gap` in `meta.json`
- Toast + ApiDown present; Compare UI with mechanisms exists
- Bypass multi-seed integration test added (suite now 61 tests)

### What is still not true (honest leftover — not Appendix A)

- **MVP gate (MP-22)** — demos/screenshots landed; `mvp-1.0` tag still pending commit
- **MP-23–30 EXIT** — Progress Log correctly unchecked; engines exist, polish remains
- **Wave E UI** — workspace/evidence/trust polish not started

Appendix A broken call sites from the original audit are **all fixed** (see Appendix A status table).

**Bottom line:** Do not treat the project as “Phase 30 complete.” Waves A–D + Appendix A/B closed the P0/P1 hygiene queue and residual broken sites; treat remaining work as Wave E UI + MVP tag.

---

## 2. Full scorecard MP-01 … MP-30

| MP | Audit | Severity of remaining gaps |
|---|---|---|
| MP-01 Foundations | **COMPLETE** | Low |
| MP-02 Design system | **PARTIAL** | Assumptions route; Storybook optional |
| MP-03 Backend package/health | **PARTIAL** | Naming aligned (`metacity-core` / `import core`) Wave D |
| MP-04 Scene/templates | **COMPLETE** | Low |
| MP-05 DSA | **COMPLETE** | Low |
| MP-06 Projects API | **PARTIAL** | Thin load_template convenience |
| MP-07 Frontend projects | **PARTIAL** | OpenAPI types + CI (Wave D); Assumptions page gap |
| MP-08 Presets/profiles | **PARTIAL** | `profile_id` persist + worker apply (Wave D) |
| MP-09 Clock/world | **COMPLETE** | Low |
| MP-10 Network validation | **PARTIAL** | Depth soft vs plan wording |
| MP-11 Population/plans | **COMPLETE** | Low |
| MP-12 Runner/golden | **COMPLETE** | Low |
| MP-13 Jobs/workers | **PARTIAL** | Prod compose missing worker |
| MP-14 Snapshots/WS | **PARTIAL** | No multi-client soak; WS rate limit |
| MP-15 Live map | **PARTIAL** | 2D not ortho network |
| MP-16 BPR/routing | **PARTIAL** | Modules underused by runner |
| MP-17 Equilibrium | **PARTIAL** | Gap not shown in UI |
| MP-18 Modes/demand/flow | **PARTIAL** | AM/PM generation + GeoJSON flows (Wave D); dashes ≠ particles |
| MP-19 Editor/history | **PARTIAL** | Restore API OK; UX polish left |
| MP-20 Scenarios | **PARTIAL** | No ghost preview |
| MP-21 Comparison | **PARTIAL** | Strong core; needs flagship reliability + WS limits |
| MP-22 MVP polish/gate | **PARTIAL** | Gate not closed |
| MP-23 Evacuation | **PARTIAL** | Engine+UI real; KPI gaps; hardcoded host |
| MP-24 Hospital | **PARTIAL** | Works; not true DES event queue |
| MP-25 3D presentation | **PARTIAL** | Many stubs / unmounted |
| MP-26 Year/utilities/tools | **PARTIAL** | Libs exist; APIs/UI missing |
| MP-27 OSM/GTFS | **PARTIAL / BROKEN import** | Schema mismatch P0 |
| MP-28 Calibration | **PARTIAL** | Evaluate OK; no fit/tuning |
| MP-29 Disasters | **PARTIAL** | close_link OK; flood/outage broken/missing |
| MP-30 ML + hardening | **PARTIAL** | Verifier broken; no planner UI; Docker incomplete |

**None of MP-02…30 are fully EXIT-complete.** MP-01/04/05/09/11/12 are the only clear COMPLETE set.

---

## 3. Prior audit (MP-01…20) — recheck

| Prior issue | Status now | Notes |
|---|---|---|
| `api.ts` gitignored | **FIXED** | `!frontend/src/lib/` |
| Workspace scene load | **FIXED** | `/projects/:id/map` loads scene |
| Core → persistence import | **FIXED** | Real code in `backend/ml/` |
| Dual scenario appliers | **FIXED** | Thin re-export wrapper |
| Scene restore API | **FIXED** | GET history + POST restore |
| Presets discoverable | **FIXED** | JSON + API + UI |
| `workers.pool` missing | **FIXED** (dev) | Prod compose still no worker |
| Demand profiles wired | **PARTIAL** | Classify only; not generating peaks |
| `agents_sample` empty | **FIXED** | Up to 200 samples |
| `final_gap` in meta | **FIXED** | Written; UI still missing |
| Toast / ApiDown | **FIXED** | Present |
| Assumptions | **PARTIAL** | Drawer on Compare; no `/assumptions` |
| OpenAPI typegen | **PARTIAL** | Script exists; no generated types / CI |
| 2D ortho network | **STILL OPEN** | MapLibre OSM only in 2D |
| Ghost preview | **STILL OPEN** | Not implemented |
| Seeds 0–9 | **FIXED** | Default seeds in overview |
| Centrality NameError | **FIXED** | Brandes import |
| Export FE | **PARTIAL** | BE OK; FE panel stub/unmounted |
| Sweeper | **PARTIAL** | Signature better; ops not in applier |

---

## 4. MP-21 … MP-30 detailed gaps

### MP-21 Comparison — advanced but not EXIT-closed

**Present:** pairing, CI stats, top-3 mechanisms, Compare page, CalibrationBadge, REST rate limit.  
**Missing / weak:**

- WebSocket rate limiting  
- Flagship reliability depends on multi-seed scenario quality  
- `/runs` still “Coming Soon” (hurts audit trail)

### MP-22 MVP gate — not closed

**Present:** HTML reports, onboarding tour, network tools bridges/centrality, DSA page.  
**Missing:**

- Screenshot capture → report slots (download-only today)  
- Shortcuts incomplete (need L, I, Ctrl+S, ?)  
- ApiDown does not disable mutations globally  
- DSA showcase mostly static text (not live runnable demos in UI)  
- No git tag `mvp-1.0`  
- README demo steps incomplete for stranger walkthrough  
- Formal MVP acceptance script not evidenced

### MP-23 Evacuation — engine real, EXIT overstated

**Present:** grid, fire/smoke CA, crowd/stress, UI map, disclaimer.  
**Missing / weak:**

- KPI: trapped count, bottleneck locations  
- Sync API only (not job-typed worker)  
- Hardcoded `http://127.0.0.1:8000` (bypasses shared client)

### MP-24 Hospital — usable, not true DES

**Present:** resources, triage, flow, API, surge UI, `GET /modules`, dynamic nav.  
**Missing / weak:**

- Tick loop ≠ classic DES event queue (plan wording)  
- Hardcoded localhost like evacuation

### MP-25 Presentation — files ≠ product

**Present:** walkthrough controls, minimap, demo overlay, URL mode/theme.  
**Missing / stubs / unmounted:**

- LOD does not change geometry/instancing  
- Split wipe is cosmetic CSS, not dual scenes  
- Heatmap fake radial (not accessibility metrics)  
- EnvironmentSettings / Attribution / ExportPanel / DragDropZone **not mounted**  
- No embeddable comparison HTML  
- Deep links lack `layers` / `view`

### MP-26 Year / utilities / analysis — libraries without product surface

**Present:** multi-year runner, housing rules, utilities/CO2 in runner KPIs, archive API, GeoJSON BE.  
**Missing:**

- No HTTP APIs/UI for year loop or sensitivity sweep  
- Warm-start `initial_costs` never called; no cold-vs-warm golden  
- Compare charts underuse utility/CO2  
- FE GeoJSON export empty stub

### MP-27 OSM/GTFS — **import broken**

**Present:** CRS helpers, Overpass-style converter, GTFS parser, numeric bbox in wizard.  
**Critical:**

- Converter emits `start_node` / `freespeed` / etc.  
- Schema requires `from_node` / `to_node` / `speed_kph` / `length_m`  
- **Import will fail validation**  
**Also missing:** OSMnx path or documented substitute, CI fixture, MapLibre bbox draw, basemap dual-path banner, mounted Attribution

### MP-28 Calibration — evaluate only

**Present:** observed counts, RMSE/GEH, status promotion, CalibrationPanel UI.  
**Missing:** fit/parameter adjustment helpers (tune BPR/demand toward observed)

### MP-29 Disasters — close_link only

**Present:** bridge_failure/flood presets as `close_link`, emergency access helper.  
**Critical / missing:**

- `apply_flood` uses non-schema fields  
- No real `flood` / `outage` ops in catalogue  
- Isolation KPIs not wired into run/compare  
- No dedicated disaster UI beyond generic scenarios

### MP-30 ML + hardening — incomplete / broken verifier

**Present:** surrogate, planner search, backup script, API cookbook, stakeholder guide, ADR no-auth.  
**Critical:**

- `verifier.py` calls `run_replication(scene, seed)` — **wrong signature**  
**Missing:**

- Planner UI page  
- Prod Docker worker service  
- Snapshot diffs / FE Web Worker  
- Stakeholder pack thinner than plan (architecture exports)

---

## 5. P0 — Must fix (system not shippable without these)

| ID | Fix | Why | Phase | Status |
|---|---|---|---|---|
| **P0-1** | Fix OSM converter to Scene schema (`from_node`, `to_node`, `speed_kph`, `capacity_*`, `length_m`) + round-trip test | Real-data path crashes | MP-27 | **DONE** (Wave A) |
| **P0-2** | Fix ML verifier to call `run_replication(run_id, scene, config, seed=…)` and apply candidate params | Planner “verify” is false confidence | MP-30 | **DONE** (Wave A) |
| **P0-3** | Fix flood engine + add flood/outage ops to catalogue/applier | Disaster module unsafe | MP-29 | **DONE** (Wave A) |
| **P0-4** | Close MVP gate honestly: live DSA demos (≥3), screenshot→report, `mvp-1.0` tag, README flagship steps | Cannot claim product MVP | MP-22 | **DONE** (Wave B; tag after commit) |
| **P0-5** | Add **worker** to production `docker-compose.yml`; document `compose up` | Demo/deploy incomplete | MP-13/30 | **DONE** (Wave A) |
| **P0-6** | 2D = orthographic network (or MapLibre network layer), same edit/congestion as 3D | Core workspace broken in 2D | MP-15 | **DONE** (Wave A) |
| **P0-7** | Scenario ghost preview on map for pending ops | MP-20 EXIT incomplete | MP-20 | **DONE** (Wave A) |

---

## 6. P1 — Required for honest EXIT

| ID | Fix | Phase | Status |
|---|---|---|---|
| **P1-1** | Persist `profile_id` on project create; apply config profile | MP-08 | **DONE** (Wave D) |
| **P1-2** | Generate & commit OpenAPI TS types; CI drift check | MP-07 | **DONE** (Wave D) |
| **P1-3** | Wire demand profiles into departure generation (not classify-only) | MP-18 | **DONE** (Wave D) |
| **P1-4** | Flow particles/ribbons + flow export fields | MP-18 | **DONE** (Wave D; dashes documented + GeoJSON flow fields) |
| **P1-5** | Show `final_gap` in Run Detail / StatusBar | MP-17 | **DONE** (Wave B) |
| **P1-6** | Mount EnvironmentSettings, Attribution, DragDropZone (Projects), ExportPanel; wire real GeoJSON | MP-25/26/27 | **DONE** (Wave C) |
| **P1-7** | APIs + minimal UI: multi-year, sensitivity sweep, warm-start + golden cold/warm | MP-26 | **DONE** (Wave C) |
| **P1-8** | Isolation + emergency access into run KPIs / disaster compare | MP-29 | **DONE** (Wave C) |
| **P1-9** | Planner UI page (`/planner`) calling search + verify | MP-30 | **DONE** (Wave C) |
| **P1-10** | Evac KPIs: trapped + bottlenecks; shared API client (no hardcoded host) | MP-23/24 | **DONE** (Wave C) |
| **P1-11** | Complete shortcuts (L/I/Ctrl+S/?); disable mutations when API down | MP-22 | **DONE** (Wave B) |
| **P1-12** | Real Runs page (not Coming Soon); optional Network tools page | MP-21/22 | **DONE** (Wave B) |
| **P1-13** | Calibration fit helpers (parameter adjustment toward observed) | MP-28 | **DONE** (Wave C) |
| **P1-14** | Accessibility heatmap from real metrics (not fake radial) | MP-25/26 | **DONE** (Wave C) |
| **P1-15** | Package naming consistency (`core` vs `metacity_core`) in docs + imports | MP-03 | **DONE** (Wave D) |
| **P1-16** | WS rate limiting + multi-client soak test | MP-14/21 | **DONE** (Wave B) |
| **P1-17** | Reconcile Master Plan Progress Log + EXIT boxes to match this audit | Docs | **DONE** (Wave D) |

---

## 7. P2 — Bugs, polish, risk reduction

| ID | Item |
|---|---|
| P2-1 | True DES event queue for hospital (or document tick-DES deliberately) |
| P2-2 | Mini-map viewport rectangle |
| P2-3 | Real LOD/instancing; real dual-scene split wipe |
| P2-4 | Deep links: `layers`, `view` |
| P2-5 | Embeddable comparison HTML export |
| P2-6 | Snapshot delta encoding + FE Web Worker if FPS fails |
| P2-7 | MapLibre bbox picker + basemap dual-path banner |
| P2-8 | Import CI fixture from real OSM extract |
| P2-9 | Sweeper ops supported in applier (`global_demand_scale`, etc.) | **DONE** |
| P2-10 | Set `Result.converged` in finalize if used by sweeper | **DONE** |
| P2-11 | Pydantic v2 migration (`parse_file` / `Config` warnings) |
| P2-12 | sqlite3 datetime adapter deprecation |
| P2-13 | Frontend Vitest smoke tests |
| P2-14 | Plus Jakarta font or drop from plan text |
| P2-15 | Dockerfile duplicate COPY cleanup | **DONE** (Wave D) |
| P2-16 | Evac/Hospital routes under `/projects/:id/...` for IA consistency |
| P2-17 | Compare charts include CO2/utilities with CI where applicable |
| P2-18 | Legend colour thresholds shared constant FE | **DONE** (Wave D) |

---

## 8. Enhancements (after EXIT)

| ID | Enhancement | When |
|---|---|---|
| E-1 | Command palette (Ctrl+K) | Post MP-30 |
| E-2 | Presentation / Demo mode that actually drives runs | After P0-4 |
| E-3 | Multi-arm comparison (>2 scenarios) | After MP-21 solid |
| E-4 | Video recording of canvas | Polish |
| E-5 | SSE for job-done notifications | Optional |
| E-6 | Auth / multi-user | Only if productizing |
| E-7 | SUMO/MATSim adapter | Research optional |
| E-8 | Storybook for design system | Parallel polish |

---

## 9. UI enhancement candidates (later)

After Waves A–E, further UI work can focus on:

1. **Workspace IA** — clear modes, layers rail, inspector consistency — **done (Wave E)**  
2. **2D/3D parity** — same tools both cameras — **done (Wave A + E)**  
3. **Evidence storytelling** — Compare empty/CI education + badge→Assumptions — **done (Wave E)**  
4. **Empty/error states** — professional empty maps, failed runs, inconclusive CI — **done (Wave E)**  
5. **Mobile read-only** — projects + compare summary — **done (Wave E)**  
6. **Visual polish** — motion, typography scale, density helpers — **done (Wave E)**  
7. **Trust UX** — Assumptions one click from badge — **done (Wave E)**

---

## 10. Recommended execution waves

### Wave A — Correctness blockers (do first)

- [x] P0-1 OSM schema alignment + test  
- [x] P0-2 ML verifier signature + apply params  
- [x] P0-3 Flood/outage ops + schema-safe mutate  
- [x] P0-5 Prod compose worker  
- [x] P0-6 2D ortho network  
- [x] P0-7 Scenario ghost preview  

> **Wave A closed:** 20 Sep 2026 — pytest **71 passed**. Remaining P0 is **P0-4** (MVP gate) in Wave B.

### Wave B — MVP gate & evidence

- [x] P0-4 MVP gate pack (DSA live, screenshots→report, tag, README)  
- [x] P1-5 Gap in UI  
- [x] P1-11 Shortcuts + mutation lock on API-down  
- [x] P1-12 Real Runs page  
- [x] P1-16 WS limits + soak  

> **Wave B closed:** 20 Sep 2026 — pytest **79 passed**; frontend build OK.  
> **Tag note:** Create annotated tag after committing Wave A+B:  
> `git tag -a mvp-1.0 -m "MVP gate MP-22 / Wave B"`  
> (Do not tag until the Wave A+B working tree is committed, or the tag will miss these fixes.)

### Wave C — Extended modules honesty

- [x] P1-6 Mount presentation/export/attribution/drag-drop  
- [x] P1-7 Year / sensitivity / warm-start surfaces  
- [x] P1-8 Isolation KPIs in disasters  
- [x] P1-9 Planner UI  
- [x] P1-10 Evac KPI + shared client  
- [x] P1-13 Calibration fit  
- [x] P1-14 Real accessibility heatmap  

> **Wave C closed:** 20 Sep 2026 — pytest **85 passed**; frontend build OK.

### Wave D — Hygiene & docs

- [x] P1-1 Profile persist  
- [x] P1-2 OpenAPI types committed  
- [x] P1-3 / P1-4 Demand + flow honesty  
- [x] P1-15 Naming docs  
- [x] P1-17 Re-tick Master Plan honestly  
- [x] P2 batch as time allows (P2-15 Dockerfile, P2-18 congestion constants; P2-9/10 already done)

> **Wave D closed:** 20 Sep 2026 — pytest **90 passed**; frontend build OK; OpenAPI typegen + CI drift check.

### Wave E — UI enhancement (only after A–D)

- [x] Civic Steel token aliases + accent (kill blue drift)
- [x] Map performance: memoized links, capped dash animation, throttled WS metrics, instanced heatmap, Canvas `dpr` cap
- [x] Workspace IA: shared congestion legend, inspector idle/node panels, toast instead of `alert`
- [x] Trust UX: calibration badge → Assumptions on map + Compare
- [x] Compare empty / same-scenario / inconclusive CI education
- [x] Mobile read-only: hide edit chrome/nav; TopBar hamburger; projects/compare accessible
- [x] Motion: fade-up panels, soft pulse loading

> **Wave E closed:** 20 Sep 2026 — frontend build OK; Civic Steel polish + map FPS path + trust/evidence UX.

---

## 11. Definition of “system complete”

Treat METACITY as **build-complete for current scope** only when all are true:

### Core / MVP

- [ ] Fresh clone: backend tests pass; frontend builds; API client present  
- [ ] Flagship: Nexus City → baseline seeds 0–9 → Bypass preset → Compare CI + badge → HTML report  
- [ ] 2D and 3D both show editable congested network  
- [ ] Scenario ghost preview works  
- [ ] `mvp-1.0` tagged; README stranger walkthrough works &lt;15 min  

### Extended

- [ ] OSM import validates against scene schema (small bbox)  
- [ ] Evac + Hospital demos via shared API client  
- [ ] Disaster flood/closure changes isolation KPIs  
- [ ] Calibration evaluate + at least one fit helper  
- [ ] Planner suggests + **verified** full-sim results  
- [ ] `docker compose up` runs api + **worker** + frontend  

### Governance

- [ ] Master Plan Progress Log + EXIT boxes match reality  
- [ ] No known P0 open  
- [ ] Claims/calibration badge still enforced  

Until then: **not complete** — continue Wave A.

---

## 12. What is already solid

Do not rewrite these:

- DSA suite + Hypothesis + growing pytest (61)  
- Scene schema, templates, golden runner reproducibility  
- Jobs/workers (dev), WS snapshots with agent samples  
- BPR + MSA in runner; meta gap fields  
- Scenario applier unification; presets on disk  
- Compare hub with mechanisms + badge  
- Evac/hospital simulation cores + basic UIs  
- Civic Steel shell, project wizard, workspace load-by-id  
- Backup script, API cookbook, stakeholder guide stubs  
- Architecture PlantUML set  

---

## Appendix A — Broken / risky call sites (quick map)

> Re-verified 20 Sep 2026 after Waves A–D + appendix closure. All original items are **FIXED**.

| Area | File(s) | Status | Notes |
|---|---|---|---|
| OSM | `core/geo/osm_converter.py` | **FIXED** | Schema fields + round-trip unit test |
| ML verify | `core/ml/verifier.py` | **FIXED** | Correct `run_replication(run_id, scene, config, seed=…)` + param apply |
| Flood | `core/disasters/flood.py` | **FIXED** | Schema-safe capacity/speed; outage + applier wired |
| FE 2D | `WorkspaceMap` / `Canvas3D` | **FIXED** | Orthographic R3F + `NetworkLayer` (MapLibre unused) |
| FE export | `ExportPanel.tsx` | **FIXED** | Mounted; real GeoJSON + optional `run_id` flows |
| Docker prod | `docker-compose.yml` | **FIXED** | `worker` service present |
| Routes | `App.tsx` | **FIXED** | `/runs` → Runs; `/network` → Network Inspector |
| Evac/Hospital FE | pages | **FIXED** | Shared `api` client (no page-local hosts) |

### Residual risks closed during appendix pass

| Area | File(s) | Status | Notes |
|---|---|---|---|
| Resilience | `core/metrics/resilience.py` | **FIXED** | Was wrong `run_replication` arity + non-schema `capacity`/`freespeed`; now schema-safe N-1 + unit test |
| Hardcoded FE hosts | `api.ts`, `App`, `WorkspaceMap`, `simStore` | **FIXED** | Single `API_BASE` / `apiUrl` / `wsUrl` (`VITE_API_URL` override) |
| `/network` stub | `NetworkTools.tsx` | **FIXED** | Connectivity / bridges / centrality / isolation UI |

**Appendix A: complete — no open broken call sites from this list.**

---

## Appendix B — Related documents

| Document | Role | Status |
|---|---|---|
| `METACITY_Master_Plan.md` | Execution order + Progress Log / EXIT | **Reconciled** (Wave D) — only MP-01/04/05/09/11/12 EXIT `[x]` |
| `METACITY_Task_List.md` | File-level implementation guidance | **Current** — package naming = `metacity-core` / `import core` |
| `METACITY_Audit_MP01_MP20_Fixes.md` | Historical prior audit | **Superseded** for action — banner points here |
| This file (`METACITY_Full_System_Audit_MP01_MP30.md`) | **Current single fix queue** | Waves A–D + Appendix A/B closed; remaining = Wave E UI + `mvp-1.0` tag |

**Appendix B: complete — related docs consistent with post–Wave D reality.**

---

*Full audit + appendix + Wave E UI polish complete (20 Sep 2026). Remaining: commit working tree and tag `mvp-1.0` when ready.*
