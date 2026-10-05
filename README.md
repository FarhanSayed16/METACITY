# METACITY

Open-source **pre-execution decision tool** for urban infrastructure: pick a city, propose a plan (bypass, flood, bridge failure), simulate how traffic bifurcates and how **citizen stress** changes — then review a clear before/after briefing and optional 3D City Twin.

**Primary path:** Decision Mode. Network editor, DSA demos, evacuation/hospital labs remain available as **Advanced lab** (toggle in the TopBar).

---

## Flagship walkthrough (&lt;10 minutes)

1. **Start stack** — `docker compose up --build` (api + worker + frontend), or local uvicorn + `npm run dev` (below).
2. **Landing** — Open http://localhost:5173 → **Start a decision**.
3. **Decision Mode** — Choose **Nexus City** → pick **Eastern Highway Bypass** (or Flood / Bridge failure) → **Simulate before vs after**.
4. **Impact briefing** — Read travel-time change, Stress / Impatience indices, plain-language narrative.
5. **3D Twin** — **View after in 3D Twin** (same scene + sampled agents; viz ≠ microsim).
6. **Report** — Download the HTML comparison report.
7. **Advanced lab** (optional) — TopBar **Advanced lab** unlocks Projects, network editor, Compare tools, DSA, Evac, Hospital, AI Center.

---

## Two layers · one truth

| Layer | Route | Use for |
|---|---|---|
| **Decision Mode** | `/decision` → `/decision/:id/impact` | Planners & builders: plan cards → auto baseline+plan runs → impact story |
| **City Twin** | `/projects/:id/city?run_id=…` | Present the **same** scene with GLBs + sampled agents |
| **Advanced lab** | Projects / map / DSA / modules | Engineers: draw networks, inspect JSON, run lab modules |

Stakeholder one-pager: [`docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md`](docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md).

### Feature flags (`frontend/.env`)

| Flag | Default | Surface |
|---|---|---|
| `VITE_CITY_TWIN` | `true` | City Twin routes / CTAs |
| `VITE_DISASTER_LAB` | `true` | Disaster Lab modal (Advanced) |
| `VITE_AI_COMMAND` | `true` | AI Command Center + Ask (Advanced) |
| `VITE_ADVANCED_LAB` | `false` | Start with lab nav visible |
| `VITE_API_URL` | `http://localhost:8000` | API origin |

---

## Features

- **Decision API** — `POST /decision/run` creates project + baseline/plan scenarios, enqueues multi-seed runs
- Traffic equilibrium via MSA smoothing and BPR volume-delay
- Multi-seed Compare with 95% CI, calibration badges, isolation delta
- Citizen **Stress / Impatience** indices derived from trip delays (Level-1, documented in Assumptions)
- City Twin: 42-registry GLBs, LOD culling, agents sample viz (honest: not microsim)
- Advanced: network editing, Disaster Lab, planner search + verify, evacuation & hospital modules, OSM import

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

---

## Keyboard shortcuts (Advanced map)

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
| [`docs/merge/INTEGRATION_SPINE.md`](docs/merge/INTEGRATION_SPINE.md) | API / mode contracts |
| [`docs/merge/AGENTS_VIZ_HONESTY.md`](docs/merge/AGENTS_VIZ_HONESTY.md) | Agents viz ≠ microsim |
| [`docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md`](docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md) | Stakeholder mode guide |
| [`docs/merge/ENHANCEMENTS_BACKLOG.md`](docs/merge/ENHANCEMENTS_BACKLOG.md) | Phase 10 E-M1…E-M6 (flags default off) |
| [`docs/METACITY_Full_System_Audit_MP01_MP30.md`](docs/METACITY_Full_System_Audit_MP01_MP30.md) | MP-01…30 + merge status |
| [`docs/METACITY_Master_Plan.md`](docs/METACITY_Master_Plan.md) | Historical master plan |

**Release tag:** intended `mvp-1.1-unified` after you request a commit + tag (not applied automatically).

## License

MIT License
