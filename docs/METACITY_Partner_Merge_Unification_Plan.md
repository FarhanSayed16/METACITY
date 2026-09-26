# METACITY — Partner Merge & Unification Plan

> **Purpose:** End-to-end plan to unify **your** primary Metacity (`d:\METACITY`) with your friend's living-city fork (`d:\METACITY\metacity`), keep **your backend as the system of truth**, absorb **his best frontend / 3D / product UX**, fix remaining gaps, and ship one coherent product.  
> **Date:** 25 September 2026  
> **Audience:** You + partner (planning SoT before merge coding starts)  
> **Status:** Phase 0–10 **DONE** (25 Sep 2026). Enhancements backlog groomed — implement E-M* behind flags only. Tag `mvp-1.1-unified` when you request commit.

---

## 0. How to read this document

| Rule | Meaning |
|---|---|
| **Yours** | Root repo `d:\METACITY` — traffic MSA/CI workspace, Waves A–E, Master Plan, `import core` package |
| **Friend (historical)** | Partner living-city fork — **removed** from disk after merge; credits/assets retained in root |
| **Primary SoT** | **Your backend** (`backend/core`, `api/`, workers, SQLite runs, Compare CI) wins on conflicts |
| **Adopt from friend** | Only when clearly better for **looks, living-city UX, assets, disasters/AI product surfaces** — then **adapt** to your APIs/schemas, do not wholesale replace your sim |
| **Do not** | Run two FastAPI apps in production; keep two Scene contracts forever; copy broken asset registry paths |

**Companion docs (yours):**

- `docs/METACITY_Master_Plan.md` — historical MP-01…30 (still valid for traffic EXIT honesty)
- `docs/METACITY_Full_System_Audit_MP01_MP30.md` — Waves A–E closed; this merge plan **supersedes it as the next action queue**

---

## 1. Executive verdict (honest)

You and your friend built **two complementary products under one name**:

| Axis | **Yours (primary)** | **Friend** |
|---|---|---|
| Product thesis | Research-grade **macro traffic + evidence** (BPR/MSA, multi-seed CI, reports, OSM, calibration, DSA) | **Living digital twin** (citizens FSM, buses, businesses, disasters UI, AI planner UX, cinematic landing) |
| Backend maturity | Strong: package boundary, workers, golden tests (~92), scenarios, compare | Strong living-sim modules; weaker packaging / README / Redis unused |
| Frontend maturity | Solid Civic Steel workspace; **weak city look** (boxes/lines, **0 GLBs**) | Strong 3D presence (**42 GLBs**), landing, inspectors, Disaster Lab, AI modals |
| Docs / governance | Excellent (Master Plan, audits, EXIT honesty) | Thin (README stale vs Phase 5 code) |
| Perceived quality today | “Correct but not pretty / 3D feels unfinished” | “Looks like a city product but different architecture” |

**Bottom line:** Keep **your** simulation contract, jobs, Compare, and docs. **Port** friend’s assets + living-city presentation + best HUD/landing into your frontend, behind adapters that speak **your** API. Fix your remaining stubs and friend’s broken asset paths as you integrate — do **not** dual-run backends.

**Target product (unified METACITY):**

> One app: Civic Steel shell + cinematic entry → project workspace with **network evidence tools** (yours) **and** optional **living-city 3D mode** (friend assets + adapted layers) → Compare / Report / Disasters / AI assist — all driven by **your** `core` + workers.

---

## 2. Source-of-truth & merge principles

### 2.1 Keep (non-negotiable — yours)

| Domain | Paths / reason |
|---|---|
| Scene schema & templates | `backend/core/schema/scene.py`, `backend/data/templates/`, `data/schemas/` |
| Runner / BPR / MSA | `backend/core/runner.py`, `algorithms/bpr.py`, transport equilibrium |
| Projects / scenarios / runs / workers | `api/routes/*`, `workers/`, `persistence/` |
| Compare + CI + HTML reports | `comparison/`, `reports/` |
| Calibration / OSM / ML verifier | `core/calibration`, `core/geo`, `core/ml` |
| Package name | pip `metacity-core`, import `core` |
| Civic Steel tokens & Wave E map UX | `frontend/src/index.css`, workspace map performance path |
| Governance docs | Master Plan + this merge plan |

### 2.2 Adopt / port (friend — best-of)

| Domain | Paths / reason |
|---|---|
| **GLB asset pack + licenses** | Root `frontend/public/assets/**` + `docs/assets/*` (partner sources credited) |
| **Cinematic landing** | `LandingPage.tsx`, `Landing/Cinematic*`, Sections 1–7 |
| **City HUD patterns** | `CityApp.tsx` shell ideas: TopBar density, LeftToolbar, RightInspector, DisasterHUD |
| **3D layers worth porting** | `AssetBuilding`, `VehicleLayer`, `VegetationLayer`, `StreetFurnitureLayer`, Metro/Railway presentation, `HumanBillboard` / citizen sprites |
| **Disaster Lab UI** | `DisasterLabModal`, `DisasterVisualLayer` — wire to **your** disaster ops / run KPIs |
| **AI Command / Ask AI UX** | Modals + timeline — wire to **your** `/planner` + optional LLM later |
| **Interior viewer** | Optional Phase 8+ enhancement |
| **Asset download scripts** | `scripts/download-city-assets.mjs` etc. |

### 2.3 Do **not** adopt blindly

| Item | Why |
|---|---|
| Friend’s `app.simulation.engine` as replacement for your runner | Different world model; would destroy MSA/CI reproducibility |
| Friend’s in-memory-only project model | You already have projects/runs/SQLite |
| Friend’s `AssetRegistry` paths as-is | **Mismatch** vs on-disk GLBs (high bug risk) |
| Friend’s keyword “LLM” as real AI | Marketing ≠ OpenAI calls; keep honest |
| Dual Redis/Supabase without a product need | Adds ops cost; optional later |
| Two design systems fighting (cyan cyber vs Civic Steel) | Pick **Civic Steel as shell**; use friend’s cinematic only on landing / city-mode overlays |

### 2.4 Conflict resolution rule

```text
Schema / KPIs / jobs / Compare  → YOURS
Visual assets / landing / living HUD chrome → FRIEND (adapted)
If unsure → keep yours, wrap friend behind a feature flag
```

---

## 3. Gap analysis

### 3.1 Gaps in **your** project (why it “doesn’t feel perfect”)

| ID | Gap | Severity | Evidence |
|---|---|---|---|
| G-Y1 | **No real 3D city assets** — facilities are coloured boxes | **P0 perceived** | `NetworkLayer` boxGeometry; 0 GLBs in your `frontend/` |
| G-Y2 | Flow viz is dashes only (honest but unimpressive) | P2 | CongestionLegend honesty notes |
| G-Y3 | SplitWipe / LOD are stubs | P2 | `SplitWipe.tsx`, `LODManager.tsx` |
| G-Y4 | MapLibre basemap orphaned | P2 | unused `MapLibreBaseMap.tsx` |
| G-Y5 | No cinematic product entry — Welcome is thin vs friend’s landing | P1 product | vs `LandingPage.tsx` |
| G-Y6 | Living-city narrative missing (citizens/buses as story) | P1 product | You have agents in runner but not billboard viz |
| G-Y7 | Disaster / AI **product surfaces** thinner than friend’s Lab / Command Center | P1 | You have engines + Planner page; less “wow” UI |
| G-Y8 | README claims `mvp-1.0` while tag/EXIT unfinished | P1 governance | Full Audit |
| G-Y9 | Most Master Plan EXIT boxes still open (honest) | Docs OK | Progress Log |
| G-Y10 | FE Vitest almost absent | P2 | vs friend store tests |

### 3.2 Gaps in **friend** project (what not to inherit)

| ID | Gap | Severity |
|---|---|---|
| G-F1 | Asset registry / infra GLB paths ≠ files on disk | **P0** if ported raw |
| G-F2 | README / health version lie (Phase 2 vs Phase 5 code) | P1 |
| G-F3 | LLM provider is keyword templates | P1 honesty |
| G-F4 | Redis in compose unused; Supabase optional & thin | P2 |
| G-F5 | No Master Plan / Compare CI / multi-seed evidence story | Product gap vs yours |
| G-F6 | `core/` package empty; different API shape | Integration cost |
| G-F7 | FSM boarding dead-branch quirk | P2 |

### 3.3 Overlap (both have something — choose carefully)

| Topic | Yours | Friend | Decision |
|---|---|---|---|
| BPR / roads | MSA equilibrium + gap in UI | NetworkX A* + BPR volumes from agents | **Yours for equilibrium claims**; friend volumes can later feed Level-1 as optional demand |
| Disasters | Flood/outage ops + isolation KPIs | Full Lab UI + visual layer + cascade modules | **Your ops + KPIs**; **friend UI/visuals** |
| AI | ML planner search/verify + `/planner` | AI Command Center UX + what-if ranking | **Your verify path**; **friend UX shell** |
| Citizens | Synthetic population + plans (AM/PM peaks) | 20-state FSM + billboards | Keep your population for MSA; **optionally** add friend FSM as **viz layer** driven by samples / simplified agents |
| 3D | Ortho network editor | Full city GLB scene | **Dual mode**: Network Evidence Mode (yours) + City Twin Mode (friend assets) |

---

## 4. Target architecture (unified)

```text
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (single Vite app — Civic Steel shell)                  │
│  /          Cinematic landing (from friend, re-skinned)         │
│  /projects  Projects / wizard (yours)                           │
│  /projects/:id/map     MODE A: Network Evidence (your Canvas3D) │
│  /projects/:id/city    MODE B: City Twin 3D (friend layers+GLB) │
│  /compare /runs /planner /network /dsa /evac /hospital (yours)  │
│  Modals: Disaster Lab, Ask AI (friend UX → your APIs)           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST + WS (your contracts)
┌───────────────────────────────▼─────────────────────────────────┐
│ BACKEND (YOUR FastAPI — single process of truth)                │
│  core/  scene, runner, BPR/MSA, scenarios, disasters, ML…       │
│  api/   projects, runs, compare, tools, planner, export…        │
│  workers/  replication pool                                     │
│  persistence/  SQLite + run artefacts                           │
│                                                                 │
│  OPTIONAL later adapters (not phase-1):                         │
│    living_city/  thin façade if FSM/bus modules ported          │
└─────────────────────────────────────────────────────────────────┘
```

**Integration contracts to freeze early (Phase 1):**

1. **Scene JSON** — only your schema loads in both modes.  
2. **Run meta / KPIs / link_metrics** — City Twin colours from your `link_metrics` when a run is active.  
3. **WS** — your `/runs/{id}/stream` only (no second WS protocol).  
4. **Feature flags** — `VITE_CITY_TWIN=1`, `VITE_DISASTER_LAB=1` until stable.

---

## 5. Fix queue (pre-merge + during merge)

### P0 — Must fix for a “clear” product

| ID | Fix | Owner source |
|---|---|---|
| P0-M1 | Commit your working tree; stop claiming `mvp-1.0` until tagged | Yours |
| P0-M2 | Import friend’s GLB pack into `frontend/public/assets/` + license docs | Friend → yours |
| P0-M3 | Build **single AssetRegistry** mapped to real nested paths (`buildings/residential/house_01.glb`, etc.) | New (fix G-F1) |
| P0-M4 | City Twin mode: render facilities/links with GLBs/meshes, not bare boxes | Friend layers adapted |
| P0-M5 | One backend only in compose README; archive friend backend as `vendor/friend-reference/` (read-only) | Process |

### P1 — Required for honest unified MVP

| ID | Fix |
|---|---|
| P1-M1 | Port cinematic landing under Civic Steel (no cyan cyber clash) |
| P1-M2 | Mode toggle on project: **Network** ↔ **City Twin** |
| P1-M3 | Disaster Lab UI → your flood/outage/close_link + isolation KPIs |
| P1-M4 | AI Command / Ask UI → your `/planner` search+verify (label LLM as “guided” until real) |
| P1-M5 | Wire congestion colours in City Twin from your sim store `link_metrics` |
| P1-M6 | Empty/error states when GLB missing (procedural fallback — friend already has this pattern) |
| P1-M7 | Update README: dual-mode product story; remove false mvp tag until EXIT |

### P2 — Polish / risk

| ID | Fix |
|---|---|
| P2-M1 | Real SplitWipe (dual camera or honest “preview” label) |
| P2-M2 | LOD / instancing using friend’s Instanced patterns where useful |
| P2-M3 | Particle/ribbon flow optional enhancement (or keep dash honesty) |
| P2-M4 | FE Vitest smoke (landing + registry path tests) |
| P2-M5 | MapLibre optional basemap under Network mode |
| P2-M6 | Remove dead friend Redis from unified compose unless used |

### Enhancements (after unified MVP)

| ID | Enhancement |
|---|---|
| E-M1 | Port subset of friend citizen FSM as **visual agents** driven by your `agents_sample` |
| E-M2 | Bus/metro presentation layers synced to scenario transit lines |
| E-M3 | Real LLM provider behind Ask AI (OpenAI/Ollama) with grounding on run KPIs |
| E-M4 | Interiors modal |
| E-M5 | Supabase multi-user only if productizing |
| E-M6 | Video/HDR cinematic hero (optional) |

---

## 6. Phased execution plan (10 phases)

> Tick `[x]` only when EXIT criteria are verified.  
> **Do not skip Phase 0–1** — wrong SoT = merge disaster.

---

### Phase 0 — Freeze & inventory (1–2 days)

**Goal:** Make both trees safe to compare; no feature coding yet.

| Done | Task |
|:---:|---|
| [x] | Tag/snapshot friend tree: `metacity/` → `vendor/friend-metacity/` (reference only) |
| [ ] | Commit **your** current Waves A–E + Phase 0–1 tree *(when you ask)* |
| [x] | Write asset inventory table: `docs/merge/ASSET_INVENTORY.md` |
| [x] | Agree product one-liner (Network Evidence + City Twin) |

**EXIT:** Friend tree is reference, not a second app. — **PASSED** (25 Sep 2026)

---

### Phase 1 — Integration spine (3–5 days)

**Goal:** Single frontend talking only to **your** API; friend backend not required to run the app.

| Done | Task |
|:---:|---|
| [x] | Document OpenAPI surface: `docs/merge/INTEGRATION_SPINE.md` (+ existing `frontend/openapi.json`) |
| [x] | Feature flags + route stubs: `/projects/:id/city` (`CityTwin.tsx`, `featureFlags.ts`) |
| [x] | Compose / README: one backend, one worker, one frontend |
| [x] | CI still green on **your** pytest + FE build |
| [x] | Deprecate running friend backend: `vendor/friend-metacity/REFERENCE_ONLY.md` |

**EXIT:** `docker compose up` (root) is the only supported path; City Twin route exists as placeholder. — **PASSED** (25 Sep 2026)

---

### Phase 2 — Assets & registry (3–5 days)

**Goal:** Fix the #1 visual problem — empty / wrong 3D.

| Done | Task |
|:---:|---|
| [x] | Copy `public/assets/**` + `manifest.json` + `ASSET_LICENSES.md` / `CREDITS` excerpts |
| [x] | Implement `AssetRegistry` with **verified** nested paths + `npm run verify:assets` |
| [x] | Preload core GLBs; procedural fallback on miss (`RegisteredAsset`) |
| [x] | Attribution UI shows CC0 sources (`AssetAttribution` + map Attribution note) |

**EXIT:** Registry test passes; houses/offices/vehicles load in City Twin sandbox. — **PASSED** (25 Sep 2026)

---

### Phase 3 — City Twin mode (5–8 days)

**Goal:** Project map has a second mode that looks like a city, driven by **your** scene.

| Done | Task |
|:---:|---|
| [x] | Facility placement from scene → GLBs (`CityTwinScene` + `assetForFacilityType`) |
| [x] | Vegetation / street furniture capped (~80) near parks/homes/nodes |
| [x] | Roads as Line layer (coherent with Network mode) |
| [x] | Bind link colour to `useSimStore.link_metrics` + CongestionLegend |
| [x] | OrbitControls default; optional `?run_id=` live stream |
| [x] | Perf: dpr cap, performance.min, ambience budget |

**EXIT:** Nexus City looks like a city in Twin mode; Network mode unchanged. — **PASSED** (25 Sep 2026)

---

### Phase 4 — Product entry & shell (3–5 days)

**Goal:** First impression matches the quality of friend’s landing without abandoning Civic Steel.

| Done | Task |
|:---:|---|
| [x] | Port cinematic landing; recolour to Civic Steel / brand |
| [x] | CTA → `/projects` or onboarding tour |
| [x] | TopBar: clear Network vs City Twin entry from project overview |
| [x] | Mobile: landing + projects + compare; Twin may be desktop-first |

**EXIT:** Stranger opens `/` and understands the product in &lt;30 seconds. — **PASSED** (25 Sep 2026)

---

### Phase 5 — Disasters product surface (4–6 days)

**Goal:** Friend’s Disaster Lab UX on your disaster correctness.

| Done | Task |
|:---:|---|
| [x] | Port Disaster Lab modal chrome |
| [x] | Actions call your scenario ops (flood / outage / close_link) |
| [x] | Visual layer shows closures / flood from ghost ops + run isolation KPIs |
| [x] | Compare shows isolation delta (already partially yours) |

**EXIT:** Lab action → scenario draft → run → isolation KPI change visible. — **PASSED** (25 Sep 2026)

---

### Phase 6 — AI / planner UX unification (3–5 days)

**Goal:** One AI story; no fake LLM claims.

| Done | Task |
|:---:|---|
| [x] | Port AI Command Center layout |
| [x] | Wire to your `/planner/search` + `/planner/verify` |
| [x] | Ask-AI panel grounded on project KPIs / run meta (templates OK if labelled) |
| [ ] | Optional: real LLM behind flag (Enhancement E-M3) |

**EXIT:** Planner UX looks premium; verify still runs **your** full sim path. — **PASSED** (25 Sep 2026)

---

### Phase 7 — Living agents viz (optional but high wow) (5–8 days)

**Goal:** Citizens feel alive **without** replacing MSA.

| Done | Task |
|:---:|---|
| [x] | Render `agents_sample` from your WS as billboards / simple meshes |
| [ ] | Optional: port friend FSM modules behind adapter feeding samples only |
| [x] | Citizen inspector reads sample fields (id, mode, progress) |
| [x] | Document: viz agents ≠ microsimulation claim |

**EXIT:** During a live run, City Twin shows moving agents; claims language stays Level-1 honest. — **PASSED** (25 Sep 2026)  
See `docs/merge/AGENTS_VIZ_HONESTY.md`. Friend FSM port deferred (E-M1).

---

### Phase 8 — Hardening & stub closure (3–5 days)

**Goal:** Clear remaining “not proper” stubs.

| Done | Task |
|:---:|---|
| [x] | SplitWipe: implement or label “aesthetic preview” |
| [x] | LODManager: real distance culling for GLBs |
| [x] | Delete or quarantine orphan MapLibre / dead friend backend from default paths |
| [x] | FE Vitest: registry + landing smoke |
| [x] | Pytest still ≥92; add 3–5 integration tests for twin asset load / disaster lab ops |

**EXIT:** No known P0 visual/path bugs; CI green. — **PASSED** (25 Sep 2026)  
Vitest 7 · Pytest 96 · MapLibre orphan **deleted** · SplitWipe labelled aesthetic · LOD culls GLBs/agents/ambience.

---

### Phase 9 — Docs, claims, MVP tag (2–3 days)

**Goal:** Governance catches up to the merged product.

| Done | Task |
|:---:|---|
| [x] | Rewrite root README (dual mode, flagship walkthrough updated) |
| [x] | Update Full System Audit: mark merge phases; keep EXIT honesty |
| [x] | Stakeholder guide: Network Evidence vs City Twin |
| [ ] | Tag `mvp-1.0` **or** `mvp-1.1-unified` after commit *(ask to commit/tag)* |
| [x] | Archive note: partner tree removed; `docs/merge/ARCHIVE_FRIEND.md` |

**EXIT:** Docs + walkthrough ready (&lt;20 min including Twin). **Tag deferred** until you request commit → `mvp-1.1-unified`. — **DOCS PASSED** (25 Sep 2026)

---

### Phase 10 — Enhancements backlog (ongoing)

| Done | Task |
|:---:|---|
| [x] | E-M1…E-M6 as prioritized |
| [x] | True dual-scene wipe, particle flows, Storybook, auth — only if needed |

**EXIT:** Backlog groomed; no silent scope creep into P0. — **PASSED** (25 Sep 2026)  
See `docs/merge/ENHANCEMENTS_BACKLOG.md`. Flags `VITE_ENH_*` default **off**. Recommended next build: **E-M2** transit layers.

---

## 7. Suggested calendar (solo / duo)

| Block | Phases | Duo split |
|---|---|---|
| Week 1 | 0–2 | You: SoT/API/flags · Friend: asset inventory + registry tests |
| Week 2 | 3–4 | Friend: City Twin layers · You: scene binding + perf |
| Week 3 | 5–6 | Friend: Lab/AI chrome · You: API wiring + honesty copy |
| Week 4 | 7–9 | Shared: agents viz (if in scope), hardening, docs, tag |
| Later | 10 | Enhancements |

---

## 8. Definition of “merge complete”

All must be true:

1. **One** backend (yours) serves the only FE.  
2. Network Evidence mode: edit + congestion + Compare path still works (regression).  
3. City Twin mode: GLBs load; facilities not bare boxes for Nexus template.  
4. Disaster Lab and Planner UX call your APIs; no second sim engine required.  
5. Asset registry tests green; licenses attributed.  
6. README + tag match reality.  
7. Master Plan / this doc Progress updated; no fake EXIT.

Until then: **not complete** — continue phases in order.

---

## 9. Immediate next actions

1. **Commit + tag** `mvp-1.1-unified` when you ask (working tree still uncommitted by design).  
2. Optionally implement **E-M2** transit layers behind `VITE_ENH_TRANSIT_LAYERS=1`.  
3. Do **not** treat E-M* as P0 or expand MVP claims without EXIT updates.

---

## 10. Progress log (merge phases)

| Phase | Status | Date | Notes |
|---|---|---|---|
| 0 Freeze & inventory | [x] | 2026-09-25 | Friend frozen then **removed**; ASSET_INVENTORY kept |
| 1 Integration spine | [x] | 2026-09-25 | flags, `/city`, single-stack docs |
| 2 Assets & registry | [x] | 2026-09-25 | 42 GLBs + registry verify |
| 3 City Twin mode | [x] | 2026-09-25 | Scene GLBs + congestion + agents |
| 4 Landing & shell | [x] | 2026-09-25 | Civic Steel cinematic landing |
| 5 Disaster Lab | [x] | 2026-09-25 | flood/outage/close_link → your ops |
| 6 AI / planner UX | [x] | 2026-09-25 | Command Center + guided Ask |
| 7 Living agents viz | [x] | 2026-09-25 | `agents_sample` capsules + honesty |
| 8 Hardening | [x] | 2026-09-25 | LOD, SplitWipe label, Vitest, pytest |
| 9 Docs & tag | [x] | 2026-09-25 | Docs done; tag when you ask |
| 10 Enhancements | [x] | 2026-09-25 | Backlog groomed — E-M* flags off |

---

## Appendix A — Path cheatsheet

| Role | Path |
|---|---|
| Your backend | `d:\METACITY\backend\` |
| Your frontend | `d:\METACITY\frontend\` |
| Your audits | `d:\METACITY\docs\` |
| Friend (reference) | `d:\METACITY\vendor\friend-metacity\` |
| Friend assets | `d:\METACITY\vendor\friend-metacity\frontend\public\assets\` |
| Friend landing | `d:\METACITY\vendor\friend-metacity\frontend\src\pages\LandingPage.tsx` |
| Friend city HUD | `d:\METACITY\vendor\friend-metacity\frontend\src\components\CityApp.tsx` |

## Appendix B — What “better” means in this merge

| If you feel… | Likely cause | Phase that fixes it |
|---|---|---|
| “3D looks fake / boxes” | No GLBs | 2–3 |
| “Not a product, just a tool” | Thin Welcome | 4 |
| “Disasters / AI feel unfinished” | Engines without Lab UX | 5–6 |
| “Friend’s app looks cooler” | Cinematic + assets | 2–4 |
| “But my Compare/CI is the real science” | Keep yours | Never replace |

---

*All merge phases 0–10 complete (25 Sep 2026). Product path closed; enhancements are opt-in. Ask to commit + tag `mvp-1.1-unified` when ready.*
