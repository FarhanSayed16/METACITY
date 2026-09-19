.PHONY: setup dev-backend dev-frontend dev test lint

setup:
	cd backend && pip install -e ".[dev]"
	cd frontend && npm install

dev-backend:
	cd backend && uvicorn api.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

dev:
	# Run both backend and frontend concurrently (requires make -j2)
	$(MAKE) -j2 dev-backend dev-frontend

test:
	cd backend && pytest
	cd frontend && npm test

lint:
	cd backend && ruff check .
	cd frontend && npm run lint
