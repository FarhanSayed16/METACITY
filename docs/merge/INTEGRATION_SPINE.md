# Integration spine — Phase 1

> Frozen API / mode contracts for the partner merge. Backend SoT = **repo root** only.

## Product modes

| Mode | Route | Backend | Status |
|---|---|---|---|
| Network Evidence | `/projects/:id/map` | Root FastAPI (`core` runner, WS `/runs/{id}/stream`) | **Live** |
| City Twin | `/projects/:id/city` | Same backend — presentation + `agents_sample` viz | **Live (Phase 7)** |
| Compare / Runs / Planner | existing routes | Root APIs | **Live** |

## Feature flags (`frontend/.env` / Vite)

| Flag | Default | Meaning |
|---|---|---|
| `VITE_CITY_TWIN` | `true` | Show City Twin routes & overview CTA |
| `VITE_DISASTER_LAB` | `true` | Disaster Lab modal (Phase 5) |
| `VITE_AI_COMMAND` | `true` | AI Command Center + Ask (Phase 6) |
| `VITE_API_URL` | `http://localhost:8000` | Backend origin |

Read via `frontend/src/lib/featureFlags.ts`.

## Agents sample (Phase 7)

WS snapshots include `agents_sample` (≤200). City Twin renders capsules by mode; see `docs/merge/AGENTS_VIZ_HONESTY.md`. **Viz ≠ microsimulation.**

## Stakeholder / archive / enhancements (Phases 9–10)

- `docs/merge/STAKEHOLDER_NETWORK_VS_TWIN.md`
- `docs/merge/ARCHIVE_FRIEND.md`
- `docs/merge/ENHANCEMENTS_BACKLOG.md` — E-M* behind `VITE_ENH_*` (default off)

## OpenAPI surface (root FE already uses)

Generated: `frontend/openapi.json` + `frontend/src/lib/api-types.ts`  
Client: `frontend/src/lib/api.ts`

Primary groups:

- `/health`, `/projects`, `/projects/{id}/scene`
- `/scenarios`, `/runs`, `/runs/{id}/stream` (WS)
- `/comparisons`, `/tools/*`, `/planner/*`
- `/projects/{id}/geojson`, calibrate, multi-year, sweep
- `/evacuation/*`, `/hospital/*`, `/screenshots`, `/import/osm`

**City Twin must not introduce a second HTTP API.** It loads scene via `api.getScene` and metrics via existing sim store / run meta.

## Compose (single stack)

Root `docker-compose.yml`: `backend` + `worker` + `frontend` only.  
Partner compose is **gone** (tree deleted post-merge).

## Deprecation

| Action | Status |
|---|---|
| Run partner `vendor/friend-metacity` | **Removed** — see `docs/merge/ARCHIVE_FRIEND.md` |
| Run root `backend` + `frontend` | **Required** |
