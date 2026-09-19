# METACITY — Complete Phase-by-Phase Task List

> **Hand this file to any AI coding assistant.** Every task specifies the exact files, functions, data structures, tests, and acceptance checks so that code is written correctly the first time — no gaps, no guessing.

| Field | Value |
|---|---|
| Project | METACITY |
| Document | Task List v1.0 |
| Date | 19 September 2026 |
| Stack | Python 3.12 + FastAPI (backend) · React + TypeScript + Vite (frontend) |
| Package | `metacity_core` (pure simulation library, no API/DB imports) |
| Hard MVP | End of Phase 3 (MP-22 in Master Plan) |
| Reference docs | `METACITY_DSA_Build_Plan_v3.md` (vision + acceptance) · `METACITY_Backend_Implementation_Plan.md` (API/modules) · `METACITY_Frontend_Implementation_Plan.md` (UI/design) · `METACITY_Master_Plan.md` (execution order) |

---

## How to use this task list

1. **Work phase by phase** — do not skip ahead.
2. Each task has: **what to create**, **exact file paths**, **function signatures**, **what it must do**, and **how to verify**.
3. When a task says "test: ...", write that test and make it pass before moving on.
4. The folder structure under `backend/` and `frontend/` is final — follow it exactly.
5. `metacity_core` (under `backend/core/`) must NEVER import from `api/`, `persistence/`, `jobs/`, or `workers/`.

---

## PHASE 0 — Foundations (MP-01 to MP-04)

### Task 0.1 — Repository scaffold

**Create these files and folders:**

```
METACITY/
├── README.md
├── CONTRIBUTING.md
├── .editorconfig
├── .gitignore
├── Makefile                          # or justfile
├── docker-compose.dev.yml
├── .github/workflows/ci.yml
│
├── backend/
│   ├── pyproject.toml
│   ├── README.md
│   ├── .env.example
│   ├── core/
│   │   ├── __init__.py
│   │   └── version.py
│   ├── api/
│   │   └── __init__.py
│   ├── data/
│   │   ├── templates/
│   │   ├── fixtures/
│   │   ├── generators/
│   │   ├── runs/                    # gitignored
│   │   └── schemas/
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── unit/
│       ├── integration/
│       ├── golden/
│       └── performance/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       └── App.tsx
│
├── docs/
│   └── decisions/                    # ADR folder
│
└── architecture/
```

**`pyproject.toml` must contain:**
```toml
[project]
name = "metacity-core"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.30",
    "pydantic>=2.9",
    "numpy>=2.0",
    "scipy>=1.14",
    "duckdb>=1.1",
    "pyarrow>=17",
]

[project.optional-dependencies]
dev = ["pytest>=8", "hypothesis>=6", "ruff>=0.6", "mypy>=1.11"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["core"]

[tool.pytest.ini_options]
testpaths = ["tests"]
```

**`core/version.py`:**
```python
MODEL_VERSION = "0.1.0"
SCHEMA_VERSION = "1.0.0"
```

**`Makefile` targets:**
```makefile
setup:            # pip install -e ".[dev]" && cd frontend && npm install
dev-backend:      # uvicorn api.main:app --reload --port 8000
dev-frontend:     # cd frontend && npm run dev
dev:              # run both
test:             # pytest && cd frontend && npm test
lint:             # ruff check . && cd frontend && npm run lint
```

**`.github/workflows/ci.yml`:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: pytest -x
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd frontend && npm ci && npm run build
```

**Verify:**
- `cd backend && pip install -e .` succeeds
- `python -c "from core.version import MODEL_VERSION; print(MODEL_VERSION)"` prints `0.1.0`
- `make test` runs (even if 0 tests)
- `cd frontend && npm install && npm run dev` starts Vite

---

### Task 0.2 — CONTRIBUTING.md and ADRs

**`CONTRIBUTING.md` must cover:**
1. Prerequisites: Python 3.12+, Node 20+, git
2. Setup: `make setup`
3. Running: `make dev-backend`, `make dev-frontend`
4. Adding a new algorithm: create `core/algorithms/xxx.py` + `tests/unit/algorithms/test_xxx.py`
5. Adding a new API endpoint: create route in `api/routes/`, schema in `api/schemas/`
6. PR checklist: tests pass, ruff clean, no core→api imports

**Create ADRs in `docs/decisions/`:**

| File | Decision |
|---|---|
| `001-python-backend.md` | Why Python for simulation (NumPy, SciPy, ML, geospatial ecosystem) |
| `002-level1-traffic.md` | Why BPR volume-delay not microscopic car-following for MVP |
| `003-threejs-first.md` | Why Three.js/R3F for synthetic, MapLibre only for real basemaps later |
| `004-sqlite-mvp.md` | Why SQLite + Parquet, not Postgres, for zero-infra MVP |
| `005-no-auth-mvp.md` | Why no authentication for localhost single-user |

Each ADR format:
```markdown
# ADR-001: Python Backend

## Status: Accepted

## Context
[Why this decision was needed]

## Decision
[What we decided]

## Consequences
[What follows from this decision]
```

**Verify:** 5 ADR files exist with correct format.

---

### Task 0.3 — Backend package, settings, structured logging, health

**Create these files:**

**`core/config.py`:**
```python
from dataclasses import dataclass, field

@dataclass
class SimConfig:
    """Simulation parameters — Appendix A defaults."""
    bpr_alpha: float = 0.15
    bpr_beta: float = 4.0
    msa_epsilon: float = 0.01
    msa_max_iter: int = 50
    reassignment_fraction: float = 0.15
    city_tick_minutes: int = 1          # 1 or 5
    evac_tick_seconds: int = 1
    comparison_seeds: int = 10
    snapshot_hz: int = 5                # 2–10
    lane_width_m: float = 3.5
    floor_height_m: float = 3.0
    fire_spread_p: float = 0.05
    panic_threshold: float = 0.7
```

**`core/rng.py`:**
```python
import numpy as np

class SeededRNG:
    """All randomness in the simulation goes through this."""
    def __init__(self, seed: int):
        self.seed = seed
        self._rng = np.random.default_rng(seed)

    @property
    def rng(self) -> np.random.Generator:
        return self._rng

    def child(self, name: str) -> 'SeededRNG':
        """Deterministic child stream for a subsystem."""
        child_seed = hash((self.seed, name)) % (2**31)
        return SeededRNG(child_seed)
```

**`core/clock.py`:**
```python
class SimClock:
    """Simulation clock. Advances in ticks of configurable minutes."""
    def __init__(self, tick_minutes: int = 1):
        self.tick_minutes = tick_minutes
        self.current_tick: int = 0

    @property
    def current_minutes(self) -> int:
        return self.current_tick * self.tick_minutes

    @property
    def current_hours(self) -> float:
        return self.current_minutes / 60.0

    def advance(self) -> int:
        self.current_tick += 1
        return self.current_tick

    @property
    def day_complete(self) -> bool:
        return self.current_minutes >= 1440  # 24 hours

    def reset(self):
        self.current_tick = 0
```

**`api/settings.py`:**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    data_dir: str = "data"
    db_path: str = "data/metacity.db"
    api_port: int = 8000
    worker_count: int = 4
    snapshot_hz: int = 5
    cors_origins: list[str] = ["http://localhost:5173"]
    log_level: str = "info"

    class Config:
        env_file = ".env"
        env_prefix = "METACITY_"
```

**`api/main.py`:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging, json

from api.settings import Settings
from api.routes import health

settings = Settings()

# Structured JSON logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "ts": self.formatTime(record),
            "level": record.levelname.lower(),
            "event": record.getMessage(),
            "module": record.module,
        })

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.basicConfig(level=settings.log_level.upper(), handlers=[handler])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init DB, start worker pool
    logging.info("METACITY API starting")
    yield
    # Shutdown: stop workers
    logging.info("METACITY API stopping")

app = FastAPI(
    title="METACITY API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
```

**`api/routes/health.py`:**
```python
from fastapi import APIRouter
from pathlib import Path
from core.version import MODEL_VERSION, SCHEMA_VERSION
from api.settings import Settings

router = APIRouter(tags=["ops"])
settings = Settings()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_version": MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "data_dir_exists": Path(settings.data_dir).is_dir(),
        "db_path": settings.db_path,
    }
```

**`.env.example`:**
```
METACITY_DATA_DIR=data
METACITY_DB_PATH=data/metacity.db
METACITY_API_PORT=8000
METACITY_WORKER_COUNT=4
METACITY_SNAPSHOT_HZ=5
METACITY_LOG_LEVEL=info
```

**Verify:**
- `uvicorn api.main:app --port 8000` starts
- `GET http://localhost:8000/health` returns JSON with `model_version`, `status: ok`
- Logs are JSON format in console

---

### Task 0.4 — Scene schema contract and JSON Schema

**Create `core/schema/scene.py`:**

The scene JSON must have this structure (enforce via Pydantic):

```python
from pydantic import BaseModel, Field
from typing import Literal

class SceneNode(BaseModel):
    id: str
    x: float                          # metres from origin
    y: float
    type: str = "intersection"        # intersection | dead_end | terminal

class SceneLink(BaseModel):
    id: str
    from_node: str
    to_node: str
    lanes: int = Field(ge=1, le=8, default=2)
    speed_kph: float = Field(ge=5, le=200, default=50)
    capacity_per_lane_per_hour: int = Field(ge=100, le=3000, default=1800)
    road_class: str = "local"         # arterial | collector | local | highway
    oneway: bool = False
    length_m: float | None = None     # auto-calc if None

class SceneFacility(BaseModel):
    id: str
    type: str                         # home | office | factory | school | hospital | shop | park
    zone_id: str
    capacity: int = 100
    x: float
    y: float
    floors: int = 1

class SceneZone(BaseModel):
    id: str
    name: str
    land_use: str                     # residential | commercial | industrial | mixed | public
    population_target: int = 0

class SceneTransitLine(BaseModel):
    id: str
    name: str
    mode: str = "bus"                 # bus | metro
    stop_node_ids: list[str]
    headway_minutes: int = 10

class SceneParameters(BaseModel):
    total_population: int = 1000
    car_ownership_rate: float = 0.5
    simulation_days: int = 1

class Scene(BaseModel):
    schema_version: str = "1.0.0"
    name: str
    description: str = ""
    calibration_status: Literal[
        "synthetic_uncalibrated",
        "partially_calibrated",
        "calibrated"
    ] = "synthetic_uncalibrated"
    bounds: dict = {"width_m": 5000, "height_m": 5000}
    nodes: list[SceneNode]
    links: list[SceneLink]
    zones: list[SceneZone] = []
    facilities: list[SceneFacility] = []
    transit_lines: list[SceneTransitLine] = []
    parameters: SceneParameters = SceneParameters()

    def validate_references(self) -> list[str]:
        """Check that all links reference existing nodes, facilities ref zones, etc."""
        errors = []
        node_ids = {n.id for n in self.nodes}
        for link in self.links:
            if link.from_node not in node_ids:
                errors.append(f"Link {link.id}: from_node {link.from_node} not found")
            if link.to_node not in node_ids:
                errors.append(f"Link {link.id}: to_node {link.to_node} not found")
        zone_ids = {z.id for z in self.zones}
        for fac in self.facilities:
            if fac.zone_id not in zone_ids:
                errors.append(f"Facility {fac.id}: zone_id {fac.zone_id} not found")
        return errors
```

**Create `data/schemas/scene_schema.json`:**
Generate from the Pydantic model: `Scene.model_json_schema()` → write to file. Do this in a small script `backend/scripts/generate_schema.py`.

**Test: `tests/unit/schema/test_scene.py`:**
```python
def test_valid_scene_loads(nexus_city_path):
    scene = Scene.model_validate_json(Path(nexus_city_path).read_text())
    assert scene.schema_version == "1.0.0"
    assert len(scene.validate_references()) == 0

def test_invalid_link_reference_fails():
    scene_data = {... minimal with bad from_node ...}
    scene = Scene.model_validate(scene_data)
    errors = scene.validate_references()
    assert len(errors) > 0

def test_missing_schema_version_uses_default():
    ...
```

**Verify:** Schema validates; invalid scenes rejected; JSON Schema file generated.

---

### Task 0.5 — Hand-craft Nexus City template

**Create `data/templates/nexus_city_baseline.json`:**

A fictional city with:
- **~50 nodes** forming a grid + ring road pattern
- **~80 links** (roads with varied classes: highway, arterial, collector, local)
- **6 zones** (3 residential, 1 commercial, 1 industrial, 1 mixed)
- **~20 facilities** (homes, offices, factory, school, hospital, shops, park)
- **1 transit line** (bus route along main arterial, 6 stops)
- **Parameters:** 1000 population, 0.5 car ownership

The network should have:
- A ring road (highway class, 2 lanes each way, 80 kph)
- Radial arterials connecting center to ring road (60 kph)
- Local streets inside zones (30 kph)
- One obvious bottleneck corridor (for the bypass scenario to fix)
- The commercial zone in the center with offices
- Residential zones on the edges
- Hospital and school placed appropriately

**Create `data/templates/college_campus.json`:**

A building floor plan for evacuation module (Phase 4 — but create the template now):
- Grid of rooms, corridors, stairs
- 3 exits
- ~500 capacity
- Mark walls, floors, exits

**Create `data/templates/README.md`:**
Document the template format and how to author new ones.

**Verify:**
- Both templates pass `Scene.model_validate_json()`
- `validate_references()` returns no errors
- Nexus City has ≥50 nodes, ≥6 zones, ≥1 transit line

---

### Task 0.6 — Schema migration stub

**Create `core/schema/migrate.py`:**
```python
from typing import Any

MIGRATIONS: dict[str, callable] = {
    # "0.9.0→1.0.0": migrate_09_to_10,
}

def migrate_scene(data: dict[str, Any], target_version: str = "1.0.0") -> dict[str, Any]:
    """Chain migrations from scene's version to target."""
    current = data.get("schema_version", "1.0.0")
    if current == target_version:
        return data
    # Chain through MIGRATIONS dict
    raise ValueError(f"No migration path from {current} to {target_version}")
```

**Verify:** Calling with current version returns data unchanged.

---

## PHASE 1 — DSA Algorithms + Core Foundation (MP-05, MP-09–MP-12)

### Task 1.1 — Graph data structure

**Create `core/algorithms/graph.py`:**
```python
class Graph:
    """Adjacency-list weighted directed graph."""

    def __init__(self):
        self._adj: dict[str, dict[str, float]] = {}  # node -> {neighbor: weight}

    def add_node(self, node_id: str) -> None: ...
    def add_edge(self, u: str, v: str, weight: float) -> None: ...
    def remove_edge(self, u: str, v: str) -> None: ...
    def neighbors(self, node_id: str) -> dict[str, float]: ...
    def nodes(self) -> set[str]: ...
    def has_node(self, node_id: str) -> bool: ...
    def has_edge(self, u: str, v: str) -> bool: ...
    def edge_weight(self, u: str, v: str) -> float: ...
    def node_count(self) -> int: ...
    def edge_count(self) -> int: ...
```

**Test: `tests/unit/algorithms/test_graph.py`:**
- Add nodes and edges, verify adjacency
- Remove edge, verify removed
- Non-existent node raises KeyError
- Self-loop handled correctly

---

### Task 1.2 — Binary min-heap

**Create `core/algorithms/heap.py`:**
```python
class MinHeap:
    """Binary min-heap for priority queues."""

    def __init__(self): ...
    def push(self, priority: float, item: Any) -> None: ...
    def pop(self) -> tuple[float, Any]: ...
    def peek(self) -> tuple[float, Any]: ...
    def __len__(self) -> int: ...
    def __bool__(self) -> bool: ...
```

**Test:** Push 1000 random items; pop in sorted order. Push/pop alternating. Empty pop raises.

---

### Task 1.3 — BFS and connected components

**Create `core/algorithms/bfs.py`:**
```python
def bfs(graph: Graph, start: str) -> set[str]:
    """Return all nodes reachable from start."""

def connected_components(graph: Graph) -> list[set[str]]:
    """Return list of connected components (treating directed as undirected)."""

def is_connected(graph: Graph) -> bool:
    """True if all nodes are in one component."""
```

**Test:** Linear chain → 1 component. Disconnected → 2 components. Single node → reachable = {itself}.

---

### Task 1.4 — Union-Find

**Create `core/algorithms/union_find.py`:**
```python
class UnionFind:
    """Disjoint set with path compression and union by rank."""

    def __init__(self, elements: list[str]): ...
    def find(self, x: str) -> str: ...
    def union(self, x: str, y: str) -> bool: ...  # returns True if merged
    def connected(self, x: str, y: str) -> bool: ...
    def component_count(self) -> int: ...
```

**Test:** Union(a,b) → find(a)==find(b). Component count decreases. Already-connected union returns False. Property test with hypothesis.

---

### Task 1.5 — Dijkstra

**Create `core/algorithms/dijkstra.py`:**
```python
def dijkstra(
    graph: Graph,
    source: str,
    target: str | None = None
) -> tuple[dict[str, float], dict[str, str | None]]:
    """
    Returns (distances, predecessors).
    Uses our MinHeap, not heapq.
    If target given, can early-stop.
    """
```

**Test:**
- Simple 3-node triangle: correct shortest path
- Disconnected target: distance = infinity
- Property test (hypothesis): Dijkstra distance ≤ any alternative path
- Large random graph (100 nodes): completes in <1s

---

### Task 1.6 — A*

**Create `core/algorithms/astar.py`:**
```python
def astar(
    graph: Graph,
    source: str,
    target: str,
    heuristic: Callable[[str, str], float]
) -> tuple[float, list[str]]:
    """Returns (distance, path). Uses our MinHeap."""
```

**Test:**
- A* result == Dijkstra result on same graph (correctness)
- A* visits fewer nodes than Dijkstra when heuristic is good
- Zero heuristic degrades to Dijkstra

---

### Task 1.7 — BPR volume-delay

**Create `core/algorithms/bpr.py`:**
```python
def bpr_travel_time(
    free_flow_time: float,
    volume: float,
    capacity: float,
    alpha: float = 0.15,
    beta: float = 4.0
) -> float:
    """t = t0 * (1 + alpha * (v/c)^beta)"""

def bpr_travel_time_array(
    free_flow_times: np.ndarray,
    volumes: np.ndarray,
    capacities: np.ndarray,
    alpha: float = 0.15,
    beta: float = 4.0
) -> np.ndarray:
    """Vectorised version for all links at once."""
```

**Test:**
- Volume=0 → returns free_flow_time
- Volume=capacity → returns t0 * (1 + alpha)
- Volume > capacity → returns > t0 * (1 + alpha)
- Array version matches scalar loop

---

### Task 1.8 — Multinomial logit

**Create `core/algorithms/logit.py`:**
```python
def multinomial_logit(utilities: dict[str, float]) -> dict[str, float]:
    """
    Given {mode: utility}, return {mode: probability}.
    P(mode) = exp(U_mode) / sum(exp(U_j) for all j)
    """

def choose_mode(utilities: dict[str, float], rng: np.random.Generator) -> str:
    """Draw one mode from probabilities."""
```

**Test:**
- All equal utilities → equal probabilities
- Very high utility → probability ≈ 1.0
- Probabilities sum to 1.0
- choose_mode returns valid mode

---

### Task 1.9 — Paired statistics

**Create `core/algorithms/stats_paired.py`:**
```python
def paired_difference_ci(
    baseline_values: list[float],
    scenario_values: list[float],
    confidence: float = 0.95
) -> tuple[float, float, float, str]:
    """
    Returns (mean_diff, ci_low, ci_high, label).
    label: "distinguishable" if CI doesn't cross zero, else "inconclusive".
    """
```

**Test:**
- Identical lists → mean_diff=0, label="inconclusive"
- Clearly different lists → label="distinguishable"
- Lists of length 1 → works without error (wide CI)

---

### Task 1.10 — Additional algorithms (bridges, max-flow, betweenness, spatial index, CA, DES)

**Create these files (can be stubs for Phase 4+ but tests for bridges needed for MVP DSA demos):**

| File | Algorithm | MVP or Later |
|---|---|---|
| `core/algorithms/bridges.py` | Tarjan bridge detection | MVP (DSA demo) |
| `core/algorithms/betweenness.py` | Betweenness centrality | MVP (DSA demo) |
| `core/algorithms/max_flow.py` | Edmonds-Karp | Phase 4 |
| `core/algorithms/grid_graph.py` | Grid → graph converter | Phase 4 |
| `core/algorithms/spatial_index.py` | Grid-based spatial index | Phase 4 |
| `core/algorithms/ca.py` | Cellular automaton step | Phase 4 |
| `core/algorithms/des_scheduler.py` | Discrete-event scheduler | Phase 4 |

**For MVP, implement and test `bridges.py` and `betweenness.py`:**

```python
# bridges.py
def find_bridges(graph: Graph) -> list[tuple[str, str]]:
    """Tarjan's bridge detection. Returns edges whose removal disconnects."""

# betweenness.py
def betweenness_centrality(graph: Graph) -> dict[str, float]:
    """Brandes algorithm. Returns {node: centrality_score}."""
```

**Test:**
- Bridge on a tree → all edges are bridges
- Bridge on a cycle → no bridges
- Betweenness: center node in star graph has highest centrality

---

### Task 1.11 — World container and network builder

**Create `core/world.py`:**
```python
@dataclass
class World:
    """Container for all simulation state."""
    network: 'RoadNetwork'
    agents: list['Person']
    facilities: list['Facility']
    zones: list['Zone']
    transit_lines: list['TransitLine']
    clock: SimClock
    rng: SeededRNG
    config: SimConfig
    parameters: dict
    calibration_status: str
```

**Create `core/network/model.py`:**
```python
@dataclass
class RoadNode:
    id: str
    x: float
    y: float

@dataclass
class RoadLink:
    id: str
    from_node: str
    to_node: str
    lanes: int
    speed_kph: float
    capacity_per_lane_per_hour: int
    length_m: float
    road_class: str
    oneway: bool

    @property
    def total_capacity_per_hour(self) -> int:
        return self.lanes * self.capacity_per_lane_per_hour

    @property
    def free_flow_time_minutes(self) -> float:
        return (self.length_m / 1000) / self.speed_kph * 60

class RoadNetwork:
    """Road network backed by our DSA Graph."""
    def __init__(self): ...
    def add_node(self, node: RoadNode) -> None: ...
    def add_link(self, link: RoadLink) -> None: ...
    def get_graph(self) -> Graph: ...
    def get_link(self, link_id: str) -> RoadLink: ...
    def get_node(self, node_id: str) -> RoadNode: ...
    def all_links(self) -> list[RoadLink]: ...
    def all_nodes(self) -> list[RoadNode]: ...
```

**Create `core/network/builder.py`:**
```python
def build_network_from_scene(scene: Scene) -> RoadNetwork:
    """Convert scene JSON data to a RoadNetwork object."""
    # Auto-calculate length_m if not provided (Euclidean from node coords)
```

**Create `core/network/validation.py`:**
```python
def validate_network(network: RoadNetwork) -> list[str]:
    """Check connectivity, dangling nodes, capacity sanity."""
```

**Test:**
- Build from Nexus City → all links loaded, correct count
- Validate connected network → no errors
- Break a link → validation catches it

---

### Task 1.12 — Population generator and agents

**Create `core/population/generator.py`:**
```python
def generate_population(
    scene: Scene,
    rng: SeededRNG
) -> list[Person]:
    """Create households and persons from scene zones/facilities."""
```

**Create `core/agents/person.py`:**
```python
@dataclass
class Person:
    id: str
    household_id: str
    age_group: str              # child | student | adult | senior
    employment: str             # worker | student | unemployed | retired
    home_facility_id: str
    work_facility_id: str | None
    has_car: bool
    has_transit_pass: bool
    daily_plan: list[Activity]
    current_location: str       # facility_id or link_id
    current_activity_idx: int
    mode_preference: dict[str, float]  # mode → weight
```

**Create `core/activity/plans.py`:**
```python
@dataclass
class Activity:
    type: str                   # home | work | school | shop | park | lunch | library
    facility_id: str
    start_minute: int
    duration_minutes: int

PLAN_TEMPLATES = {
    "worker":    [...],  # home(0-480) → work(480-720) → lunch(720-780) → work(780-1020) → shop(1020-1080) → home(1080-1440)
    "student":   [...],  # home → school → lunch → library → home
    "retired":   [...],  # home → park → market → home
    "shift":     [...],  # home → factory(night) → home
    "caregiver": [...],  # home → school_drop → market → school_pick → home
}

def generate_daily_plan(person: Person, facilities: list, rng: SeededRNG) -> list[Activity]:
    """Pick template by employment, assign facilities, add time jitter."""
```

**Create `core/activity/scheduler.py`:**
```python
def advance_activities(agents: list[Person], current_minute: int) -> list[TripRequest]:
    """Check each agent's plan; if time for next activity, create a TripRequest."""
```

**Test:**
- Generate 200 agents from Nexus City → all have valid plans
- Same seed → same agents

---

### Task 1.13 — Runner and golden test harness

**Create `core/runner.py`:**
```python
@dataclass
class SimResult:
    run_id: str
    seed: int
    model_version: str
    schema_version: str
    config: SimConfig
    calibration_status: str
    ticks_completed: int
    kpis: dict[str, float]         # metric_name → value
    equilibrium_meta: dict | None  # method, final_gap, iterations (Phase 2)
    link_metrics: list[dict]       # per-link: id, volume, vc_ratio, travel_time

def run_replication(
    scene: Scene,
    seed: int,
    config: SimConfig | None = None,
) -> SimResult:
    """
    Single replication entry point.
    1. Build world from scene
    2. Generate population
    3. For each tick until day complete:
       a. Advance activities → trip requests
       b. Route trips (Dijkstra on current costs)
       c. Assign volumes to links
       d. Update congested times (BPR)
    4. Compute KPIs
    5. Return SimResult
    """
```

**Create `core/metrics/kpis.py`:**
```python
def compute_kpis(world: World, result_data: dict) -> dict[str, float]:
    """
    Returns:
    - avg_travel_time_min
    - total_delay_veh_hours
    - max_vc_ratio
    - mean_vc_ratio
    - total_vehicle_km
    - transit_ridership (if transit exists)
    """
```

**Create `tests/golden/test_seed_repro.py`:**
```python
def test_same_seed_same_result():
    """Run seed=42 twice → identical KPIs."""
    r1 = run_replication(load_nexus_city(), seed=42)
    r2 = run_replication(load_nexus_city(), seed=42)
    assert r1.kpis == r2.kpis

def test_different_seed_different_result():
    """Run seed=42 vs seed=99 → different KPIs (usually)."""
    r1 = run_replication(load_nexus_city(), seed=42)
    r2 = run_replication(load_nexus_city(), seed=99)
    assert r1.kpis != r2.kpis
```

**Verify:** Golden test passes. Runner completes a full day without error.

---

## PHASE 2 — Traffic Realism (MP-16 to MP-18)

### Task 2.1 — Transport routing facade

**Create `core/transport/routing.py`:**
```python
def find_route(
    network: RoadNetwork,
    origin_node: str,
    dest_node: str,
    congested_times: dict[str, float] | None = None,
    use_astar: bool = True
) -> tuple[float, list[str]]:
    """Returns (total_time, list_of_link_ids). Uses A* with Euclidean heuristic."""
```

### Task 2.2 — Assignment and congestion

**Create `core/transport/assignment.py`:**
```python
def assign_trips_to_links(
    trips: list[RoutedTrip],
    network: RoadNetwork
) -> dict[str, float]:
    """Returns {link_id: total_volume}."""
```

**Create `core/transport/congestion.py`:**
```python
def update_congested_times(
    network: RoadNetwork,
    volumes: dict[str, float],
    config: SimConfig
) -> dict[str, float]:
    """Returns {link_id: congested_travel_time} using BPR."""
```

### Task 2.3 — Equilibrium (MSA)

**Create `core/transport/equilibrium.py`:**
```python
@dataclass
class EquilibriumResult:
    method: str                    # "MSA"
    final_gap: float
    iterations: int
    converged: bool

def run_equilibrium(
    world: World,
    trips: list[TripRequest],
    config: SimConfig
) -> EquilibriumResult:
    """
    Method of Successive Averages:
    1. All-or-nothing assignment on free-flow
    2. Loop:
       a. Compute congested times (BPR)
       b. Re-route all trips on congested network
       c. Blend: new_volume = (1/n)*new + (1-1/n)*old
       d. Compute gap
       e. Stop if gap < epsilon or max_iter
    3. Return EquilibriumResult
    """
```

**Test:**
- Toy 2-route network: MSA splits traffic between routes
- Gap decreases over iterations
- Converges in < 50 iterations on small network

### Task 2.4 — Mode choice and transit

**Create `core/transport/mode_choice.py`:**
```python
def compute_mode_utilities(
    person: Person,
    trip: TripRequest,
    network: RoadNetwork,
    transit_network: TransitNetwork,
    config: SimConfig
) -> dict[str, float]:
    """
    Modes: car, bus, metro, walk.
    Utility = β_time * time + β_cost * cost + β_wait * wait + constant
    """

def choose_mode_for_trip(
    person: Person,
    trip: TripRequest,
    ...
) -> str:
    """Uses logit probabilities + RNG draw."""
```

**Create `core/transit/network.py`:**
```python
class TransitNetwork:
    def __init__(self): ...
    def add_line(self, line: TransitLine): ...
    def get_travel_time(self, from_node: str, to_node: str) -> float | None: ...
    def get_wait_time(self, line_id: str) -> float: ...
```

### Task 2.5 — Time-dependent demand profiles

**Create `core/population/demand_profiles.py`:**
```python
DEMAND_PROFILES = {
    "am_peak":  {"hours": (7, 9),   "share": 0.35},
    "midday":   {"hours": (9, 16),  "share": 0.20},
    "pm_peak":  {"hours": (16, 19), "share": 0.35},
    "evening":  {"hours": (19, 22), "share": 0.10},
}

def get_departure_time(
    activity: Activity,
    profile_name: str,
    rng: SeededRNG
) -> int:
    """Jitter departure within the profile window."""
```

### Task 2.6 — Snapshot builder

**Create `core/snapshot/builder.py`:**
```python
@dataclass
class SnapshotFrame:
    run_id: str
    t: int                              # current minute
    progress: float                     # 0.0–1.0
    link_metrics: list[dict]            # [{id, volume, vc, tt_min}]
    agents_sample: list[dict]           # [{id, x, y, mode}] — sampled, not all
    flags: dict                         # {equilibrium_iter, ...}

def build_snapshot(
    world: World,
    run_id: str,
    max_agents: int = 500
) -> SnapshotFrame:
    """Rate-limited snapshot. Sample agents, not full dump."""
```

**Verify:**
- AM peak has higher volumes than midday
- Transit ridership > 0 when bus line exists
- Equilibrium gap recorded in result metadata

---

## PHASE 3 — MVP Evidence & Polish (MP-19 to MP-22)

### Task 3.1 — Persistence layer

**Create `persistence/db.py`:**
```python
import sqlite3

def init_db(db_path: str) -> sqlite3.Connection:
    """Create tables if not exist: projects, scenarios, runs, comparisons."""
```

**Create `persistence/models.py`:**
```python
# Table definitions:
# projects: id, name, description, scene_json_path, config_profile, created_at, updated_at
# scenarios: id, project_id, name, diff_json, created_at
# runs: id, scenario_id, seed, status, created_at, completed_at, error_msg
# comparisons: id, baseline_run_ids, scenario_run_ids, result_json, created_at
```

**Create `persistence/repositories/` with CRUD for each entity.**

**Create `persistence/results_writer.py`:**
```python
def write_run_result(run_id: str, result: SimResult, data_dir: str) -> None:
    """Write meta.json + kpis.parquet + equilibrium.json under data/runs/{run_id}/"""
```

### Task 3.2 — Job manager and workers

**Create `jobs/manager.py`:**
```python
class JobManager:
    def __init__(self, pool_size: int): ...
    def enqueue(self, run_config: RunConfig) -> str: ...  # returns run_id
    def get_status(self, run_id: str) -> str: ...
    def on_startup(self): ...     # scan for orphaned 'running' → 'interrupted'
```

**Create `workers/replication_worker.py`:**
```python
def worker_run_replication(run_config: RunConfig) -> None:
    """Load scene → core.runner → write results → publish progress."""
```

### Task 3.3 — Full API surface (MVP)

**Create these route modules in `api/routes/`:**

| Route file | Endpoints |
|---|---|
| `projects.py` | POST `/projects`, GET `/projects`, GET `/projects/{id}`, POST `/projects/{id}/load_template` |
| `scenes.py` | GET `/projects/{id}/scene`, POST `/projects/{id}/scene/validate` |
| `templates.py` | GET `/templates` |
| `scenarios.py` | POST `/scenarios`, GET `/scenarios/{id}`, GET `/projects/{id}/scenarios`, POST `/scenarios/{id}/validate` |
| `runs.py` | POST `/runs` (with seeds list), GET `/runs/{id}`, GET `/runs/{id}/metrics` |
| `comparisons.py` | POST `/comparisons`, GET `/comparisons/{id}` |
| `reports.py` | GET `/reports/{comparison_id}` (returns HTML) |
| `network_tools.py` | GET `/projects/{id}/connectivity`, GET `/projects/{id}/bridges` |

### Task 3.4 — WebSocket snapshot stream

**Create `api/ws/runs_stream.py`:**
```python
@router.websocket("/runs/{run_id}/stream")
async def run_stream(websocket: WebSocket, run_id: str):
    """Stream SnapshotFrames at capped Hz. Drop old frames if client slow."""
```

### Task 3.5 — Scenario engine

**Create `scenarios/ops_catalog.py`:**
```python
SCENARIO_OPS = {
    "add_link": {...},
    "remove_link": {...},
    "set_lanes": {...},
    "set_speed": {...},
    "set_capacity": {...},
    "add_facility": {...},
    "close_link": {...},
    "add_node": {...},
}
```

**Create `scenarios/applier.py`:**
```python
def apply_scenario(scene: Scene, diff: list[dict]) -> Scene:
    """Apply ordered ops to scene. Return modified copy."""
```

**Create `scenarios/validator.py`:**
```python
def validate_scenario(scene: Scene, diff: list[dict]) -> list[str]:
    """Semantic checks: nodes exist, capacity > 0, network stays connected."""
```

**Create `scenarios/presets.py`:**
```python
BYPASS_PRESET = {
    "name": "Eastern Highway Bypass",
    "description": "4-lane bypass east of ring road to relieve bottleneck",
    "ops": [
        {"op": "add_node", "id": "N_BP1", "x": ..., "y": ...},
        {"op": "add_node", "id": "N_BP2", "x": ..., "y": ...},
        {"op": "add_link", "id": "L_BP1", "from_node": "N_BP1", "to_node": "N_BP2",
         "lanes": 4, "speed_kph": 80, "road_class": "highway"},
        # ... connect to existing network nodes
    ]
}
```

### Task 3.6 — Comparison engine

**Create `comparison/pairing.py`:**
```python
def pair_runs_by_seed(baseline_runs: list, scenario_runs: list) -> list[tuple]:
    """Match runs by seed value."""
```

**Create `comparison/statistics.py`:**
```python
def compute_comparison(
    baseline_results: list[SimResult],
    scenario_results: list[SimResult]
) -> ComparisonResult:
    """
    For each KPI:
    - Compute paired differences
    - Mean, 95% CI, distinguishable/inconclusive label
    Returns ComparisonResult with badge and assumptions.
    """
```

**Create `comparison/mechanism.py`:**
```python
def trace_mechanisms(
    baseline_results: list[SimResult],
    scenario_results: list[SimResult],
    top_n: int = 3
) -> list[str]:
    """MVP-lite: identify top-3 drivers of KPI changes."""
```

### Task 3.7 — HTML report generator

**Create `reports/html_builder.py`:**
```python
def generate_html_report(comparison: ComparisonResult) -> str:
    """
    Sections: Title, model_version, calibration badge, seeds,
    parameter summary, KPI table with CI, mechanism list,
    disclaimer, screenshot placeholders.
    """
```

### Task 3.8 — Frontend MVP (all screens)

Build these pages following the Frontend Implementation Plan:

| Page | Route | Key components |
|---|---|---|
| Welcome | `/` | Brand, pitch, CTAs |
| Project Dashboard | `/projects` | Project cards, search, create |
| New Project Wizard | `/projects/new` | 3-step stepper with template cards |
| Project Overview | `/projects/:id` | Status, shortcuts, calibration badge |
| Workspace | `/projects/:id/workspace` | Map canvas, mode switcher, sim strip, layers, inspector |
| Scenario Library | `/projects/:id/scenarios` | Table, empty state with bypass preset |
| Scenario Builder | `/projects/:id/scenarios/:id` | Change list, preview, validate, run |
| Runs | `/projects/:id/runs` | Job monitoring table |
| Run Detail | `/projects/:id/runs/:id` | KPIs, meta, equilibrium |
| Comparison Hub | `/projects/:id/compare` | Pick runs, create comparison |
| Comparison Result | `/projects/:id/compare/:id` | CI table, charts, mechanisms, badge |
| Settings | `/settings` | API URL, snapshot Hz, reduced motion |
| Assumptions | `/docs/assumptions` | Claims policy |

**Frontend must include:**
- Zustand stores: projectStore, sceneStore, workspaceStore, simStore, scenarioStore, runStore, compareStore, uiStore
- API client (`shared/lib/api/client.ts`)
- WebSocket client (`shared/lib/ws/client.ts`)
- R3F map scene with road layer, building layer, agent layer, congestion colours
- Sim control strip: play/pause/step/reset/speed(1x-100x)/seed
- CalibrationBadge component shown everywhere
- Keyboard shortcuts (Space, Esc, 1-4, L, I, Ctrl+S, Ctrl+Z, 2/3, ?)
- First-run onboarding overlay (4 steps)
- Road editor tools: select, add node, add link, set properties, delete, validate

### Task 3.9 — MVP acceptance test

Run through the **Flagship Demonstration** manually:

1. ✅ Load Nexus City template (< 10 seconds)
2. ✅ Show baseline congestion colours (2D map)
3. ✅ Run Scenario B (4-lane bypass) with ≥5 seeds
4. ✅ Display comparison table with CI + `synthetic_uncalibrated` badge
5. ✅ Show MVP-lite mechanism trace (top-3)
6. ✅ Toggle basic 3D
7. ✅ Open HTML report with assumptions
8. ✅ ≥3 DSA demos runnable (pathfinding, BPR/MSA, bridges)

**Tag release: `mvp-1.0`**

---

## PHASE 4 — Evacuation & Hospital (MP-23, MP-24)

### Task 4.1 — Grid graph and fire CA

Implement `core/evacuation/grid.py`, `fire.py`, `smoke.py`, `crowd.py`, `stress.py`, `runner.py` as specified in Backend Plan §5.9.

### Task 4.2 — Hospital DES

Implement `core/hospital/resources.py`, `triage.py`, `flow.py`, `runner.py` as specified in Backend Plan §5.10.

### Task 4.3 — Module registry and API

Create `GET /modules` endpoint. Frontend shows nav items dynamically.

### Task 4.4 — Evacuation and Hospital UI

Create frontend workspace pages for evacuation (floor plan, fire start, play, KPIs) and hospital (beds/staff config, surge, queue charts).

---

## PHASE 5 — 3D Polish (MP-25)

### Task 5.1 — Walkthrough controls, LOD, day/night, split-view
### Task 5.2 — Mini-map, URL deep links, demo mode
### Task 5.3 — Drag-drop scene import, embeddable comparison HTML

---

## PHASE 6 — Land Use & Utilities (MP-26)

### Task 6.1 — Year loop (accessibility → housing shift)
### Task 6.2 — Utility demand (electricity/water by zone)
### Task 6.3 — Traffic CO2 emissions
### Task 6.4 — Warm-start scenario runs
### Task 6.5 — Sensitivity analysis sweeper
### Task 6.6 — Accessibility heatmap layer
### Task 6.7 — Project ZIP archive export/import
### Task 6.8 — GeoJSON export

---

## PHASE 7 — Real Data (MP-27, MP-28)

### Task 7.1 — OSM → scene converter (OSMnx + GeoPandas)
### Task 7.2 — GTFS transit import
### Task 7.3 — CRS helpers (lon/lat ↔ local metres)
### Task 7.4 — ODbL attribution (mandatory in UI and reports)
### Task 7.5 — MapLibre basemap integration
### Task 7.6 — Calibration engine (observed counts → fit → error report)
### Task 7.7 — Calibration status promotion UI

---

## PHASE 8 — City Disasters (MP-29)

### Task 8.1 — Event engine (flood, outage, bridge closure)
### Task 8.2 — Isolation/reachability KPIs using BFS/components
### Task 8.3 — Disaster presets and UI triggers

---

## PHASE 9 — ML & AI Planner (MP-30, optional)

### Task 9.1 — Surrogate model (train from past runs)
### Task 9.2 — Planner candidates (greedy/hill-climb)
### Task 9.3 — Mandatory full-sim verification of top picks
### Task 9.4 — Planner UI (assistive only, LLM out of sim loop)

---

## PHASE 10 — Production Hardening (MP-30 continued)

### Task 10.1 — Docker Compose (api + worker + frontend containers)
### Task 10.2 — Optional PostgreSQL migration
### Task 10.3 — Optional authentication
### Task 10.4 — Incremental snapshot diffs (if bandwidth issue)
### Task 10.5 — Web Worker for snapshot processing (if FPS issue)
### Task 10.6 — API cookbook with curl examples
### Task 10.7 — Stakeholder preset pack
### Task 10.8 — Data backup script

---

## Dependency rules (NEVER violate)

```
core/          ✗ must NOT import api/, jobs/, persistence/, workers/
algorithms/    ✗ must NOT import transport/ or api/
api/           ✓ may import services, persistence, jobs
workers/       ✓ may import core, persistence, jobs
scenarios/     ✓ may import core schema + network
comparison/    ✓ may import metrics helpers; not api
ml/ planner/   ✓ may call core.runner; must NOT mutate agent brains via LLM
```

Direction: **inward toward core**, never outward from core.

---

## Golden rules for all code

1. **Every function has a docstring** explaining what it does, parameters, and return value.
2. **Every algorithm has a test file** in `tests/unit/algorithms/`.
3. **Same seed = same result** (single-thread). This is tested by golden tests.
4. **Calibration badge appears on every comparison and report** — never hidden.
5. **No hardcoded magic numbers** — all parameters come from `SimConfig` or scene JSON.
6. **Type hints on all function signatures** (Python) and strict TypeScript on frontend.
7. **Structured JSON logging** — no `print()` statements.
8. **Error messages are actionable** — tell the user what went wrong and what to do.

---

*This task list is the companion to `METACITY_Master_Plan.md`. Follow the Master Plan for execution order and checkboxes; follow this file for exact implementation detail.*
