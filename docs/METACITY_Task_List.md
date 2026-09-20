# METACITY — Complete Phase-by-Phase Task List

> **Hand this file to any AI coding assistant.** Every task specifies the exact files, functions, data structures, tests, and acceptance checks so that code is written correctly the first time — no gaps, no guessing.

| Field | Value |
|---|---|
| Project | METACITY |
| Document | Task List v1.0 |
| Date | 19 September 2026 |
| Stack | Python 3.12 + FastAPI (backend) · React + TypeScript + Vite (frontend) |
| Package | `metacity-core` (pip) / import `core` (pure simulation library, no API/DB imports) |
| Hard MVP | End of Phase 3 (MP-22 in Master Plan) |
| Reference docs | `METACITY_DSA_Build_Plan_v3.md` (vision + acceptance) · `METACITY_Backend_Implementation_Plan.md` (API/modules) · `METACITY_Frontend_Implementation_Plan.md` (UI/design) · `METACITY_Master_Plan.md` (execution order) |

---

## How to use this task list

1. **Work phase by phase** — do not skip ahead.
2. Each task has: **what to create**, **exact file paths**, **function signatures**, **what it must do**, and **how to verify**.
3. When a task says "test: ...", write that test and make it pass before moving on.
4. The folder structure under `backend/` and `frontend/` is final — follow it exactly.
5. `core` (under `backend/core/`, pip package `metacity-core`) must NEVER import from `api/`, `persistence/`, `jobs/`, or `workers/`.

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
from core.algorithms.paths import dijkstra, a_star
from core.algorithms.graph import DirectedGraph

def find_route(
    graph: DirectedGraph,
    origin_node: str,
    dest_node: str,
    congested_times: dict[str, float] | None = None,
    use_astar: bool = True
) -> tuple[float, list[str]]:
    """
    Returns (total_time_minutes, list_of_node_ids_on_path).
    If congested_times is provided, use those as edge weights instead of free-flow.
    Uses A* with Euclidean heuristic when use_astar=True, else Dijkstra.
    """

def find_routes_batch(
    graph: DirectedGraph,
    od_pairs: list[tuple[str, str]],
    congested_times: dict[str, float] | None = None,
) -> list[tuple[float, list[str]]]:
    """Route multiple OD pairs. Returns list of (time, path)."""
```

**Test:**
- Route across Nexus City grid → valid path, correct travel time
- With congested_times on bottleneck → route avoids it

### Task 2.2 — Assignment and congestion

**Create `core/transport/assignment.py`:**
```python
from core.algorithms.graph import DirectedGraph

def all_or_nothing_assignment(
    graph: DirectedGraph,
    trips: list[dict],  # [{origin, dest, volume}]
    congested_times: dict[str, float] | None = None,
) -> dict[str, float]:
    """
    Route each trip on shortest path, accumulate volume on each link.
    Returns {link_id: total_volume_vehicles_per_hour}.
    """

def get_link_id_for_edge(graph: DirectedGraph, u: str, v: str) -> str:
    """Extract link_id from edge attributes."""
    edge = graph.get_edge_data(u, v)
    return edge.get("link_id", f"{u}->{v}") if edge else f"{u}->{v}"
```

**Create `core/transport/congestion.py`:**
```python
from core.algorithms.bpr import bpr_travel_time
from core.algorithms.graph import DirectedGraph

def update_congested_times(
    graph: DirectedGraph,
    volumes: dict[str, float],
    alpha: float = 0.15,
    beta: float = 4.0,
) -> dict[str, float]:
    """
    For each link, compute BPR congested travel time from volume and capacity.
    Returns {link_id: congested_travel_time_minutes}.
    Also updates edge weights in the graph in-place for re-routing.
    """
    congested = {}
    for u, v, attr in graph.edges:
        link_id = attr.get("link_id", f"{u}->{v}")
        vol = volumes.get(link_id, 0.0)
        cap = attr.get("capacity", 1800)
        ff_time = attr.get("free_flow_time_m", 1.0)
        ct = bpr_travel_time(ff_time, vol, cap, alpha, beta)
        congested[link_id] = ct
        # Update graph weight for next routing iteration
        attr["weight"] = ct
    return congested
```

**Test:**
- Assign 2000 vehicles to 1-lane bottleneck (cap=800) → BPR time >> free-flow
- Zero volume → congested time == free-flow time

### Task 2.3 — Equilibrium (MSA)

**Create `core/transport/equilibrium.py`:**
```python
from dataclasses import dataclass
from core.algorithms.graph import DirectedGraph
from core.transport.assignment import all_or_nothing_assignment
from core.transport.congestion import update_congested_times

@dataclass
class EquilibriumResult:
    method: str                    # "MSA"
    final_gap: float
    iterations: int
    converged: bool
    volumes_per_link: dict[str, float]
    congested_times: dict[str, float]

def compute_relative_gap(
    old_volumes: dict[str, float],
    new_volumes: dict[str, float]
) -> float:
    """
    Relative gap = sum(|new - old|) / max(1, sum(old)).
    Measures how much the assignment changed between iterations.
    """

def run_msa_equilibrium(
    graph: DirectedGraph,
    trips: list[dict],
    max_iterations: int = 50,
    epsilon: float = 0.01,
    alpha: float = 0.15,
    beta: float = 4.0,
) -> EquilibriumResult:
    """
    Method of Successive Averages:
    1. Iteration 0: All-or-nothing assignment on free-flow costs
    2. Loop n = 1, 2, ...:
       a. Update congested times using BPR on current volumes
       b. All-or-nothing on congested costs → new_volumes
       c. Blend: volumes = (1/n)*new_volumes + (1 - 1/n)*old_volumes
       d. Compute relative gap
       e. Stop if gap < epsilon or n >= max_iterations
    3. Return EquilibriumResult
    """
```

**Test (`tests/unit/transport/test_equilibrium.py`):**
```python
def test_msa_gap_decreases():
    """On a 2-route parallel network, gap should decrease over iterations."""

def test_msa_converges_on_toy():
    """On a simple network, MSA converges in < 30 iterations."""

def test_msa_splits_traffic_between_routes():
    """Two parallel routes with equal capacity → ~50/50 split at equilibrium."""
```

### Task 2.4 — Mode choice and transit network

**Create `core/transport/mode_choice.py`:**
```python
from core.algorithms.logit import multinomial_logit

def compute_mode_utilities(
    person_owns_car: bool,
    car_time: float,
    transit_time: float | None,
    walk_time: float | None,
    car_cost_per_km: float = 0.12,
    transit_fare: float = 2.50,
    distance_km: float = 5.0,
) -> dict[str, float]:
    """
    Utility = β_time * time + β_cost * cost + ASC.
    Modes: car, transit, walk.
    β_time = -0.06 (per minute), β_cost = -0.5 (per dollar).
    ASC_transit = -0.5, ASC_walk = -1.0.
    If person doesn't own car, car utility = -inf.
    If no transit available, transit utility = -inf.
    Walking only viable if distance < 3 km.
    """

def choose_mode(
    utilities: dict[str, float],
    rng
) -> str:
    """Apply logit probabilities, draw random mode."""
```

**Create `core/transit/network.py`:**
```python
from core.schema.scene import SceneTransitLine
from core.algorithms.graph import DirectedGraph

class TransitNetwork:
    """Simple transit model: each line has stops, headway, and inter-stop times."""
    
    def __init__(self):
        self.lines: list[SceneTransitLine] = []
        self.stop_to_lines: dict[str, list[str]] = {}  # node_id → [line_ids]
    
    def add_line(self, line: SceneTransitLine, graph: DirectedGraph) -> None:
        """Register a transit line. Compute inter-stop travel times from graph."""
    
    def get_transit_time(self, from_node: str, to_node: str) -> float | None:
        """Total time = walk_to_stop + wait + in_vehicle + walk_from_stop.
           Returns None if no transit connection exists."""
    
    def get_wait_time(self, line_id: str) -> float:
        """Half the headway (average wait for random arrival)."""
```

**Test:**
- Bus line with 10-min headway → avg wait = 5 min
- Person without car → never assigned "car" mode
- Transit available → transit_share > 0

### Task 2.5 — Time-dependent demand profiles

**Create `core/population/demand_profiles.py`:**
```python
import numpy as np

DEMAND_PROFILES = {
    "am_peak":  {"hours": (7, 9),   "share": 0.35},
    "midday":   {"hours": (9, 16),  "share": 0.20},
    "pm_peak":  {"hours": (16, 19), "share": 0.35},
    "evening":  {"hours": (19, 22), "share": 0.10},
}

def get_departure_minute(
    plan_type: str,
    activity_start: int,
    rng: np.random.Generator,
) -> int:
    """
    Jitter departure within the appropriate demand window.
    Workers/students → AM peak outbound, PM peak return.
    Shift workers → spread across all periods.
    Retired/caregiver → midday bias.
    """

def classify_period(minute: int) -> str:
    """Returns 'am_peak', 'midday', 'pm_peak', or 'evening'."""
```

### Task 2.6 — Snapshot builder for live streaming

**Create `core/snapshot/builder.py`:**
```python
from dataclasses import dataclass
import time

@dataclass
class SnapshotFrame:
    run_id: str
    tick: int
    time_minutes: int
    progress: float                     # 0.0–1.0
    link_metrics: list[dict]            # [{id, volume, vc_ratio, travel_time_min}]
    agents_sample: list[dict]           # [{id, x, y, mode}] — sampled, not all
    equilibrium: dict | None            # {iteration, gap}

def build_snapshot(
    world,
    run_id: str,
    volumes: dict[str, float],
    congested_times: dict[str, float],
    max_agent_sample: int = 200,
) -> SnapshotFrame:
    """
    Build a single frame for WebSocket streaming.
    Samples at most max_agent_sample agents (never full population dump).
    Link metrics include id, volume, V/C ratio, congested travel time.
    """
```

### Task 2.7 — Wire everything into runner.py

**Modify `core/runner.py` to integrate:**
```python
from core.transport.routing import find_route
from core.transport.assignment import all_or_nothing_assignment
from core.transport.congestion import update_congested_times
from core.transport.equilibrium import run_msa_equilibrium
from core.transport.mode_choice import choose_mode, compute_mode_utilities
from core.transit.network import TransitNetwork
from core.population.demand_profiles import get_departure_minute, classify_period
from core.snapshot.builder import build_snapshot, SnapshotFrame

@dataclass
class SimResult:
    run_id: str
    seed: int
    model_version: str
    schema_version: str
    calibration_status: str
    ticks_completed: int
    kpis: dict[str, float]
    equilibrium_meta: dict | None
    link_metrics: list[dict]
    snapshots: list[SnapshotFrame]

def run_replication(
    scene: Scene,
    seed: int,
    config: SimConfig | None = None,
    snapshot_callback: callable | None = None,
) -> SimResult:
    """
    Full simulation replication:
    1. Build world from scene
    2. Generate population (all 6 plan types)
    3. Build transit network from scene transit_lines
    4. For each agent with a trip:
       a. Choose mode (logit)
       b. Assign departure time (demand profile)
    5. Run MSA equilibrium on all trips
    6. Emit snapshots via callback (if provided)
    7. Compute real KPIs from actual volumes and travel times
    8. Return SimResult
    """
```

**Modify `core/metrics/kpis.py`:**
```python
def compute_kpis(
    world,
    volumes: dict[str, float],
    congested_times: dict[str, float],
    trips: list[dict],
    equilibrium: dict | None = None,
) -> dict[str, float]:
    """
    Returns:
    - avg_travel_time_min: mean congested travel time across all trips
    - total_delay_veh_hours: sum of (congested_time - free_flow_time) * volume
    - max_vc_ratio: highest volume/capacity on any link
    - mean_vc_ratio: average V/C across all links with volume > 0
    - total_vehicle_km: sum of volume * length for all links
    - transit_ridership: number of trips using transit mode
    - congested_link_count: links with V/C > 0.8
    """
```

**Test:**
- Runner with 200+ agents → produces non-zero KPIs
- avg_travel_time > 0
- Congested bottleneck → higher travel time than free-flow
- Same seed → same KPIs (golden test)

---

## PHASE 3 — MVP Platform & Evidence (MP-12 to MP-15, MP-19 to MP-22)

### Task 3.1 — Results writer with meta.json

**Modify `persistence/results_writer.py`:**
```python
import json
from pathlib import Path
from core.version import MODEL_VERSION

def write_run_result(
    run_id: str,
    result,  # SimResult
    data_dir: str = "data/runs",
) -> Path:
    """
    Write complete run artifacts:
    - data/runs/{run_id}/meta.json (version, seed, params, calibration_status)
    - data/runs/{run_id}/kpis.json (all KPI values)
    - data/runs/{run_id}/link_metrics.json (per-link volume, V/C, travel time)
    Returns path to run directory.
    """
    run_dir = Path(data_dir) / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    
    # meta.json
    meta = {
        "run_id": run_id,
        "seed": result.seed,
        "model_version": result.model_version,
        "schema_version": result.schema_version,
        "calibration_status": result.calibration_status,
        "ticks_completed": result.ticks_completed,
    }
    if result.equilibrium_meta:
        meta["equilibrium"] = result.equilibrium_meta
    (run_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    
    # kpis.json
    (run_dir / "kpis.json").write_text(json.dumps(result.kpis, indent=2))
    
    # link_metrics.json
    (run_dir / "link_metrics.json").write_text(json.dumps(result.link_metrics, indent=2))
    
    return run_dir
```

### Task 3.2 — Job manager with orphan recovery

**Modify `jobs/manager.py`:**
```python
import concurrent.futures
from persistence.db import get_db_connection
from persistence.repositories import RunRepository

class JobManager:
    def __init__(self, pool_size: int = 4):
        self.executor = concurrent.futures.ProcessPoolExecutor(max_workers=pool_size)
        self.futures: dict[str, concurrent.futures.Future] = {}
    
    def enqueue(self, run_id: str) -> None:
        """Submit a simulation run to the background pool."""
    
    def get_status(self, run_id: str) -> str:
        """Check if the future is running/done/error."""
    
    def on_startup(self) -> None:
        """
        Boot-time orphan recovery:
        Find all runs with status='running' in DB → set to 'interrupted'.
        These can be retried by the user.
        """
        with get_db_connection() as conn:
            repo = RunRepository(conn)
            repo.recover_orphaned_runs()
    
    def shutdown(self) -> None:
        self.executor.shutdown(wait=True)
```

**Modify `persistence/repositories.py` — add to RunRepository:**
```python
def recover_orphaned_runs(self) -> int:
    """UPDATE runs SET status='interrupted' WHERE status='running'. Returns count."""

def get_by_scenario(self, scenario_id: str) -> list:
    """Get all runs for a scenario, ordered by seed."""
```

### Task 3.3 — Progress bus (in-memory pub/sub)

**Create `jobs/progress_bus.py`:**
```python
import asyncio
from collections import defaultdict
from core.snapshot.builder import SnapshotFrame

class ProgressBus:
    """In-memory pub/sub for streaming simulation snapshots to WebSocket clients."""
    
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)
    
    def subscribe(self, run_id: str) -> asyncio.Queue:
        """Client subscribes to a run's snapshot stream. Returns an asyncio Queue."""
        q = asyncio.Queue(maxsize=10)
        self._subscribers[run_id].append(q)
        return q
    
    def unsubscribe(self, run_id: str, queue: asyncio.Queue) -> None:
        """Remove a subscriber."""
    
    def publish(self, run_id: str, frame: SnapshotFrame) -> None:
        """Push snapshot to all subscribers of this run. Drop if queue full."""
    
    def close(self, run_id: str) -> None:
        """Signal end of stream for this run."""

# Global singleton
progress_bus = ProgressBus()
```

### Task 3.4 — WebSocket snapshot stream (real data)

**Rewrite `api/ws/runs_stream.py`:**
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jobs.progress_bus import progress_bus

router = APIRouter(tags=["stream"])

@router.websocket("/runs/{run_id}/stream")
async def run_stream(websocket: WebSocket, run_id: str):
    """
    Stream SnapshotFrames at capped Hz.
    1. Accept connection
    2. Subscribe to progress_bus for this run_id
    3. Loop: await next frame from queue, send as JSON
    4. On disconnect: unsubscribe
    Rate limit: discard frames if more than 10 Hz.
    """
    await websocket.accept()
    queue = progress_bus.subscribe(run_id)
    try:
        while True:
            frame = await queue.get()
            if frame is None:  # End-of-stream sentinel
                break
            await websocket.send_json({
                "run_id": run_id,
                "tick": frame.tick,
                "time_minutes": frame.time_minutes,
                "progress": frame.progress,
                "link_metrics": frame.link_metrics,
                "agents_sample": frame.agents_sample,
            })
    except WebSocketDisconnect:
        pass
    finally:
        progress_bus.unsubscribe(run_id, queue)
```

### Task 3.5 — Replication worker (wire scenario diffs + snapshots)

**Rewrite `workers/replication_worker.py`:**
```python
import json
from pathlib import Path
from core.schema.scene import Scene
from core.runner import run_replication
from scenarios.applier import apply_scenario
from persistence.db import get_db_connection
from persistence.repositories import RunRepository, ProjectRepository, ScenarioRepository
from persistence.results_writer import write_run_result
from jobs.progress_bus import progress_bus

def worker_run_replication(run_id: str) -> None:
    """
    Background worker:
    1. Load run config from DB
    2. Load base scene
    3. Apply scenario diff (if scenario has ops)
    4. Run simulation with snapshot callback → publish to progress_bus
    5. Write results to disk
    6. Update DB status to 'completed' or 'error'
    """
```

### Task 3.6 — Templates API endpoint

**Create `api/routes/templates.py`:**
```python
from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("")
def list_templates():
    """
    List available scene templates from data/templates/.
    Returns: [{name, description, filename, node_count, link_count}]
    """

@router.get("/{filename}")
def get_template(filename: str):
    """Return the full scene JSON for a given template."""
```

Register in `api/main.py`.

### Task 3.7 — Config profiles and presets API

**Create `core/config_profiles.py`:**
```python
PROFILES = {
    "default": {
        "city_tick_minutes": 1,
        "msa_max_iterations": 50,
        "msa_epsilon": 0.01,
        "bpr_alpha": 0.15,
        "bpr_beta": 4.0,
        "snapshot_hz": 2,
    },
    "fast_demo": {
        "city_tick_minutes": 5,
        "msa_max_iterations": 10,
        "msa_epsilon": 0.05,
        "bpr_alpha": 0.15,
        "bpr_beta": 4.0,
        "snapshot_hz": 1,
    },
    "presentation": {
        "city_tick_minutes": 1,
        "msa_max_iterations": 30,
        "msa_epsilon": 0.02,
        "bpr_alpha": 0.15,
        "bpr_beta": 4.0,
        "snapshot_hz": 5,
    },
    "academic": {
        "city_tick_minutes": 1,
        "msa_max_iterations": 100,
        "msa_epsilon": 0.001,
        "bpr_alpha": 0.15,
        "bpr_beta": 4.0,
        "snapshot_hz": 0,
    },
}

def get_profile(name: str) -> dict:
    return PROFILES.get(name, PROFILES["default"])

def list_profiles() -> list[dict]:
    return [{"name": k, **v} for k, v in PROFILES.items()]
```

**Create `api/routes/profiles.py`:**
```python
from fastapi import APIRouter
from core.config_profiles import list_profiles, get_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("")
def list_all_profiles():
    return list_profiles()

@router.get("/{name}")
def get_profile_by_name(name: str):
    return get_profile(name)
```

**Create `api/routes/presets.py`:**
```python
from fastapi import APIRouter
from scenarios.presets import get_all_presets

router = APIRouter(prefix="/presets", tags=["presets"])

@router.get("")
def list_presets():
    """Return all available scenario presets."""
    return get_all_presets()
```

**Expand `scenarios/presets.py` — full bypass preset with real node coordinates:**
```python
BYPASS_PRESET = {
    "name": "Eastern Highway Bypass",
    "description": "4-lane bypass east of CBD to relieve the G3_2→G3_3 bottleneck",
    "ops": [
        {"op": "add_node", "id": "N_BP1", "x": 3800, "y": 1900, "type": "intersection"},
        {"op": "add_node", "id": "N_BP2", "x": 3800, "y": 3100, "type": "intersection"},
        {"op": "add_link", "id": "L_BP_N", "from_node": "G3_6", "to_node": "N_BP1",
         "lanes": 4, "speed_kph": 80, "capacity_per_lane_per_hour": 2000, "road_class": "highway", "oneway": False},
        {"op": "add_link", "id": "L_BP_MAIN", "from_node": "N_BP1", "to_node": "N_BP2",
         "lanes": 4, "speed_kph": 80, "capacity_per_lane_per_hour": 2000, "road_class": "highway", "oneway": False},
        {"op": "add_link", "id": "L_BP_S", "from_node": "N_BP2", "to_node": "G5_6",
         "lanes": 4, "speed_kph": 80, "capacity_per_lane_per_hour": 2000, "road_class": "highway", "oneway": False},
    ]
}

TOLL_PRESET = {
    "name": "CBD Congestion Pricing",
    "description": "Reduce lanes on central arterial to simulate congestion pricing effect",
    "ops": [
        {"op": "update_link", "id": "LH25", "lanes": 1, "speed_kph": 30},
    ]
}

def get_all_presets() -> list[dict]:
    return [BYPASS_PRESET, TOLL_PRESET]
```

Register `profiles.py`, `presets.py`, `templates.py` in `api/main.py`.

### Task 3.8 — Comparison mechanism trace (real analysis)

**Rewrite `comparison/mechanism.py`:**
```python
def trace_mechanisms(
    baseline_kpis: dict[str, float],
    scenario_kpis: dict[str, float],
    baseline_link_metrics: list[dict],
    scenario_link_metrics: list[dict],
    top_n: int = 3,
) -> list[str]:
    """
    Identify top-N drivers of KPI change by comparing per-link metrics.
    
    Algorithm:
    1. For each link, compute Δ_travel_time = scenario_tt - baseline_tt
    2. Weight by volume: impact = Δ_tt * volume
    3. Sort by |impact| descending
    4. Translate top-N into human-readable explanations:
       e.g. "Link L_BP_MAIN absorbed 1200 vehicles, reducing bottleneck V/C from 1.8 to 0.6"
    5. Also check aggregate: if transit_ridership increased → add "Modal shift..."
    """
```

### Task 3.9 — HTML report generator (full spec)

**Rewrite `reports/html_builder.py`:**
```python
def generate_comparison_report(
    comparison_stats: dict,
    mechanisms: list[str],
    calibration_status: str,
    model_version: str,
    seed_count: int,
) -> str:
    """
    Generate a complete standalone HTML report with:
    - Title and model version header
    - Calibration badge (colour-coded: green/yellow/red)
    - Parameter summary table (seeds, MSA iterations, BPR params)
    - KPI comparison table with Mean, 95% CI, Δ, significance label
    - Mechanism trace section (top-3 drivers)
    - Disclaimer: "These are modelled estimates, not predictions..."
    - Assumptions section listing all model limitations
    - Generated timestamp
    Styled with inline CSS (no external dependencies).
    """
```

### Task 3.10 — Scene history and undo

**Create `persistence/scene_history.py`:**
```python
import json
from pathlib import Path
from datetime import datetime

class SceneHistory:
    """Keeps last N versions of a project's scene JSON."""
    
    MAX_VERSIONS = 10
    
    def __init__(self, project_id: str, data_dir: str = "data"):
        self.history_dir = Path(data_dir) / "projects" / project_id / "history"
        self.history_dir.mkdir(parents=True, exist_ok=True)
    
    def save_version(self, scene_json: dict, label: str = "") -> str:
        """Save current scene as a timestamped version. Prune old versions. Returns version_id."""
    
    def list_versions(self) -> list[dict]:
        """Return [{version_id, timestamp, label}] newest first."""
    
    def restore_version(self, version_id: str) -> dict:
        """Load and return the scene JSON for a given version."""
    
    def _prune(self) -> None:
        """Delete oldest versions beyond MAX_VERSIONS."""
```

**Create `api/routes/scene_history.py`:**
```python
from fastapi import APIRouter

router = APIRouter(tags=["scene-history"])

@router.get("/projects/{project_id}/scene/history")
def list_scene_versions(project_id: str):
    """List last 10 scene versions for undo/restore."""

@router.post("/projects/{project_id}/scene/history/{version_id}/restore")
def restore_scene_version(project_id: str, version_id: str):
    """Restore a previous scene version (undo)."""
```

### Task 3.11 — Scenario engine improvements

**Expand `scenarios/ops_catalog.py`:**
```python
SCENARIO_OPS = {
    "add_node": {"required": ["id", "x", "y"], "optional": ["type"]},
    "add_link": {"required": ["id", "from_node", "to_node", "lanes", "speed_kph"],
                 "optional": ["capacity_per_lane_per_hour", "road_class", "oneway"]},
    "remove_link": {"required": ["id"]},
    "update_link": {"required": ["id"], "optional": ["lanes", "speed_kph", "capacity_per_lane_per_hour"]},
    "close_link": {"required": ["id"]},  # Sets capacity to 0
    "add_facility": {"required": ["id", "type", "zone_id", "x", "y"], "optional": ["capacity", "floors"]},
    "set_lanes": {"required": ["id", "lanes"]},
    "set_speed": {"required": ["id", "speed_kph"]},
}

def validate_op(op: dict) -> list[str]:
    """Validate a single operation against the catalog schema."""

def get_ops_catalog() -> dict:
    """Return the full ops catalog for UI rendering."""
```

---

## PHASE 4 — Evacuation & Hospital (MP-23, MP-24)

### Task 4.1 — Evacuation API endpoints

**Create `api/routes/evacuation.py`:**
```python
from fastapi import APIRouter
from core.evacuation.runner import run_evacuation, EvacuationResult
from core.evacuation.grid import GridMap

router = APIRouter(prefix="/evacuation", tags=["evacuation"])

@router.post("/run")
def run_evacuation_sim(
    width: int = 50,
    height: int = 50,
    fire_starts: list[dict] = [],     # [{x, y}]
    agent_starts: list[dict] = [],    # [{x, y}]
    wall_cells: list[dict] = [],      # [{x, y}]
    exit_cells: list[dict] = [],      # [{x, y}]
    max_ticks: int = 500,
    spread_prob: float = 0.1,
) -> dict:
    """Run a fire evacuation simulation and return results."""

@router.post("/run/template/{template_name}")
def run_from_template(template_name: str):
    """Load a campus template and run evacuation with default fire/agent positions."""
```

Register in `api/main.py`.

### Task 4.2 — Hospital API endpoints

**Create `api/routes/hospital.py`:**
```python
from fastapi import APIRouter
from core.hospital.runner import run_hospital_surge, HospitalResult

router = APIRouter(prefix="/hospital", tags=["hospital"])

@router.post("/run")
def run_hospital_sim(
    beds: int = 100,
    nurses: int = 50,
    surge_rate: float = 2.0,
    max_ticks: int = 1440,
) -> dict:
    """Run a hospital surge simulation."""

@router.post("/compare")
def compare_surge(
    beds_baseline: int = 100,
    beds_scenario: int = 150,
    nurses: int = 50,
    surge_rate: float = 2.0,
) -> dict:
    """Run two scenarios (different bed counts) and compare results."""
```

Register in `api/main.py`.

### Task 4.3 — Dynamic module nav from API

The `GET /modules` endpoint already exists. Frontend must query it on load and render navigation items dynamically.

---

## PHASE 5 — 3D Polish (MP-25)

### Task 5.1 — Walkthrough controls, LOD, day/night, split-view

**Already implemented:** WalkthroughControls, Day/Night toggle.

**Remaining — create `frontend/src/components/Map/LODManager.tsx`:**
```tsx
/**
 * Dynamically adjust geometry detail based on camera distance.
 * When camera > 2000 units: use low-poly (segments=4).
 * When camera 500-2000: medium (segments=8).
 * When camera < 500: high (segments=16).
 */
```

**Create `frontend/src/components/Map/SplitWipe.tsx`:**
```tsx
/**
 * Side-by-side or slider-wipe comparison of baseline vs scenario.
 * Left half: baseline snapshot data. Right half: scenario snapshot data.
 * Draggable vertical divider.
 */
```

### Task 5.2 — URL deep links and demo mode

**Create `frontend/src/hooks/useURLParams.ts`:**
```typescript
/**
 * Parse URL search params: ?mode=3d&layers=congestion,transit&view=45,30,1000
 * On change, update uiStore. On store change, update URL.
 */
```

**Create `frontend/src/components/DemoMode.tsx`:**
```tsx
/**
 * Guided fullscreen walkthrough:
 * Step 1: "Welcome to METACITY" (overview)
 * Step 2: "The Road Network" (fly to bottleneck)
 * Step 3: "Running a Simulation" (auto-play)
 * Step 4: "Compare Scenarios" (show bypass result)
 * Auto-advance with narration text overlay.
 */
```

### Task 5.3 — Embeddable comparison HTML export

**Create `frontend/src/components/EmbedExport.tsx`:**
```tsx
/**
 * Generate a self-contained HTML file with:
 * - Screenshot of current 3D view (via canvas.toDataURL)
 * - KPI comparison table
 * - Calibration badge
 * Downloadable as .html file.
 */
```

---

## PHASE 6 — Land Use & Utilities (MP-26)

### Task 6.1 — Year loop (accessibility → housing shift)

Already implemented: `core/land_use/housing.py` and `core/land_use/multi_year_runner.py`.

**Enhance `core/land_use/multi_year_runner.py`:**
```python
def run_multi_year(
    scene: Scene,
    years: int = 5,
    seed: int = 42,
) -> list[dict]:
    """
    For each year:
    1. Run traffic simulation → get congested travel times
    2. Compute accessibility per zone
    3. Apply housing shift (population redistribution)
    4. Recalculate utilities (water, electricity)
    5. Record year's KPIs (population, travel_time, utilities, emissions)
    Returns: list of per-year KPI dicts.
    """
```

### Task 6.2 — Wire utilities and emissions to comparison KPIs

**Modify `comparison/statistics.py`:**
Add `electricity_kwh`, `water_liters`, `co2_tonnes` as new KPI rows in the paired comparison.

### Task 6.3 — Sensitivity sweeper (enhanced)

**Modify `jobs/sweeper.py`:**
```python
def run_sensitivity_sweep(
    scene: Scene,
    parameter_name: str,
    values: list[float],
    seed: int = 42,
) -> list[dict]:
    """
    One-at-a-time sensitivity analysis.
    For each value of the parameter, run a full replication and collect KPIs.
    Returns [{parameter_value, kpis}].
    Supported parameters: 'car_ownership_rate', 'total_population', 'bpr_alpha', 'bpr_beta'.
    """
```

### Task 6.4 — Project ZIP archive export/import

**Create `api/routes/archive.py`:**
```python
from fastapi import APIRouter, UploadFile
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/projects", tags=["archive"])

@router.get("/{project_id}/export")
def export_project_zip(project_id: str) -> StreamingResponse:
    """
    Bundle into ZIP:
    - scene.json
    - all run results (meta.json, kpis.json)
    - scenario diffs
    - comparison results
    """

@router.post("/import")
def import_project_zip(file: UploadFile):
    """Unpack ZIP, create new project, restore all data."""
```

---

## PHASE 7 — Real Data Import (MP-27, MP-28)

### Task 7.1 — CRS helpers

Already implemented: `core/geo/crs.py`.

### Task 7.2 — OSM → scene converter

Already implemented: `core/geo/osm_converter.py`.

**Enhance — add proper attribution string:**
```python
OSM_ATTRIBUTION = "© OpenStreetMap contributors. Data available under ODbL."
```

### Task 7.3 — GTFS transit import

Already implemented: `core/geo/gtfs_parser.py` (full routes/trips/stoptimes).

### Task 7.4 — Import API endpoint

**Create `api/routes/import_geo.py`:**
```python
from fastapi import APIRouter

router = APIRouter(prefix="/import", tags=["import"])

@router.post("/osm")
def import_from_osm(
    south: float, west: float, north: float, east: float,
    project_name: str = "Imported Area",
):
    """
    Fetch highways from Overpass API for the bounding box.
    Convert to METACITY scene JSON.
    Create a new project with the imported scene.
    Returns: {project_id, node_count, link_count, attribution}.
    """

@router.post("/gtfs")
def import_gtfs(stops_txt: str, routes_txt: str, trips_txt: str, stop_times_txt: str):
    """Parse GTFS data and return TransitLine objects for the scene."""
```

### Task 7.5 — Calibration engine (observed counts → fit → error report)

Already implemented: `core/calibration/engine.py` (GEH/RMSE).

**Create `api/routes/calibration.py`:**
```python
from fastapi import APIRouter

router = APIRouter(prefix="/calibration", tags=["calibration"])

@router.post("/projects/{project_id}/calibrate")
def run_calibration(
    project_id: str,
    observed_counts: dict[str, float],  # {link_id: observed_volume}
):
    """
    1. Run a baseline simulation
    2. Compare simulated vs observed flows
    3. Compute GEH/RMSE metrics
    4. Determine calibration status (calibrated / partially_calibrated / synthetic_uncalibrated)
    5. Update the project's calibration_status
    Returns: {status, rmse, geh_avg, per_link_errors}
    """
```

---

## PHASE 8 — City Disasters (MP-29)

### Task 8.1 — Disaster preset pack

**Enhance `scenarios/presets.py`:**
```python
FLOOD_PRESET = {
    "name": "Riverside Flood",
    "description": "Close low-lying links near the river zone",
    "ops": [
        {"op": "close_link", "id": "LH7"},
        {"op": "close_link", "id": "LH8"},
        {"op": "close_link", "id": "LV22"},
    ]
}

BRIDGE_FAILURE_PRESET = {
    "name": "Critical Bridge Failure",
    "description": "Close the main ring-road bridge segment",
    "ops": [
        {"op": "close_link", "id": "LR100"},
        {"op": "close_link", "id": "LR101"},
    ]
}

def get_all_presets() -> list[dict]:
    return [BYPASS_PRESET, TOLL_PRESET, FLOOD_PRESET, BRIDGE_FAILURE_PRESET]
```

### Task 8.2 — Emergency accessibility metric

**Create `core/disasters/emergency_access.py`:**
```python
from core.algorithms.paths import dijkstra
from core.algorithms.graph import DirectedGraph

def compute_emergency_access(
    graph: DirectedGraph,
    hospital_node_ids: list[str],
) -> dict[str, float]:
    """
    For each node, compute the shortest travel time to the nearest hospital.
    Returns {node_id: minutes_to_nearest_hospital}.
    Nodes with no path to any hospital get value = float('inf').
    """

def compute_isolation_metrics(
    graph: DirectedGraph,
) -> dict:
    """
    BFS-based: compute connected components.
    Returns {
        component_count: int,
        largest_component_size: int,
        isolated_nodes: list[str],
        isolation_ratio: float,  # isolated / total
    }
    """
```

---

## PHASE 9 — ML & AI Planner (MP-30, optional)

### Task 9.1 — Surrogate model (train from past runs)

Already implemented: `core/ml/dataset_gen.py` and `core/ml/surrogate.py`.

### Task 9.2 — Planner candidates (greedy/hill-climb)

**Create `core/ml/planner.py`:**
```python
from core.ml.surrogate import SurrogateModel

def greedy_search(
    model: SurrogateModel,
    base_params: list[float],
    parameter_ranges: list[tuple[float, float]],
    n_candidates: int = 100,
    objective: str = "minimize_travel_time",
) -> list[dict]:
    """
    Generate n_candidates random parameter sets.
    Predict KPIs using surrogate model.
    Sort by objective.
    Return top-10 candidates with predicted KPIs.
    """

def hill_climb(
    model: SurrogateModel,
    start_params: list[float],
    step_sizes: list[float],
    max_steps: int = 50,
    objective: str = "minimize_travel_time",
) -> dict:
    """
    Simple hill-climbing optimizer:
    1. Start at start_params
    2. For each step: try +/- step_size on each parameter
    3. Move to best neighbor if it improves the objective
    4. Stop if no improvement or max_steps
    Returns: {best_params, predicted_kpis, steps_taken}
    """
```

### Task 9.3 — Mandatory full-sim verification

**Create `core/ml/verifier.py`:**
```python
def verify_top_candidates(
    candidates: list[dict],
    scene: Scene,
    top_n: int = 3,
    seeds: list[int] = [42, 99, 7],
) -> list[dict]:
    """
    Take the top-N surrogate-predicted candidates.
    Run full simulation for each with multiple seeds.
    Compare predicted vs actual KPIs.
    Returns candidates with verified_kpis and prediction_error.
    """
```

### Task 9.4 — Planner API

**Create `api/routes/planner.py`:**
```python
from fastapi import APIRouter

router = APIRouter(prefix="/planner", tags=["planner"])

@router.post("/search")
def search_candidates(project_id: str, objective: str = "minimize_travel_time"):
    """Run greedy search using surrogate model. Returns top-10 candidates."""

@router.post("/verify")
def verify_candidate(project_id: str, candidate_params: list[float]):
    """Run full simulation to verify a surrogate-predicted candidate."""
```

---

## PHASE 10 — Production Hardening (MP-30 continued)

### Task 10.1 — Docker Compose (production)

Already implemented: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`.

### Task 10.2 — Backup script

**Create `scripts/backup.sh`:**
```bash
#!/bin/bash
# Rotate SQLite DB + data/runs/ into timestamped tar.gz
# Keep last 5 backups, delete older ones
```

### Task 10.3 — API cookbook

**Create `docs/API_COOKBOOK.md`:**
```markdown
# METACITY API Cookbook

## Create a project from template
curl -X POST http://localhost:8000/projects -d '{"name": "My City", "template": "nexus_city_baseline"}'

## Run a multi-seed batch
curl -X POST http://localhost:8000/runs -d '{"scenario_id": "...", "seeds": [42, 99, 7, 13, 55]}'

## Create a comparison
curl -X POST http://localhost:8000/comparisons -d '{"baseline_run_ids": [...], "scenario_run_ids": [...]}'

## Get the HTML report
curl http://localhost:8000/reports/{comparison_id} > report.html
```

### Task 10.4 — Stakeholder pack

**Create `docs/STAKEHOLDER_GUIDE.md`:**
```markdown
Overview of METACITY for non-technical stakeholders.
Includes: what it models, how to interpret results, calibration badges, and limitations.
```

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
