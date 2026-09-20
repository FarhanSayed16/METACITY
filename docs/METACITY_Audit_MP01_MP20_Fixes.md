# METACITY — Audit Report: MP-01 through MP-20

> **Purpose:** Required fixes and improvements before treating Phase 20 as complete.  
> **Date:** 20 September 2026  
> **Scope:** Master Plan MP-01 … MP-20 vs current codebase  
> **Method:** Code inspection + `pytest` (42 passed) + Master Plan / Task List cross-check  

| Field | Value |
|---|---|
| Claimed progress | Development through Phase 20 |
| Honest verdict | **Not EXIT-complete.** Simulation spine is real; many EXIT criteria are stubs, partial, or incorrectly marked `[x]` |
| Backend tests | **42 passed**, 10 warnings |
| Highest blockers | Gitignored frontend API client · Workspace does not load project scene · Scenario/preset UX thin · Broken routes · Core purity violation |

---

## 1. Executive summary

The project has a working **offline simulation + jobs** path and a usable **3D workspace skeleton**. That is substantial progress.

However, Master Plan checkboxes overstate completeness. Several items marked `[x]` are only partially implemented. **MP-20 EXIT is not met** for a flagship bypass flow with discoverable presets, multi-seed scenario runs, and a proper scenario builder.

**Do not start MP-21 (Comparison) until the P0/P1 items below are closed** — otherwise comparison will sit on a shaky scenario/workspace foundation.

```text
Strong:     MP-01, MP-04, MP-05, MP-09, MP-11, MP-12  (mostly complete)
Mixed:      MP-03, MP-06, MP-08, MP-10, MP-13–20
Weak FE:    MP-02 Toast/Assumptions, MP-07 typegen/API-down, MP-15 2D, MP-19–20 UX
```

---

## 2. Scorecard by master phase

| MP | Master Plan mark | Audit status | One-line gap |
|---|---|---|---|
| MP-01 | EXIT ✓ | **COMPLETE** | OK |
| MP-02 | EXIT ✓ | **PARTIAL** | No Toast; no Assumptions route; Storybook missing (optional) |
| MP-03 | EXIT ✓ | **PARTIAL** | Import is `core` not `metacity_core`; health lacks SQLite/worker checks |
| MP-04 | EXIT ✓ | **COMPLETE** | OK |
| MP-05 | EXIT ✓ | **COMPLETE** | OK |
| MP-06 | EXIT ✓ | **PARTIAL** | No clear `load_template` helper; client must wire scene path |
| MP-07 | EXIT ✓ | **PARTIAL** | No OpenAPI→TS; no API-down page; `api.ts` **gitignored** |
| MP-08 | EXIT ✓ | **PARTIAL** | Presets API hollow/mock; profile pick not persisted on create |
| MP-09 | EXIT ✓ | **COMPLETE** | OK |
| MP-10 | EXIT ✓ | **PARTIAL** | Validation is connectivity-only (no dangling/capacity/UF suite) |
| MP-11 | EXIT ✓ | **COMPLETE** | OK |
| MP-12 | EXIT ✓ | **COMPLETE** | OK |
| MP-13 | EXIT ✓ | **PARTIAL** | Compose runs missing `workers.pool`; orphan logic also interrupts `pending` |
| MP-14 | EXIT ✓ | **PARTIAL** | `agents_sample` always `[]`; no WS load smoke test |
| MP-15 | EXIT ✓ | **PARTIAL** | 2D = MapLibre OSM (no network); no ortho↔perspective; legend thresholds disagree with colours |
| MP-16 | EXIT ✓ | **PARTIAL** | BPR works in runner; `assignment.py`/`congestion.py` largely unused |
| MP-17 | EXIT ✓ | **PARTIAL** | Gap in `equilibrium.json`/`kpis.json`, not `meta.json`; no gap in UI |
| MP-18 | EXIT ✓ | **PARTIAL** | `demand_profiles` dead code; flow anim is dashes not particles; no flow export |
| MP-19 | EXIT ✓ | **PARTIAL** | History write exists; **no restore API**; workspace often has **empty scene** |
| MP-20 | EXIT ✓ | **PARTIAL** | Dual appliers; Bypass hardcoded in UI; Builder is JSON textarea; seeds not 0–9 |

**Progress Log inconsistency:** Top-of-file Progress Log still shows many MPs unchecked while section tables show `[x]`. Reconcile after this audit.

---

## 3. P0 — Must fix before calling Phase 20 done

### P0-1. Frontend API client is gitignored

| | |
|---|---|
| **Problem** | Root `.gitignore` contains `lib/`, which matches `frontend/src/lib/api.ts`. Fresh clones will not get the API client; imports break. |
| **Evidence** | `git check-ignore -v frontend/src/lib/api.ts` → `.gitignore:14:lib/` |
| **Fix** | Add exception `!frontend/src/lib/` **or** move client to `frontend/src/api/` and update imports; commit the file. |
| **MP** | MP-07 |

### P0-2. Workspace does not load the project scene

| | |
|---|---|
| **Problem** | “Open Workspace” goes to `/map` without binding `projectId`. Scene load path (`DragDropZone`) is unused. Save can fall back to project id `'default'`. |
| **Evidence** | Routes: `/map` not `/projects/:id/workspace`; `DragDropZone` never mounted |
| **Fix** | Route `/projects/:id/map` (or workspace); on mount `GET` scene → `loadScene`; set `activeProjectId`; never save as `'default'`. |
| **MP** | MP-15, MP-19 |

### P0-3. Core purity violation

| | |
|---|---|
| **Problem** | `metacity_core` / `core` must not import persistence or API-layer scenarios. |
| **Evidence** | `backend/core/ml/dataset_gen.py` imports `persistence.models` and `scenarios.applier` |
| **Fix** | Move `dataset_gen` out of `core/` (e.g. `backend/ml/`) or accept plain dicts with no persistence imports. |
| **MP** | Global rule · blocks clean architecture |

### P0-4. Dual scenario appliers (incompatible formats)

| | |
|---|---|
| **Problem** | Two appliers: `core/scenarios/applier.py` (`type`/`data`) vs `scenarios/applier.py` (`op`). Risk of silent no-ops. |
| **Fix** | Single applier + single op schema; delete or thin-wrap the legacy file; align tests and presets. |
| **MP** | MP-20 |

### P0-5. Scene history restore missing (MP-19 EXIT)

| | |
|---|---|
| **Problem** | PUT may write history, but there is no list/restore API. Undo is client-only. |
| **Fix** | `GET /projects/{id}/scene/history` + `POST …/scene/restore` (last 10 versions). Wire Ctrl+Z / Restore to backend when available. |
| **MP** | MP-19 |

### P0-6. Presets discovery incomplete (MP-08 / MP-20 EXIT)

| | |
|---|---|
| **Problem** | `GET /presets` does not reliably serve persisted JSON presets; UI Bypass is hardcoded ops. |
| **Fix** | Ship `backend/data/presets/highway_bypass.json` from `BYPASS_PRESET`; API reads directory; UI calls `getPresets()` for “Try Bypass”. |
| **MP** | MP-08, MP-20 |

---

## 4. P1 — Required for honest EXIT criteria

### P1-1. Broken / invalid backend routes and compose

| Issue | Location | Fix |
|---|---|---|
| `betweenness_centrality` NameError | `api/routes/network_tools.py` | Import/call `brandes_betweenness_centrality` (or rename) |
| Export route broken | `api/routes/export.py` | Fix repository construction + attribute names, or remove until used |
| Parameter sweeper broken | `jobs/sweeper.py` | Fix `run_replication` signature / Result fields, or gate behind feature flag |
| Docker worker module missing | `docker-compose.dev.yml` → `python -m workers.pool` | Point to real worker entry or add `workers/pool.py` |

### P1-2. Package / import naming

| Issue | Fix |
|---|---|
| Plan says `import metacity_core`; package exposes `core` | Either configure package as `metacity_core` **or** update Master Plan / README / CONTRIBUTING to say `import core` consistently |

### P1-3. Health endpoint incomplete (MP-03)

| Missing | Fix |
|---|---|
| SQLite reachable | Probe DB open in `/health` |
| Worker pool status | Report pool size / alive count stub |

### P1-4. Frontend trust & resilience (MP-02 / MP-07)

| Missing | Fix |
|---|---|
| Toast primitive | Add `Toast` + toast stack |
| Assumptions page/drawer | Route or drawer with claims policy |
| API-down page | Full-page retry; StatusBar must not hardcode “Connected” |
| Use `checkHealth` | Wire real health into StatusBar |

### P1-5. OpenAPI → TypeScript (MP-07)

| Missing | Fix |
|---|---|
| Typegen pipeline | Emit OpenAPI from FastAPI; `openapi-typescript`; npm script; CI drift check |

### P1-6. Profile pick not persisted (MP-08)

| Issue | Fix |
|---|---|
| Wizard profile only stuffed into description | Accept `profile_id` on create project; store and apply config profile |

### P1-7. Network validation depth (MP-10)

| Missing | Fix |
|---|---|
| Dangling nodes, capacity sanity, Union-Find suite | Extend `network/validation.py` + tests + fail broken fixtures |

### P1-8. Snapshots / agents_sample (MP-14)

| Issue | Fix |
|---|---|
| Runner always sends `agents_sample: []` | Cap-sample agents into snapshots; optionally use `core/snapshot/builder.py` |
| No WS load smoke | Add short multi-client soak test |

### P1-9. Equilibrium meta + UI gap (MP-17)

| Issue | Fix |
|---|---|
| `final_gap` not in `meta.json` | Write method/gap/iterations into `meta.json` (keep equilibrium.json if desired) |
| No gap in UI | Show on Run Detail or StatusBar when run completes |

### P1-10. Demand profiles + flow export (MP-18)

| Issue | Fix |
|---|---|
| `demand_profiles.py` unused | Wire into departure generation so AM/PM peaks are explicit |
| Flow animation = dashed lines | Particles/ribbons with volume∝density, speed∝travel time |
| No flow export fields | API/snapshot: `link_id`, volume, direction |

### P1-11. 2D / 3D workspace correctness (MP-15)

| Issue | Fix |
|---|---|
| 2D is MapLibre OSM, not network ortho | Orthographic R3F (or MapLibre network layer) with same edit/congestion |
| Legend thresholds ≠ colour thresholds | Align green/amber/red bands in one shared constant |
| Layers panel missing | Basic layer toggles (roads, congestion, buildings, agents) |

### P1-12. Scenario UX to plan standard (MP-20)

| Issue | Fix |
|---|---|
| Builder = JSON textarea | Ordered ops list UI (`add_link`, `set_lanes`, …) |
| No ghost preview | Dashed accent overlay for pending changes on map |
| Runs use seed `[42]` | Default seeds `0..9` aligned with baseline policy |
| Compare/Runs pages “Coming Soon” | At least Runs list stub with real data (prep for MP-21) |

---

## 5. P2 — Bugs, polish, risk reduction

| ID | Item | Notes |
|---|---|---|
| P2-1 | Orphan recovery marks `pending` interrupted | Narrow to `running` only (`repositories.py`) |
| P2-2 | Congestion colour legend mismatch | Shared threshold module FE+docs |
| P2-3 | CalibrationBadge unused on workspace | Mount on evidence surfaces |
| P2-4 | Duplicate CalibrationBadge components | One API |
| P2-5 | `playbackSpeed` does not affect stream | Document as UI frame gate **or** send speed to backend |
| P2-6 | SkipBack on SimStrip inert | Implement or hide |
| P2-7 | Save without pre-validate call | Optional `POST /scenes/validate` before PUT |
| P2-8 | Frontend `test` script missing | Vitest smoke for router/api |
| P2-9 | Plus Jakarta font not loaded | Load or drop from plan wording |
| P2-10 | Pydantic v1 `Config` / `parse_file` warnings | Migrate to v2 patterns |
| P2-11 | sqlite3 datetime adapter deprecation | Use recommended adapter recipe |
| P2-12 | Transport modules unused by runner | Either wire `assignment.py`/`congestion.py` or document runner-inline as canonical |
| P2-13 | TransitNetwork unused by runner | Wire or mark Phase-later |
| P2-14 | Master Plan Progress Log vs table marks | Reconcile after fixes |
| P2-15 | Premature MP-21+ code | Evac/hospital/OSM/ML exist early — OK to keep, but don’t mark MP-20 done until EXIT met; isolate incomplete routes |

---

## 6. Enhancements (optional, still valuable)

| ID | Enhancement | Why |
|---|---|---|
| E-1 | Workspace URL deep-link `?mode=&layers=&view=` | Prep for MP-25; helps demos now |
| E-2 | Dedicated `/scenarios` routes | Cleaner IA than Overview-only |
| E-3 | Integration test: bypass preset → seeds 0–9 | Locks MP-20 EXIT |
| E-4 | Visual regression smoke for Nexus City 3D | Catch empty-scene regressions |
| E-5 | Document “Level-1 = flow ribbons not cars” in UI help | Honesty / claims policy |
| E-6 | `load_template` convenience on projects API | Matches Task List wording |

---

## 7. Risks if you proceed to MP-21 without fixing

| Risk | Impact |
|---|---|
| Comparison built on single-seed / hardcoded bypass | Flagship demo fails academic/product bar |
| Empty workspace scene | Editors and screenshots useless |
| Gitignored API client | Teammates / CI / fresh machines break |
| Dual appliers | Scenarios “succeed” but change nothing |
| Broken export/centrality/sweeper | Demo landmines during viva/stakeholder runs |
| Core→persistence import | Architecture debt blocks clean testing and packaging |

---

## 8. Recommended fix order (execution queue)

Work these in order; re-tick Master Plan only when verified.

### Wave A — Unblock the app (1–3 days)

1. [ ] P0-1 Fix `.gitignore` / relocate API client; commit  
2. [ ] P0-2 Workspace loads scene by `projectId`  
3. [ ] P1-4 API-down + honest StatusBar  
4. [ ] P1-1 Fix compose worker command  

### Wave B — Scenario / preset truth (2–4 days)

5. [ ] P0-4 Single scenario applier + schema  
6. [ ] P0-6 Persist + serve Bypass preset JSON; UI uses API  
7. [ ] P1-12 Scenario builder ops UI + ghost preview + seeds 0–9  
8. [ ] P0-5 Scene history list/restore API  

### Wave C — Simulation honesty (2–4 days)

9. [ ] P1-10 Wire demand profiles + flow export + better flow viz  
10. [ ] P1-8 Populate `agents_sample`; WS smoke test  
11. [ ] P1-9 `final_gap` in `meta.json` + UI  
12. [ ] P1-7 Deeper network validation  

### Wave D — Hygiene (2–3 days)

13. [ ] P0-3 Move `dataset_gen` out of core  
14. [ ] P1-1 Fix/remove broken export + centrality + sweeper  
15. [ ] P1-2 Naming consistency (`core` vs `metacity_core`)  
16. [ ] P1-3 Enrich `/health`  
17. [ ] P1-5 OpenAPI typegen  
18. [ ] P1-6 Persist profile_id  
19. [ ] P1-11 2D ortho path + legend alignment  
20. [ ] Reconcile Master Plan checkboxes to match reality  
21. [ ] Add integration test: Bypass preset × seeds 0–9  

**Exit gate for “Phase 20 complete”:**

- [ ] Fresh clone: frontend builds and talks to API  
- [ ] Open project → workspace shows Nexus City network  
- [ ] Try Bypass from presets API → scenario validates  
- [ ] Enqueue seeds 0–9 for baseline and scenario  
- [ ] Undo/restore scene version works  
- [ ] No core→persistence imports  
- [ ] Compose worker starts  
- [ ] Master Plan MP-01…20 EXIT boxes re-audited honestly  

---

## 9. What is already in good shape (do not rewrite)

Keep and build on these:

- DSA algorithms + Hypothesis tests  
- Scene schema + templates + golden runner tests  
- Clock / world / population / plan templates  
- Job manager + replication worker + WS endpoint (needs sampling polish)  
- BPR + MSA loop inside runner (tested)  
- Civic Steel shell, project list/wizard/overview  
- 3D network layer + link inspector + local undo stack  

---

## 10. Related documents

| Document | Role after this audit |
|---|---|
| `METACITY_Master_Plan.md` | Re-tick after Wave A–D; do not trust current `[x]` blindly |
| `METACITY_Task_List.md` | Use for file-level implementation of each fix |
| This file | **Fix queue until Phase 20 EXIT is real** |

---

*Audit complete. Next step after you approve: implement Wave A (P0-1, P0-2, P1-4, P1-1) first.*
