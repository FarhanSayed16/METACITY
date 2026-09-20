# ADR-001: Python Backend

## Status: Accepted

## Context
The simulation platform requires heavy numerical computation (graph algorithms, matrices), data manipulation, machine learning integration, and geospatial capabilities (OSMnx, GeoPandas). While Node.js/TypeScript is great for the API, it lacks the ecosystem for these specific domains.

## Decision
We will use Python 3.12+ for the entire backend (installable package **`metacity-core`**, import as **`core`**) and the API via FastAPI.

## Consequences
- We gain access to NumPy, SciPy, DuckDB, and the Python ML/Geo ecosystem.
- We must enforce type hints (`mypy`) to maintain large-scale maintainability comparable to TypeScript.
- We will use `multiprocessing` for parallel simulation runs since Python's GIL limits threading.
