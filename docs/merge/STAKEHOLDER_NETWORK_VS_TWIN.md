# Stakeholder guide — Network Evidence vs City Twin

> **Audience:** Product owners, partners, demos  
> **Date:** 25 September 2026  
> **Rule:** One backend. Two presentation modes. No competing simulators.

---

## One sentence

**METACITY** lets you **edit and prove** network interventions with multi-seed evidence, then **show** the same city as a living 3D twin — without inventing a second model of truth.

---

## When to use which

| Question | Use |
|---|---|
| “What happens to travel time / isolation if we close this link?” | **Network Evidence** → scenario → run → **Compare** |
| “What does the corridor look like for the board?” | **City Twin** with `?run_id=` so congestion + agents match the run |
| “Can we flood the river corridor and measure cut-off?” | **Disaster Lab** on the map → Save & run → Compare isolation Δ |
| “Which demand/weather/capacity candidate looks best?” | **AI Command Center** → Search → **Verify (full sim)** |

---

## Network Evidence Mode

- **Route:** `/projects/:id/map`
- **Strengths:** Ortho/3D edit, BPR/MSA, ghost ops, centrality/isolation tools, live `link_metrics`
- **Honest claim:** Macroscopic assignment + replication CI — research-grade evidence, not street-level microsim

## City Twin Mode

- **Route:** `/projects/:id/city`
- **Strengths:** Licensed GLB facilities, congestion-coloured roads, ≤200 sampled agents from WS
- **Honest claim:** Presentation of **your** scene + run sample — see [`AGENTS_VIZ_HONESTY.md`](AGENTS_VIZ_HONESTY.md)
- **Not claimed:** Friend-style citizen FSM as simulation truth

---

## Demo path (board-ready)

1. Landing → Projects → Nexus City  
2. Run seeds 0–9 → open Network map  
3. Disaster Lab → Flood → Save & run  
4. City Twin with that `run_id`  
5. Compare baseline vs flood → show isolation Δ + HTML report  

Target: **under 20 minutes**.

---

## What we never say in demos

- “Two backends” / “friend’s sim is also live”
- “Agents are a full microsimulation”
- “Ask AI is an unrestricted LLM” (it is guided templates unless E-M3 is enabled later)
- “Split wipe compares two live sims” (it is an aesthetic preview — use Compare)
