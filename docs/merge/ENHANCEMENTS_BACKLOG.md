# Enhancements backlog (Phase 10)

> **Groomed:** 25 September 2026  
> **Rule:** Nothing here is P0. Ship only behind a flag. Do not quietly expand MVP claims.  
> **EXIT (Phase 10):** Backlog groomed; no silent scope creep into P0. — **PASSED**

---

## Priority order (recommended)

| Rank | ID | Title | Effort | Flag | Priority |
|:---:|---|---|---|---|---|
| 1 | **E-M2** | Transit / bus / metro presentation on City Twin | M | `VITE_ENH_TRANSIT_LAYERS` | **Next** — assets exist; scene has `transit_lines` |
| 2 | **E-M3** | Real LLM behind Ask (OpenAI/Ollama) + KPI grounding | M–L | `VITE_ENH_LLM_ASK` | High product wow; keep template fallback |
| 3 | **E-M1** | Friend FSM sprites as **viz skin** on `agents_sample` | L | `VITE_ENH_FSM_VIZ` | Nice; must not replace MSA |
| 4 | **E-M6** | Video / HDR cinematic hero | S–M | `VITE_ENH_HERO_VIDEO` | Marketing only |
| 5 | **E-M4** | Interiors modal | L | `VITE_ENH_INTERIORS` | Deferred |
| 6 | **E-M5** | Supabase multi-user | XL | `VITE_ENH_MULTIUSER` | Only if productizing |

### Also deferred (from P2 polish — not E-M)

| ID | Item | Note |
|---|---|---|
| P2-M1+ | True dual-camera SplitWipe | Keep aesthetic label until real dual-run sync |
| P2-M3 | Particle / ribbon flow | Optional; dash honesty is fine |
| P2-M5 | MapLibre basemap under Network | Quarantined; revive only with flag |
| — | Storybook / auth | Only if needed for a team |

---

## E-M1 — FSM visual agents (samples only)

| | |
|---|---|
| **Intent** | Friend billboard/FSM look driven by **your** WS `agents_sample` |
| **SoT** | Root runner sample fields (`id`, `mode`, `x`, `y`, `progress`, `link_id`) |
| **Do not** | Run friend citizen simulation; claim microsim |
| **Acceptance** | Flag off = current capsules; flag on = sprite billboards; honesty copy unchanged |
| **Depends** | Phase 7 agents layer |

## E-M2 — Transit presentation layers

| | |
|---|---|
| **Intent** | Draw `scene.transit_lines` + optional bus/metro GLBs along stops |
| **SoT** | Scene JSON `transit_lines`; registry `veh.bus`, metro/train assets |
| **Do not** | Invent GTFS ops without scene data |
| **Acceptance** | Lines visible in Twin when scene has transit; Network mode unchanged |
| **Depends** | City Twin scene loader |

## E-M3 — Real LLM Ask

| | |
|---|---|
| **Intent** | Optional OpenAI/Ollama behind Ask; still ground on run meta/KPIs |
| **SoT** | Same artefacts as guided templates; server-side provider key |
| **Do not** | Default-on LLM; ungrounded free chat as “sim truth” |
| **Acceptance** | Flag off = templates; flag on = LLM with evidence chips + “model-assisted” label |
| **Depends** | Phase 6 Ask panel; backend proxy preferred |

## E-M4 — Interiors modal

| | |
|---|---|
| **Intent** | Facility interior viewer (friend pattern) |
| **Defer until** | Board demos need building walkthroughs |
| **Do not** | Block Twin on missing interiors |

## E-M5 — Supabase multi-user

| | |
|---|---|
| **Intent** | Auth + shared projects |
| **Defer until** | Explicit productization decision |
| **Do not** | Add cloud deps to default compose |

## E-M6 — Cinematic hero video/HDR

| | |
|---|---|
| **Intent** | Optional video under landing hero |
| **Do not** | Replace procedural hero as only path (perf / offline) |

---

## Anti-creep checklist (before any E-M PR)

- [ ] Feature flag defaults **false**
- [ ] Merge plan / README claims language unchanged unless EXIT updated
- [ ] No second backend
- [ ] Tests: flag-off regression + flag-on smoke
- [ ] Honesty doc updated if agents/AI claims change

---

## Done vs deferred snapshot

| Area | Status |
|---|---|
| Dual-mode product (Phases 0–8) | **Done** |
| Docs / archive (Phase 9) | **Docs done** · tag when asked |
| E-M1…E-M6 implementation | **Backlog** (this file) |
| Tag `mvp-1.1-unified` | Pending your commit request |
