# Agents sample viz — honesty note (Phase 7)

> Living agents in City Twin are a **presentation layer** over your MSA runner’s WebSocket sample. They are **not** a microsimulation or a port of the friend’s citizen FSM.

## Contract

| Field | Source | Meaning |
|---|---|---|
| `agents_sample` | WS `/runs/{id}/stream` | Cap **200** agents currently on links |
| `id` | Trip agent id | Identifier only |
| `x`, `y` | Interpolated along link (`progress`) | Scene coordinates |
| `mode` | `car` / `walk` / `transit` | Mode choice from your runner |
| `link_id` | Current edge | For inspector / debugging |
| `progress` | 0–1 along link travel time | Viz motion only |

## What we claim (Level-1)

- During a live run, City Twin shows **moving sampled agents** coloured by mode.
- Positions track **MSA trip state** on the network graph.
- Click an agent → inspector shows sample fields.

## What we do **not** claim

- Not continuous individual physics or collision.
- Not the friend’s 20-state citizen FSM / billboard sprites as simulation truth.
- Friend FSM remains **optional future** (Enhancement E-M1) behind an adapter that would still **feed samples only**.

## UI

- Layer: `frontend/src/components/city/AgentsSampleLayer.tsx`
- Inspector: `frontend/src/components/city/AgentInspector.tsx`
- Runner sample build: `backend/core/runner.py` (`agents_sample` + `progress`)
