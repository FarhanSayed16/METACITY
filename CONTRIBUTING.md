# Contributing to METACITY

## Prerequisites
- Python 3.12+
- Node.js 20+
- Git

## Setup
Run the setup command from the root directory to install all backend and frontend dependencies:
```bash
make setup
```

## Running the application
```bash
# Run backend only (FastAPI on port 8000)
make dev-backend

# Run frontend only (Vite on port 5173)
make dev-frontend

# Run both
make dev
```

## Adding a new algorithm
1. Create your algorithm file in `backend/core/algorithms/your_algo.py`.
2. Add corresponding tests in `backend/tests/unit/algorithms/test_your_algo.py`.
3. Make sure the algorithm has zero dependencies on `api`, `workers`, or `persistence`.

## Python package naming
- Distribution name (PyPI / `pip install`): **`metacity-core`**
- Importable package: **`core`** — always `import core…`, never `import metacity_core`
- Historical docs may say `metacity_core`; treat that as the conceptual pure-library layer living under `backend/core/`.

## Regenerating OpenAPI TypeScript types
```bash
cd frontend && npm run typegen
```
CI fails if `frontend/src/lib/api-types.ts` or `openapi.json` drift from the FastAPI schema.

## Adding a new API endpoint
1. Create the route in `backend/api/routes/your_route.py`.
2. Add schemas in `backend/api/schemas/your_schema.py`.
3. Include the router in `backend/api/main.py`.

## Pull Request Checklist
- [ ] Tests pass (`make test`)
- [ ] Linter is clean (`make lint`)
- [ ] No architectural boundaries violated (e.g., `core` importing from `api`)
