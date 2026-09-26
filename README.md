# METACITY

Open-source urban simulation: **Network Evidence** (BPR + MSA, multi-seed Compare CI) and **City Twin** (GLB presentation + sampled agents) — both driven by **one** FastAPI/`core` backend at this repo root.

**Partner fork:** previously vendored as `vendor/friend-metacity/` — **removed** after merge. Assets + credits remain under `frontend/public/assets/` and `docs/assets/`. See [`docs/merge/ARCHIVE_FRIEND.md`](docs/merge/ARCHIVE_FRIEND.md).

---

## Flagship walkthrough (&lt;20 minutes)

1. **Start stack** — `docker compose up --build` (api + worker + frontend), or local uvicorn + `npm run dev` (below).
2. **Landing** — Open http://localhost:5173 — cinematic entry (Civic Steel) → **Open projects**.
3. **Project** — Create from **Nexus City** (or Highway Bypass / Flood preset).
4. **Network Evidence** — Overview → **Network Evidence** (or map). Run a scenario with **seeds 0–9**. Congestion colours stream live.
5. **City Twin** — Overview → **City Twin**, or map toolbar → City Twin. Prefer `/projects/:id/city?run_id=…` so roads + **sampled agents** animate. Click an agent for the inspector (viz ≠ microsim).
6. **Disaster Lab** — On the map (top-right) → flood / outage / close_link → Measure isolation → **Save & run**. Ghost closures show as red dashed links.
7. **Compare** — Pair baseline vs disaster/bypass; read CI bands, mechanism trace, **isolation Δ**. Download the HTML report.
8. **AI Command Center** — TopBar **AI Center** → Search candidates → **Verify top N (full sim)**. **Ask** uses guided templates from run artefacts (labelled: not an LLM).
9. **Algorithms** — `/dsa` — A*, MSA/BPR, Brandes + bridges demos.

---

## Two modes · one truth

| Mode | Route | Use for |
|---|---|---|
| **Network Evidence** | `/projects/:id/map` | Edit links/facilities, ghost scenarios, live congestion, isolation tools |
| **City Twin** | `/projects/:id/city` | Present the **same** scene with GLBs, congestion roads, ≤200 sampled agents |

Stakeholder one-pager: [`docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md`](docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md).

### Feature flags (`frontend/.env`)

| Flag | Default | Surface |
|---|---|---|
| `VITE_CITY_TWIN` | `true` | City Twin routes / CTAs |
| `VITE_DISASTER_LAB` | `true` | Disaster Lab modal |
| `VITE_AI_COMMAND` | `true` | AI Command Center + Ask |
| `VITE_API_URL` | `http://localhost:8000` | API origin |

---

## Features

- Traffic equilibrium via MSA smoothing and BPR volume-delay
- Multi-seed Compare with 95% CI, calibration badges, isolation delta
- 2D orthographic + 3D network editing, scenario ghost preview
- City Twin: 42-registry GLBs, LOD culling, agents sample viz (Level-1 honest)
- Disaster Lab → your `flood` / `outage` / `close_link` ops
- Planner search + verify on the **full** sim path; guided Ask (not LLM)
- Evacuation and hospital surge modules; OSM import

---

## Getting started

### Docker (recommended — only supported stack)

```bash
docker compose up --build
# frontend http://localhost:5173  ·  API http://localhost:8000  ·  worker polls pending runs
```

### Local development

```bash
# Backend (root only)
cd backend && pip install -e ".[dev]"
uvicorn api.main:app --reload
# optional: python -m workers.pool

# Frontend
cd frontend && npm install --legacy-peer-deps && npm run dev
```

### Checks

```bash
cd frontend && npm run verify:assets && npm test && npm run build
cd backend && pytest -q
```

### Not supported

```bash
# Friend fork is no longer vendored — use root stack only
# (historical note: docs/merge/ARCHIVE_FRIEND.md)
```

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| Space | Play / Pause |
| 1 / 2 / 3 | Select / Add node / Draw link |
| 4 | Toggle 2D / 3D |
| L | Layers / congestion legend |
| I | Inspector |
| Ctrl+S | Save scene |
| ? | Shortcuts help |
| Ctrl+Z / Ctrl+Y | Undo / Redo |
| Delete | Delete selection |
| Esc | Deselect / close help |

---

## Documentation

| Doc | Purpose |
|---|---|
| OpenAPI | http://localhost:8000/docs |
| [`docs/METACITY_Partner_Merge_Unification_Plan.md`](docs/METACITY_Partner_Merge_Unification_Plan.md) | Merge Phases 0–8 done · Phase 9 docs |
| [`docs/merge/INTEGRATION_SPINE.md`](docs/merge/INTEGRATION_SPINE.md) | API / mode contracts |
| [`docs/merge/AGENTS_VIZ_HONESTY.md`](docs/merge/AGENTS_VIZ_HONESTY.md) | Agents viz ≠ microsim |
| [`docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md`](docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md) | Stakeholder mode guide |
| [`docs/merge/ENHANCEMENTS_BACKLOG.md`](docs/merge/ENHANCEMENTS_BACKLOG.md) | Phase 10 E-M1…E-M6 (flags default off) |
| [`docs/METACITY_Full_System_Audit_MP01_MP30.md`](docs/METACITY_Full_System_Audit_MP01_MP30.md) | MP-01…30 + merge status |
| [`docs/METACITY_Master_Plan.md`](docs/METACITY_Master_Plan.md) | Historical master plan |

**Release tag:** intended `mvp-1.1-unified` after you request a commit + tag (not applied automatically).

## License

MIT License
