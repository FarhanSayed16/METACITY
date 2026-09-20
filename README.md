# METACITY

Open-source urban simulation: macroscopic traffic (BPR + MSA), scenario comparison with CI, and a React Three Fiber workspace.

**Release:** `mvp-1.0` (MP-22 gate)

## Flagship walkthrough (under 15 minutes)

1. **Start stack** — `docker-compose up --build` (api + **worker** + frontend) or run backend + frontend locally (see below).
2. **Onboarding** — Open http://localhost:5173 and complete the short tour.
3. **Project** — Create a project from the **Nexus City** template (or a preset such as Highway Bypass).
4. **Baseline run** — On the project overview, run a scenario with **seeds 0–9**. Open the workspace map; congestion colours update live.
5. **Scenario** — Apply a preset (e.g. Bypass / Flood) or build ops; use **Preview on map** for ghost overlay; run seeds again.
6. **Compare** — Open Compare for paired CI stats, trust badge, and mechanism trace. Download the **HTML report** (includes stored screenshots if you captured any with the Camera tool).
7. **Algorithms** — Visit **Algorithm Showcase** (`/dsa`) and run the three live demos: A*, MSA/BPR, and Brandes + bridges.

## Features
- Traffic equilibrium via MSA smoothing and BPR volume-delay
- Multi-seed comparison with 95% CI and calibration badges
- 2D orthographic + 3D network editing, scenario ghost preview
- Evacuation and hospital surge modules
- OSM import (schema-aligned), disasters (flood / outage / close_link)

## Getting Started

### Docker (recommended)
```bash
docker-compose up --build
# frontend http://localhost:5173  ·  API http://localhost:8000  ·  worker polls pending runs
```

### Local Development

1. **Backend**:
   ```bash
   cd backend
   pip install -e .
   uvicorn api.main:app --reload
   # optional second terminal: python -m workers.pool
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Keyboard Shortcuts
- **Space** — Play / Pause
- **1 / 2 / 3** — Select / Add node / Draw link
- **4** — Toggle 2D / 3D
- **L** — Layers / congestion legend
- **I** — Inspector panel
- **Ctrl+S** — Save scene
- **?** — Shortcuts help
- **Ctrl+Z / Ctrl+Y** — Undo / Redo
- **Delete** — Delete selection
- **Esc** — Deselect / close help

## Documentation
- OpenAPI: http://localhost:8000/docs
- Master plan & audit: `docs/METACITY_Master_Plan.md`, `docs/METACITY_Full_System_Audit_MP01_MP30.md`

## License
MIT License
