# METACITY — Architecture Diagrams (PlantUML)

Light-themed **Civic Steel** diagrams aligned with Build Plan v3 and Backend/Frontend plans.

| File | Diagram | What it shows |
|---|---|---|
| `01_system_architecture.puml` | **System Architecture** | User → Web → API/WS → Jobs → Core → Storage |
| `02_tech_stack.puml` | **Technical Stack** | Frontend, communication, backend, data & ops technologies |
| `03_backend_modules.puml` | **Backend Modules** | Layers F→E→C→B→D with allowed dependency arrows |
| `04_frontend_structure.puml` | **Frontend Structure** | Shell, routes, workspace modes, feature modules, shared UI |
| `05_simulation_dataflow.puml` | **Simulation Data Flow** | Template → multi-seed run → scenario → comparison → trust badge |

## How to generate images

### Option A — PlantUML CLI
```bash
plantuml architecture/*.puml
```

### Option B — VS Code / Cursor
Install a PlantUML extension, open a `.puml` file, preview / export PNG or SVG.

### Option C — Online
Paste file contents into [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)

## Colour legend (shared)

| Colour | Hex | Use |
|---|---|---|
| App background | `#F4F6F8` | Canvas |
| Teal accent | `#2A9D8F` | User paths, persistence, success actions |
| Steel blue | `#3D7EA6` | API / realtime |
| Warm accent | `#C45C26` | Simulation execution |
| Slate | `#5A6A7A` / `#1B2430` | Structure, chrome text |

## Notes

- Diagrams are **plan-level** (no implementation code).
- Prefer **SVG** export for docs; PNG for slides.
- Keep arrows and package boundaries if you edit — they encode real dependency rules (especially `03_backend_modules.puml`).
