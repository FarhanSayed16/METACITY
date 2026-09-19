# METACITY — Enhancements Register (Adopted)

> Former recommendations file. **All reviewed enhancements have been merged into the live plans.**  
> Use this document as an index of *what was adopted where* — not as a separate to-do list.

| Field | Value |
|---|---|
| Date adopted | 19 September 2026 |
| Status | **Adopted into plans** — do not maintain a parallel enhancement backlog |
| Living plans | Build Plan v3 · Backend Plan **v1.1** · Frontend Plan **v1.1** |

---

## How to use this file

1. Implement from **v3 + Backend + Frontend** plans.  
2. Use the tables below only to find *where* an enhancement landed.  
3. If a new idea appears later, add it to the relevant plan first, then note it here.

---

## Document alignment (resolved)

| Issue | Resolution |
|---|---|
| API endpoint authority | **Backend plan** is SoT; v3 §15 is summary |
| Acceptance criteria | **v3 §21.3** is master; companion checklists reference it |
| Feature ownership gaps (15a, 29a, 37) | Added to Backend §16 matrix |
| Phase duration for BE/FE parallel work | Backend §19 + Frontend header estimates |
| Glossary | v3 §30; companions point to it / `docs/GLOSSARY.md` |

---

## Adopted → Backend Plan

| Enhancement | Backend location | Phase |
|---|---|---|
| Scene version history (last 10) | persistence `scene_history` | MVP |
| Presets registry API | `GET /presets` | 0 |
| Multi-arm comparison | `comparison/multi_arm` | Next (after MVP 2-arm) |
| Project ZIP export/import | `archive.py` | 3–5 |
| Rich health check | `health` route | 0 |
| Interrupted runs + retry | jobs states | 1 |
| SSE optional | progress_bus note | 5+ |
| Module registry | `core/registry` + `GET /modules` | 4 |
| Config profiles | `data/config_profiles` | 3 |
| Warm-start equilibrium | `transport/warm_start` | 6 |
| Sensitivity sweeps | `sensitivity/` | 6–7 |
| Activity plan diversity | `activity/plan_templates` | 2 |
| Time-dependent demand | `activity/demand_profiles` | 2 (**MVP**) |
| Monorepo DX / CI / CONTRIBUTING / ADRs | Backend §23 | 0 |
| OpenAPI → TS | tests + OpenAPI emit | 1 |
| Formal JSON Schema | `data/schemas/scene_schema.json` | 0 |
| Schema migrations | `schema/migrate` | 1 |
| GeoJSON export | `geojson_export` | 5 |
| Screenshot store | `screenshots` route | 3 |
| Hypothesis property tests | tests §13 | 1–2 |
| WS load test | tests | 3 |
| NumPy agent arrays | `population/arrays` | 2+ |
| Incremental snapshot diffs | snapshot notes | 5 |
| Rate limiting | API middleware | 3 |
| Structured JSON logging | cross-cutting | 0 |
| Data backup script | Phase 10 | 10 |
| API cookbook | `docs/api_cookbook.md` | 3 |

---

## Adopted → Frontend Plan

| Enhancement | Frontend location | Phase |
|---|---|---|
| Keyboard shortcuts catalogue | §25 | 3 |
| Offline / API-down UX | §26 | 3 |
| URL workspace deep links | §26 | 5 |
| First-run onboarding | §26 | 3 |
| Drag-drop scene import | §26 | 5 |
| Mini-map | §14.8 | 5 |
| OpenAPI-generated types | §13.4 | 1 |
| Storybook | §27 | 1–2 |
| Accessibility heatmap | layers / §27 | 3/5 |
| Level-1 flow animation | §14.3 | 2 |
| Split-screen wipe | §14.6 | 5 |
| Screenshot capture | §14.7 | 3 |
| Visual regression | §27 | 3 |
| Demo mode / embed / video | §27 | 5 |
| Snapshot diffs / Web Worker | §13.3 | 5 |
| Presets empty-state CTA | Scenario library | 3 |
| Parallel FE time estimates | Header | — |

---

## Adopted → Build Plan v3

| Enhancement | v3 location |
|---|---|
| Companion doc authority | Header / document status |
| API SoT note | §15 |
| Demand profiles + plan diversity in Phase 2 | Phase overview + Phase 2 acceptance |
| Presets + screenshots in Phase 3 acceptance | §21.3 |
| Acceptance master reminder | §21.3 note |

---

## Explicitly deferred (still in plans as later phases — not dropped)

These remain **planned**, just not MVP:

- Multi-scenario N-arm statistics  
- Warm-start, sensitivity, GeoJSON, project archive  
- Demo mode, embed widget, video, mini-map, deep links  
- Module registry (ships with Phase 4)  
- SSE, incremental WS diffs, Web Worker  
- Rate limiting (Phase 3), backups (Phase 10)  

---

## Rejected / not adopted as separate tracks

| Idea | Why |
|---|---|
| Rewriting acceptance in three places | Causes drift — single master in v3 |
| Hard-coding module nav forever | Replaced by registry when Phase 4 starts |
| Dense microscopic car models for Level-1 | Dishonest vs BPR — flow animation preferred |

---

*When plans change, update this register in the same PR/commit so the three documents stay aligned.*
