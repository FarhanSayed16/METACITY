# METACITY — Frontend Implementation Plan

> **No code.** Pages, navigation, design system, motion, component structure, data mapping, and build order only.  
> Aligns with `METACITY_DSA_Build_Plan_v3.md` and `METACITY_Backend_Implementation_Plan.md`.

| Field | Value |
|---|---|
| Project | METACITY |
| Document | Frontend Implementation Plan **v1.1** |
| Date | 19 September 2026 |
| Stack | React · TypeScript · Vite · Zustand · React Three Fiber · Recharts · Lucide icons |
| Maps | Three.js/R3F (synthetic MVP) · MapLibre later (real basemap) |
| Auth | None for MVP (single-user localhost) |
| Changelog | v1.1 — merged adopted items from `METACITY_Enhancements.md` |

### Document authority

| Topic | Source of truth |
|---|---|
| Product vision, phases, **acceptance criteria** | Build Plan v3 §21.3 |
| API contracts | **Backend plan** (OpenAPI → generated TS types) |
| **Pages, design, workspace UX** | **This frontend plan** |
| Glossary | Build Plan v3 §30 / `docs/GLOSSARY.md` |

Frontend MVP checklist **references** v3 acceptance; it does not redefine it.

### Parallel effort estimate (frontend solo)

| Phase | Frontend focus | ~Duration |
|---|---|---|
| 0–1 | Shell, tokens, projects, static map | 4–5 weeks |
| 2 | Live snapshots, layers, 2D/3D, flow anim | 4–5 weeks |
| 3 | Editor, scenarios, compare, shortcuts, onboarding | 4–5 weeks |
| 4+ | Module UIs, polish | per backend readiness |

---

## Contents

1. [Purpose and Product Principles](#1-purpose-and-product-principles)
2. [Experience Pillars](#2-experience-pillars)
3. [Design System — Visual Language](#3-design-system--visual-language)
4. [Motion and Transition System](#4-motion-and-transition-system)
5. [Iconography and Imagery](#5-iconography-and-imagery)
6. [Information Architecture and Navigation](#6-information-architecture-and-navigation)
7. [Application Shell](#7-application-shell)
8. [Complete Page and Screen Catalogue](#8-complete-page-and-screen-catalogue)
9. [Workspace Modes (Map-Centric)](#9-workspace-modes-map-centric)
10. [Overlay Panels and Dialogs](#10-overlay-panels-and-dialogs)
11. [Component Architecture](#11-component-architecture)
12. [Frontend Folder Map](#12-frontend-folder-map)
13. [State, Data, and Backend Mapping](#13-state-data-and-backend-mapping)
14. [Map / 3D Rendering Plan](#14-map--3d-rendering-plan)
15. [Charts, Tables, and Data Display](#15-charts-tables-and-data-display)
16. [Forms, Editors, and Validation UX](#16-forms-editors-and-validation-ux)
17. [Feedback, Honesty, and Trust UI](#17-feedback-honesty-and-trust-ui)
18. [Responsive, Accessibility, and Scalability](#18-responsive-accessibility-and-scalability)
19. [Performance Budget (Frontend)](#19-performance-budget-frontend)
20. [User Journeys (Mapped End-to-End)](#20-user-journeys-mapped-end-to-end)
21. [Build Order by Phase](#21-build-order-by-phase)
22. [MVP Frontend Checklist](#22-mvp-frontend-checklist)
23. [Risks Specific to Frontend](#23-risks-specific-to-frontend)
24. [Open Frontend Decisions](#24-open-frontend-decisions)
25. [Keyboard Shortcuts Catalogue](#25-keyboard-shortcuts-catalogue)
26. [Resilience, Onboarding, and Deep Links](#26-resilience-onboarding-and-deep-links)
27. [Presentation and Polish Features](#27-presentation-and-polish-features)
28. [Adopted Enhancements Register](#28-adopted-enhancements-register)

---

## 1. Purpose and Product Principles

### What the frontend is for

- Make the simulation **legible** — maps, KPIs, and comparisons readable in seconds
- Make workflows **guided** — template → run → compare → report without getting lost
- Make claims **honest** — calibration badge, assumptions, inconclusive labels always visible
- Make the product feel **professional** — engineering / planning tool, not a game or marketing site
- Stay **scalable** — new modules (evac, hospital, OSM) plug into the same shell and design system

### Hard UX rules

| Rule | Meaning |
|---|---|
| **Map is the stage** | Primary work happens on a large canvas; chrome stays secondary |
| **One job per panel** | Do not dump editor + compare + agent inspect into one crowded drawer |
| **Trust before polish** | Badge, seeds, model version before decorative flourishes |
| **MVP screens only ship when usable** | No fake empty “Coming soon” primary nav for core paths |
| **Motion with purpose** | Animate hierarchy and state change — never constant noise |
| **No dual competing themes** | One light professional theme for MVP; optional denser “presentation mode” later |

### What this is not

- Not a consumer social app
- Not a dark neon cyberpunk dashboard
- Not a purple-gradient SaaS template
- Not a newspaper / broadsheet layout
- Not emoji-driven UI

---

## 2. Experience Pillars

| Pillar | User feeling | Frontend implication |
|---|---|---|
| **Clarity** | “I know where I am and what to do next” | Clear IA, breadcrumbs, mode labels |
| **Control** | “I can run, pause, change, compare” | Persistent sim controls; undo-safe editor |
| **Evidence** | “Numbers are comparable and labelled” | CI tables, badges, mechanism list |
| **Presence** | “The city feels alive but serious” | Smooth layer transitions, restrained motion |
| **Scalability** | “New modules fit the same patterns” | Shared shell, tokens, panel patterns |

---

## 3. Design System — Visual Language

### 3.1 Theme direction (chosen)

**Name:** *Civic Steel*

Professional planning-tool aesthetic: cool neutrals, deep slate chrome, a single **steel-teal** accent for actions, semantic colours for traffic/status. Light workspace by default so maps and charts stay readable for long sessions.

**Avoid deliberately:** purple/violet brand gradients, warm cream + terracotta “AI brochure” look, heavy multi-layer shadows, glow/bloom UI, pill spam, emoji icons.

### 3.2 Colour tokens

#### Foundation

| Token | Role | Guidance |
|---|---|---|
| `--bg-app` | App background | Cool light gray-blue (near `#F4F6F8`) |
| `--bg-surface` | Panels, cards for interaction | White / near-white |
| `--bg-surface-muted` | Nested sections | Soft gray |
| `--bg-chrome` | Top bar / side nav | Deep slate (`#1B2430` range) |
| `--bg-canvas` | Map empty / ground | Neutral map ground, not pure white |
| `--border-subtle` | Dividers | Low-contrast gray |
| `--border-strong` | Focused panels | Slightly stronger |

#### Text

| Token | Role |
|---|---|
| `--text-primary` | Body / titles on light |
| `--text-secondary` | Meta, captions |
| `--text-inverse` | Text on chrome |
| `--text-muted` | Disabled / hints |
| `--text-link` | Inline links (teal family, not purple) |

#### Brand / action

| Token | Role |
|---|---|
| `--accent` | Primary buttons, active nav, focus rings — **steel teal** |
| `--accent-hover` | Hover state |
| `--accent-muted` | Selected row / soft highlight |
| `--accent-contrast` | Text on accent |

#### Semantic (status)

| Token | Role |
|---|---|
| `--success` | Completed runs, distinguishable improvement (when positive is intended) |
| `--warning` | Inconclusive, long-running, validation warnings |
| `--danger` | Failed runs, destructive delete, trapped/critical (use carefully) |
| `--info` | Neutral informational callouts |

#### Simulation / map semantics (mandatory)

| Token | Role |
|---|---|
| `--cong-low` | Free-flow / low V/C — green family |
| `--cong-mid` | Moderate — amber |
| `--cong-high` | Congested — red/orange |
| `--layer-transit` | Transit lines — distinct blue |
| `--layer-zone` | Zone boundaries — soft violet-*neutral* or dashed slate (not brand purple) |
| `--layer-utility` | Utilities — cyan/steel |
| `--fire` | Fire cells — controlled orange-red |
| `--smoke` | Smoke — translucent cool gray |
| `--water-flood` | Flooded links — blue |

Congestion legend must always be visible when congestion layer is on.

#### Calibration badge colours

| Status | Visual |
|---|---|
| `synthetic_uncalibrated` | Amber outline badge |
| `partially_calibrated` | Teal outline badge |
| `calibrated` | Green outline badge |

Never hide the badge in brand colour that looks like “success marketing.”

### 3.3 Typography

| Role | Direction |
|---|---|
| **UI sans** | Distinctive professional sans — e.g. **Manrope** or **Plus Jakarta Sans** (not Inter / Roboto / Arial / system default as the brand face) |
| **Display / page titles** | Same family, semibold; slightly tighter tracking |
| **Data / KPIs / mono** | **IBM Plex Mono** or **JetBrains Mono** for numbers, seeds, IDs |
| **Long report text** | UI sans at comfortable size; avoid decorative serif in the app chrome |

Scale (conceptual): `xs` meta → `sm` body compact → `md` body → `lg` section → `xl` page title → `2xl` rare hero on Welcome only.

### 3.4 Spacing, radius, elevation

| Token set | Guidance |
|---|---|
| Spacing | 4-pt scale (4 / 8 / 12 / 16 / 24 / 32 / 48) |
| Radius | Small and consistent: controls `6–8px`, panels `10–12px` — **not** rounded-full pills everywhere |
| Elevation | One soft shadow level for floating panels; no stacked glow shadows |
| Density | Default “comfortable”; optional “compact” for comparison tables |

### 3.5 Layout grid

| Region | Behaviour |
|---|---|
| Top chrome | Fixed height (~56–64px) |
| Left nav / mode rail | Collapsible 64px icon rail → 240px labelled |
| Main canvas | Fluid; min width protected |
| Right inspector | 320–400px, collapsible |
| Bottom timeline / controls | 56–72px when simulation active |

Desktop-first for MVP (planning tool). Tablet: collapse side rails. Phone: read-only project list + comparison summary only (editing/map not primary on small phones in MVP).

---

## 4. Motion and Transition System

### 4.1 Motion principles

1. **State change visibility** — user must see *what* changed  
2. **Spatial continuity** — panels slide from their dock edge  
3. **Interruptible** — never block input for decorative animation  
4. **Reduced motion** — respect OS `prefers-reduced-motion` (instant crossfade or none)

### 4.2 Motion catalogue (required set)

| Motion | Where | Intent |
|---|---|---|
| **Page route fade + slight rise** | Between top-level routes | Soft orientation |
| **Panel slide-in** | Right inspector, left tools | Spatial docking |
| **Mode crossfade** | 2D ↔ 3D camera switch | Same scene, calm camera morph |
| **Layer opacity ramp** | Toggle heatmap / transit | 150–250ms |
| **Congestion colour tween** | Snapshot updates | Avoid hard pops |
| **Control press feedback** | Play / pause / step | Immediate (&lt;100ms) |
| **Progress determinate bar** | Run progress | Trust |
| **KPI value count-up (subtle)** | Comparison table on load | Emphasis — once only |
| **Toast enter/exit** | Success / fail | Non-blocking |
| **Skeleton shimmer** | Project list loading | Perceived speed |
| **Drawer expand** | Scenario change list | Hierarchy |
| **Split-view wipe** | Before/after (Phase 5) | Presentation |

### 4.3 Timing tokens

| Name | Duration | Use |
|---|---|---|
| `motion-instant` | 80–100ms | Buttons, toggles |
| `motion-fast` | 150–200ms | Hovers, small panels |
| `motion-base` | 250–320ms | Route / drawer |
| `motion-slow` | 400–500ms | 2D↔3D camera, rare |

Easing: standard professional curve (ease-out for entrances, ease-in for exits). No elastic/bounce in primary UI.

### 4.4 Simulation motion vs UI motion

| Kind | Owner |
|---|---|
| Agent / vehicle movement | Map renderer from snapshots |
| UI chrome animation | Design system motion |
| Do not mix | Never animate layout at 60fps while also thrashing the DOM for every agent |

---

## 5. Iconography and Imagery

### 5.1 Icon system

| Decision | Choice |
|---|---|
| Library | **Lucide** (consistent stroke icons) |
| Weight | 1.5–1.75 stroke; optical alignment in 20/24px |
| Usage | Nav, layer toggles, sim controls, empty states |
| Forbidden | Random emoji as primary icons; mixed icon packs |

### 5.2 Icon map (core)

| Concept | Icon intent |
|---|---|
| Projects | Folder / layout grid |
| Workspace / Map | Map |
| Edit roads | Route / pencil-ruler |
| Scenarios | Git-branch / layers-diff |
| Simulate | Play |
| Compare | Columns-2 / git-compare |
| Reports | File-text |
| 3D | Box / orbit |
| Layers | Layers |
| Agents | Users |
| Hospital | Cross (clinical, simple) |
| Evacuation | Exit / flame (careful, not cartoon) |
| Settings | Settings |
| Calibration | Shield-alert / badge |
| Warning | Triangle-alert |
| Success | Check-circle |

### 5.3 Empty states and illustrations

- Prefer **simple line diagrams** (network node-link) over stock photos  
- Empty project list: short instruction + primary CTA “Load template”  
- No mascots, no emoji illustrations  

### 5.4 Brand mark

- Wordmark **METACITY** in chrome (left)  
- Optional compact mark (geometric node-network monogram) — monochrome on slate chrome  
- Tagline only on Welcome / About: “Build it virtually first.”

---

## 6. Information Architecture and Navigation

### 6.1 Route map (application pages)

| Route | Page | Priority |
|---|---|---|
| `/` | Welcome / Home | MVP |
| `/projects` | Project Dashboard | MVP |
| `/projects/new` | New Project Wizard | MVP |
| `/projects/:projectId` | Project Overview | MVP |
| `/projects/:projectId/workspace` | **Main Workspace** (map + modes) | MVP |
| `/projects/:projectId/scenarios` | Scenario Library | MVP |
| `/projects/:projectId/scenarios/:scenarioId` | Scenario Detail / Builder | MVP |
| `/projects/:projectId/runs` | Runs History | MVP |
| `/projects/:projectId/runs/:runId` | Run Detail | MVP |
| `/projects/:projectId/compare` | Comparison Hub | MVP |
| `/projects/:projectId/compare/:comparisonId` | Comparison Result | MVP |
| `/projects/:projectId/reports/:reportId` | Report Viewer | Next |
| `/projects/:projectId/evac` | Evacuation Workspace | Phase 4 |
| `/projects/:projectId/hospital` | Hospital Workspace | Phase 4 |
| `/projects/:projectId/import` | Real Data Import | Phase 7 |
| `/projects/:projectId/calibration` | Calibration Panel | Phase 7 |
| `/projects/:projectId/planner` | AI Planner (assist) | Phase 9 |
| `/settings` | App Settings | MVP (minimal) |
| `/docs/assumptions` | Assumptions & claims help | MVP |
| `*` | Not Found | MVP |

### 6.2 Primary navigation model

**Two levels:**

1. **Global** (outside a project): Welcome, Projects, Settings, Help  
2. **Project** (inside a project): Overview · Workspace · Scenarios · Runs · Compare · Modules…

**Workspace** is not “just another page” — it is a **modeful studio** with internal mode switcher (View / Edit / Simulate / Compare overlay).

### 6.3 Project section nav (side or top subnav)

| Item | Dest | MVP |
|---|---|---|
| Overview | Project Overview | Yes |
| Workspace | Map studio | Yes |
| Scenarios | Scenario library | Yes |
| Runs | Run list | Yes |
| Compare | Comparison hub | Yes |
| Reports | Report list | Next |
| Evacuation | Evac module | Phase 4 |
| Hospital | Hospital module | Phase 4 |
| Import | OSM/GTFS | Phase 7 |
| More… | Calibration, Planner | Later |

Hide non-MVP items entirely (do not show disabled forever). Reveal when phase ships.

### 6.4 Workspace mode switcher (segmented control)

| Mode | Purpose |
|---|---|
| **View** | Inspect layers, play snapshots, orbit |
| **Edit** | Road editor (MVP); facilities later |
| **Scenario** | Apply / preview pending changes |
| **Analyze** | Open comparison / KPI side panel against last results |

Only one edit tool active at a time.

### 6.5 Breadcrumbs

Always: `Projects / {Project name} / {Section} / {Optional entity}`

---

## 7. Application Shell

### 7.1 Shell anatomy

```text
┌──────────────────────────────────────────────────────────────┐
│ Top bar: Logo | Project switcher | Calibration chip | Help   │
├────────┬───────────────────────────────────────────┬─────────┤
│ Project│                                           │ Inspector│
│  nav   │              MAIN OUTLET                  │ (context)│
│        │         (page or workspace canvas)        │          │
│        │                                           │          │
├────────┴───────────────────────────────────────────┴─────────┤
│ Status bar: connection | last run | model_version | seeds    │
└──────────────────────────────────────────────────────────────┘
```

Inside **Workspace**, bottom bar becomes **Simulation Control Strip**.

### 7.2 Top bar contents

| Element | Behaviour |
|---|---|
| Logo | Link to Welcome or Projects |
| Project switcher | Dropdown of recent projects |
| Section title | Current area |
| Calibration chip | From active scene/comparison |
| Run status pill | Idle / Running / Failed |
| Help | Assumptions drawer |

### 7.3 Status bar

- API connection indicator  
- `model_version` · `schema_version`  
- Active seed (when viewing a run)  
- Snapshot Hz / sim speed when live  

---

## 8. Complete Page and Screen Catalogue

For each page: purpose, layout, key UI blocks, states, motion, priority.

---

### P0 — Welcome / Home (`/`)

| Aspect | Plan |
|---|---|
| **Purpose** | Orient; brand; enter product |
| **Layout** | Split or stacked: brand + short pitch left/top; CTAs; recent projects |
| **Blocks** | Wordmark, one-line pitch, Primary CTA “Open projects”, Secondary “Load Nexus City template”, Recent list, Claims note link |
| **States** | Empty recent; loading recent; API down banner |
| **Motion** | Soft entrance of CTA group; recent list stagger |
| **Priority** | MVP |

Keep first viewport calm: brand, one headline, one supporting line, CTAs, optional recent — no KPI spam.

---

### P1 — Project Dashboard (`/projects`)

| Aspect | Plan |
|---|---|
| **Purpose** | Find and open projects |
| **Layout** | Toolbar + responsive grid/list of project tiles |
| **Blocks** | Search, sort, “New project”, template shortcuts, project card (name, updated, calibration, thumbnail map later) |
| **States** | Empty, loading skeleton, error |
| **Motion** | Card hover lift (subtle); skeleton → content fade |
| **Priority** | MVP |

---

### P2 — New Project Wizard (`/projects/new`)

| Aspect | Plan |
|---|---|
| **Purpose** | Create project with correct starting scene |
| **Steps** | 1 Name & description → 2 Start from (Template / Blank / Import later) → 3 Confirm parameters summary → Create |
| **Blocks** | Stepper, template cards (Nexus City, Campus, Hospital), validation |
| **States** | Invalid name; creating spinner; success redirect to Overview |
| **Priority** | MVP (Import step disabled until Phase 7) |

---

### P3 — Project Overview (`/projects/:id`)

| Aspect | Plan |
|---|---|
| **Purpose** | Project home: status, shortcuts, last results |
| **Layout** | Header + 3 columns: Scene summary · Recent runs · Quick actions |
| **Blocks** | Calibration badge, open Workspace, run baseline CTA, last comparison snapshot (mini table), assumptions link |
| **Priority** | MVP |

---

### P4 — Main Workspace (`/projects/:id/workspace`) — **core screen**

| Aspect | Plan |
|---|---|
| **Purpose** | Map-centric studio for view / edit / simulate |
| **Layout** | Full canvas; left tool rail; right inspector; bottom sim strip; floating layer control |
| **Blocks** | See §9 |
| **Priority** | MVP |

This is the hardest and most important frontend surface — plan capacity accordingly.

---

### P5 — Scenario Library (`/projects/:id/scenarios`)

| Aspect | Plan |
|---|---|
| **Purpose** | List and manage scenario diffs |
| **Blocks** | Table/cards: name, change count, last run, actions (edit, run, compare, duplicate) |
| **Empty** | CTA “Create scenario” + **“Try Highway Bypass preset”** (from `GET /presets`) |
| **Priority** | MVP |

---

### P6 — Scenario Builder / Detail (`/scenarios/:scenarioId`)

| Aspect | Plan |
|---|---|
| **Purpose** | Author ordered change list |
| **Layout** | Left: change list; Right: preview map (diff highlight); Top: validate + run |
| **Blocks** | Add change menu (`add_link`, `set_lanes`, …), reorder, delete, validation messages, seed multi-select (default 0–9) |
| **States** | Invalid scenario (blocked run); validating; ready |
| **Motion** | List item add/remove; map highlight pulse once on select |
| **Priority** | MVP |

---

### P7 — Runs History (`/projects/:id/runs`)

| Aspect | Plan |
|---|---|
| **Purpose** | Job monitoring and audit |
| **Blocks** | Filters (status, scenario), table: run id, scenario, seeds, status, gap, created, actions |
| **States** | Queued/running progress; failed with error expand |
| **Priority** | MVP |

---

### P8 — Run Detail (`/runs/:runId`)

| Aspect | Plan |
|---|---|
| **Purpose** | Single replication deep dive |
| **Blocks** | Meta (seed, versions, params), KPI strip, link table, equilibrium meta, “Open in workspace replay”, download raw later |
| **Priority** | MVP |

---

### P9 — Comparison Hub (`/compare`)

| Aspect | Plan |
|---|---|
| **Purpose** | Start or reopen comparisons |
| **Blocks** | Pick baseline run set vs scenario run set (or scenarios), create comparison, history list |
| **Priority** | MVP |

---

### P10 — Comparison Result (`/compare/:comparisonId`) — **evidence screen**

| Aspect | Plan |
|---|---|
| **Purpose** | Before/after evidence with uncertainty |
| **Layout** | Top: badge + assumptions summary; Main: KPI table; Side: mechanism trace; Bottom: chart tabs; Link to report |
| **Blocks** | Calibration badge, seed list, CI table with labels, MVP-lite top-3 mechanisms, bar charts (Recharts), delta map entry (later), export HTML |
| **Motion** | Table row reveal; chart mount fade; badge always static (no flashy animation) |
| **Priority** | MVP |

---

### P11 — Report Viewer (`/reports/:reportId`)

| Aspect | Plan |
|---|---|
| **Purpose** | Read HTML report in-app; print |
| **Blocks** | Toolbar print/open external; sandboxed report frame; disclaimer |
| **Priority** | Next |

---

### P12 — Evacuation Workspace (`/evac`)

| Aspect | Plan |
|---|---|
| **Purpose** | Building grid fire drill UX |
| **Blocks** | Floor switcher, fire start tool, play evacuation, KPI clearance/trapped/bottlenecks, 2D/3D building view |
| **Tone** | Serious; careful labelling of “model outcomes” |
| **Priority** | Phase 4 |

---

### P13 — Hospital Workspace (`/hospital`)

| Aspect | Plan |
|---|---|
| **Purpose** | Configure resources; run surge DES |
| **Blocks** | Department/beds/staff forms, arrival scenario, queue charts, wait-time KPIs, compare interventions |
| **Priority** | Phase 4 |

---

### P14 — Import (`/import`)

| Aspect | Plan |
|---|---|
| **Purpose** | OSM bbox → scene; GTFS optional |
| **Blocks** | Map bbox picker (MapLibre), progress, attribution mandatory, validate schema result |
| **Priority** | Phase 7 |

---

### P15 — Calibration (`/calibration`)

| Aspect | Plan |
|---|---|
| **Purpose** | Show fit error; status promotion UI (careful) |
| **Priority** | Phase 7 |

---

### P16 — AI Planner (`/planner`)

| Aspect | Plan |
|---|---|
| **Purpose** | Suggest candidates; always show “verify with full sim” |
| **Priority** | Phase 9 |

---

### P17 — Settings (`/settings`)

| Aspect | Plan |
|---|---|
| **Purpose** | API base URL, snapshot Hz preference, reduced motion, units |
| **Priority** | MVP minimal |

---

### P18 — Assumptions & Claims Help

| Aspect | Plan |
|---|---|
| **Purpose** | In-app claims policy; glossary snippets |
| **Priority** | MVP |

---

### P19 — Not Found / Error boundaries

Friendly recovery; link home; report correlation id if API error.

---

## 9. Workspace Modes (Map-Centric)

### 9.1 Shared workspace chrome

| Chrome piece | Contents |
|---|---|
| **Left rail** | Mode switcher; tool buttons depend on mode |
| **Floating Layer Panel** | Toggles: roads, buildings, congestion, zones, transit, agents, utilities, **accessibility heatmap** (Phase 3/5)… |
| **View toggles** | 2D / 3D; legend; focus home extent; **Capture screenshot**; **Mini-map** (Phase 5) |
| **Right Inspector** | Selection details OR sim KPIs OR edit properties |
| **Bottom Sim Strip** | Play pause step reset · speed 1x–100x · seed · progress · clock time |

### 9.2 View mode

- Pan / zoom / orbit (3D)  
- Click select link/node/facility → inspector  
- Time scrubber when snapshots available  
- No accidental edits  

### 9.3 Edit mode (roads MVP)

| Tool | Behaviour |
|---|---|
| Select | Click entity |
| Add node | Click canvas |
| Add link | Click from-node then to-node |
| Set lanes / speed / capacity | Inspector form |
| Delete | With confirm |
| Validate | Connectivity banner |

Cursor and tool tip always show active tool. Escape cancels multi-click tools.

**Later edit tools:** facility placer; building grid painter (evac); transit line draw.

### 9.4 Scenario mode (in workspace)

- Ghost preview of pending scenario changes on map (new link dashed accent)  
- Docked mini change list  
- “Validate” / “Run scenario” CTAs  

### 9.5 Analyze mode

- Pins last comparison KPIs in inspector  
- Optional delta styling on links (later)  
- Jump to full Comparison Result page  

### 9.6 2D vs 3D inside workspace

| | 2D | 3D MVP | 3D polish |
|---|---|---|---|
| Camera | Orthographic top-down | Perspective | Orbit + walk + day/night + split |
| Editing | Preferred | View-only recommended | View-only |
| Performance | Higher agent count | Instanced meshes | LOD |

Camera switch uses **motion-slow** morph; preserve target look-at.

---

## 10. Overlay Panels and Dialogs

| Overlay | Trigger | Content |
|---|---|---|
| Confirm destructive | Delete link/project | Clear copy; irreversible note |
| Run enqueue | Run baseline/scenario | Seeds, estimated jobs, confirm |
| Validation errors | Invalid scene/scenario | List of issues with jump-to |
| Assumptions drawer | Badge / Help | Claims policy short form |
| Keyboard shortcuts | `?` | Full catalogue (§25) |
| First-run onboarding | First workspace visit | 4-step overlay (§26) |
| Command palette (later) | Ctrl/Cmd+K | Navigate + actions — Phase 10 nice-to-have |
| Toast stack | Async events | Success/fail/info |
| API-down banner | Connectivity loss | Disable mutations; keep read-only |

Dialogs: centre modal with backdrop; focus trap; Esc closes.

---

## 11. Component Architecture

### 11.1 Layers

```text
pages/                  → route-level composition
features/               → domain features (workspace, compare, scenarios…)
entities/               → project, run, scenario display units
shared/ui/              → design system primitives
shared/lib/             → api client, formatters, hooks
app/                    → shell, providers, router
```

### 11.2 Design system primitives (`shared/ui`)

| Primitive | Notes |
|---|---|
| Button | primary / secondary / ghost / danger |
| IconButton | toolbar |
| Input, Select, NumberField | forms |
| Checkbox, Switch | layers |
| Tabs, SegmentedControl | modes |
| Badge, CalibrationBadge | trust |
| Tag, StatusPill | run states |
| Table | dense data |
| Modal, Drawer | overlays |
| Tooltip, Popover | help |
| Toast | feedback |
| Skeleton | loading |
| EmptyState | CTA pattern |
| PageHeader | title + actions |
| Toolbar | workspace tools |
| Legend | congestion / layers |
| KPIStat | mono number + label + delta |
| ProgressBar | runs |
| Breadcrumbs | IA |
| NavRail / SideNav | navigation |
| ResizablePanel | inspector width |

**Cards:** use only for interactive containers (project tile, template picker). Prefer flat sections on dashboards — avoid card soup.

### 11.3 Feature modules

| Feature folder | Owns |
|---|---|
| `features/projects` | Dashboard, wizard, overview |
| `features/workspace` | Canvas chrome, modes, sim strip |
| `features/map-scene` | R3F scene graph, layers |
| `features/editor-roads` | Tools + interactions |
| `features/scenarios` | Library + builder |
| `features/runs` | History + detail + progress |
| `features/compare` | Hub + result + charts |
| `features/reports` | Viewer |
| `features/evac` | Phase 4 |
| `features/hospital` | Phase 4 |
| `features/import-geo` | Phase 7 |
| `features/trust` | Badge, assumptions, disclaimer |
| `features/onboarding` | First-run overlay; shortcuts help |
| `features/resilience` | API-down page/banner; localStorage project cache |
| `features/demo-mode` | Guided presentation walkthrough (Phase 5) |

### 11.4 Map scene component tree (conceptual)

```text
SceneCanvas
  ├── CameraController (ortho | perspective)
  ├── Ground
  ├── RoadLayer (cong colour)
  ├── BuildingLayer (footprint | extrude)
  ├── ZoneLayer
  ├── TransitLayer
  ├── AgentLayer (instanced / dots)
  ├── EditGhostLayer
  ├── SelectionOverlay
  ├── Flood/Fire overlays (modules)
  └── LightingRig
```

---

## 12. Frontend Folder Map

```text
frontend/
├── package.json
├── vite.config.ts
├── index.html
├── public/
│   ├── favicon.svg
│   └── brand/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   ├── shell/
│   │   │   ├── AppShell
│   │   │   ├── TopBar
│   │   │   ├── ProjectNav
│   │   │   ├── StatusBar
│   │   │   └── SimControlStrip
│   │   └── layouts/
│   │       ├── GlobalLayout
│   │       ├── ProjectLayout
│   │       └── WorkspaceLayout
│   ├── pages/                    # thin route pages
│   ├── features/                 # as in §11.3
│   ├── entities/
│   ├── shared/
│   │   ├── ui/                   # design system
│   │   ├── theme/                # tokens, typography, motion
│   │   ├── icons/                # Lucide wrappers / mapping
│   │   ├── lib/
│   │   │   ├── api/              # REST client
│   │   │   ├── ws/               # WebSocket client
│   │   │   ├── format/           # numbers, time, CI
│   │   │   └── guards/
│   │   └── hooks/
│   ├── store/                    # Zustand slices
│   │   ├── projectStore
│   │   ├── sceneStore
│   │   ├── workspaceStore
│   │   ├── simStore
│   │   ├── scenarioStore
│   │   ├── runStore
│   │   ├── compareStore
│   │   └── uiStore               # theme prefs, panels open
│   └── types/                    # shared TS types mirroring API
└── tests/ (Vitest)
```

---

## 13. State, Data, and Backend Mapping

### 13.1 Store responsibilities

| Store | Owns |
|---|---|
| `projectStore` | Current project meta, list |
| `sceneStore` | Active scene JSON, validation, dirty flag |
| `workspaceStore` | Mode, tools, camera, layers, selection |
| `simStore` | Playing, speed, clock t, seed, live snapshot buffer |
| `scenarioStore` | Active scenario draft + library cache |
| `runStore` | Active jobs, statuses, metrics cache |
| `compareStore` | Active comparison payload |
| `uiStore` | Nav collapse, inspector open, toasts, reduced motion |

### 13.2 API ↔ UI mapping

| UI need | Backend |
|---|---|
| Project list/create | Project Service |
| Load template | Template + Scene |
| Save edited scene | Scene validate + Project persist |
| Live congestion | WS snapshot `link_metrics` |
| Agent dots | WS `agents_sample` |
| Enqueue runs | Runs API |
| Progress bar | WS progress + GET run |
| Comparison table | Comparison Service |
| Mechanism list | tracing MVP-lite in comparison payload |
| HTML report | Report Service |
| Bridges demo highlight | Network Analysis endpoints |

### 13.3 WebSocket UX rules

- Connect only when Workspace (or Run Detail live) is open  
- Backoff reconnect with status bar warning  
- Drop frames if UI busy (prefer latest snapshot)  
- Cap render updates to display Hz; do not re-render whole app shell per snapshot  
- **Phase 5+:** apply incremental snapshot diffs; optional **Web Worker** for decode + buffer updates if main-thread budget exceeded  

### 13.4 Types from OpenAPI

- Do **not** hand-maintain duplicate API types long-term  
- Generate from backend `openapi.json` via `openapi-typescript`  
- CI fails if generated files drift  

### 13.5 Optimistic UI

- Layer toggles: local immediate  
- Edits: local scene draft; save explicit; **Ctrl+Z** uses scene_history / local undo stack  
- Runs: never fake completion — only real job states 

---

## 14. Map / 3D Rendering Plan

### 14.1 Path A — Synthetic (MVP+)

- Single R3F canvas  
- Ortho = 2D, Perspective = 3D  
- Instanced agents; merged or segmented road meshes  
- Colour buffers updated from snapshot, not full mesh rebuild every frame  

### 14.2 Path B — Real basemap (Phase 7+)

- MapLibre underlay  
- Simulation overlay (deck.gl or synced Three)  
- Clear UI banner: “Geographic basemap mode”  
- Editor complexity higher — keep edit limited at first  

### 14.3 Level-1 flow animation (Phase 2 — preferred over fake cars)

Honest visualisation for volume-delay traffic:

- Animated **flow particles / ribbons** along links in travel direction  
- Particle speed ∝ current link travel time (slower when congested)  
- Particle density ∝ volume  
- Optional sparse agent dots only when zoomed in — never imply microscopic car-following  

### 14.4 Interaction plan

| Input | 2D | 3D |
|---|---|---|
| Drag | Pan | Orbit (rmb/alt patterns documented) |
| Wheel | Zoom | Zoom |
| Click | Select | Select |
| Shift+drag | Box select later | — |

Onboarding tooltip first visit: controls cheat sheet (§26).

### 14.5 Legends (always designed, not afterthought)

- Congestion V/C ramp  
- Mode colours if agents coloured by mode  
- Scenario ghost = dashed accent  
- Accessibility heatmap legend when layer on  

### 14.6 Split-screen comparison wipe (Phase 5)

- Vertical slider on canvas  
- Left = baseline state; right = scenario state  
- Shared camera; dramatic stakeholder reveal  

### 14.7 Screenshot capture (Phase 3 MVP reports)

- Toolbar “Capture screenshot” → canvas `toDataURL` → `POST` screenshots API  
- Insert into HTML report placeholders  
- Optional auto-capture angles later  

### 14.8 Mini-map (Phase 5)

- Collapsible corner overview of full extent + viewport rectangle  
- Click to re-centre main camera 

---

## 15. Charts, Tables, and Data Display

| View | Component plan |
|---|---|
| KPI comparison | Sortable table; mono numbers; CI as `[low, high]`; label chip |
| Bar compare | Recharts grouped bars baseline vs scenario |
| Time series | Line chart for selected KPI over day (when available) |
| Mechanism list | Numbered list, not decorative cards |
| Run progress | Stacked job chips or overall % |

Number formatting: fixed decimals by metric type; never raw floats dumping.

---

## 16. Forms, Editors, and Validation UX

| Pattern | Rule |
|---|---|
| Inline errors | Next to field |
| Form-level summary | Top of builder |
| Disabled primary CTA | Until valid, with reason tooltip |
| Unsaved changes | Guard on navigate |
| Seed input | Multi-select chips 0–9 default; advanced free list later |

Road inspector fields: lanes (int), speed_kph, capacity, road_class.

---

## 17. Feedback, Honesty, and Trust UI

### Always visible in evidence contexts

- CalibrationBadge  
- model_version / schema_version  
- Seed list  
- Link to assumptions  

### Copy tone

- Prefer “modelled”, “under assumptions”, “inconclusive”  
- Avoid “predicts”, “guarantees”, “realistic” without status  

### Run failure UX

- Clear error panel  
- Retry button  
- Do not wipe previous successful comparison  

### Evacuation sensitive metrics

- Label “Simulated model outcomes” near trapped/casualty-style metrics  

---

## 18. Responsive, Accessibility, and Scalability

### Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥1280px | Full studio |
| 1024–1279 | Collapse project nav to icons |
| &lt;1024 | Workspace warns “Desktop recommended”; allow view/compare |
| Mobile | Projects + comparison read-only first |

### Accessibility

- Focus rings using accent  
- Icon buttons have `aria-label`  
- Tables navigable  
- Contrast AA on text/chrome  
- Reduced motion path  
- Do not rely on colour alone for congestion — legend + optional patterns later  

### Scalability (engineering)

- Feature-folder isolation so Phase 4+ does not rewrite shell  
- Design tokens single source — no one-off colours in features  
- Lazy-load heavy routes: workspace, evac, hospital, import  
- Virtualise long run tables  
- Snapshot buffer ring (fixed size)  
- Keep TypeScript types aligned with OpenAPI as backend evolves  

---

## 19. Performance Budget (Frontend)

| Metric | Target |
|---|---|
| First contentful paint (Welcome) | Snappy on mid laptop |
| Workspace interactive | &lt; 3s after project load (local API) |
| UI fps with live snapshots | 30+ with 5k displayed agents (aligned with main plan) |
| Main thread | Snapshot apply &lt; frame budget; debounce noncritical updates |
| Bundle | Lazy route splitting for 3D and charts |

---

## 20. User Journeys (Mapped End-to-End)

### J1 — Flagship bypass demo (MVP)

```text
Welcome → Projects → New (Nexus City template)
  → Overview → Workspace (View)
  → Run baseline (Sim strip / enqueue)
  → Scenarios → create bypass (or preset)
  → Run scenario seeds
  → Compare Result (table + mechanisms + badge)
  → Optional Report
```

### J2 — Edit a road then resimulate

```text
Workspace → Edit mode → modify lanes
  → Save scene → Run baseline → Compare against previous
```

### J3 — Watch live congestion

```text
Workspace → View → play → Layer congestion on
  → Inspector shows selected link V/C over time
```

### J4 — Campus fire (Phase 4)

```text
Project from Campus template → Evacuation Workspace
  → Place fire → Run → Read clearance KPIs → Try add exit scenario
```

### J5 — Hospital surge (Phase 4)

```text
Hospital Workspace → set beds → run surge → compare +20 beds
```

### J6 — OSM import (Phase 7)

```text
Import → draw bbox → wait job → attribution shown
  → validate → open Workspace (basemap mode)
```

Each journey must have a **happy path** without opening more than one “mystery” panel.

---

## 21. Build Order by Phase

### Phase 0–1 (shell + first map) (~4–5 weeks)

1. Vite app, router, theme tokens, typography, Lucide  
2. AppShell, TopBar, StatusBar, basic Projects pages  
3. Welcome + Project Dashboard + New Project (template + **config profile** pick)  
4. Workspace shell with empty canvas  
5. R3F ground + roads from scene JSON (static)  
6. API client + load template; wire **OpenAPI-generated types**  
7. API-unreachable **error page** with retry  

### Phase 2 (alive map) (~4–5 weeks)

1. WebSocket snapshots → congestion colours  
2. **Level-1 flow animation** (particles/ribbons) — prefer over fake cars  
3. SimControlStrip wired to play/pause/speed/seed display  
4. Layer panel  
5. 2D/3D camera toggle (basic)  
6. Link selection + inspector  

### Phase 3 (MVP complete UI) (~4–5 weeks)

1. Road edit tools + save + **undo** (local + scene_history)  
2. Scenario library + builder + **presets CTA**  
3. Runs list + progress UX + interrupted/retry messaging  
4. Comparison hub + result (table, charts, mechanisms, badge)  
5. Assumptions help  
6. **Keyboard shortcuts** (§25)  
7. **First-run onboarding** (§26)  
8. **Screenshot capture** for reports  
9. Offline/API-down banner mid-session  
10. Motion polish; empty/error/loading everywhere  
11. Optional accessibility heatmap if time  

### Phase 4

1. Evacuation workspace UI  
2. Hospital workspace UI  
3. Module entries from `GET /modules` (not hard-coded forever)  

### Phase 5

1. 3D walkthrough; day/night; **split wipe**  
2. **Mini-map**; **URL deep-link** workspace query params  
3. Drag-drop JSON scene onto Projects  
4. **Demo mode** presentation walkthrough  
5. Embeddable comparison HTML; optional video record  
6. Storybook for `shared/ui` (ongoing from Phase 1–2)  
7. Visual regression Playwright baselines  

### Phase 6+

1. Extra layer toggles (utilities, emissions)  
2. Year-loop controls  

### Phase 7

1. Import wizard + MapLibre bbox  
2. Attribution surfaces  
3. Calibration pages  

### Phase 9–10

1. Planner UI with verify CTA  
2. Optional command palette, auth screens  
3. Web Worker snapshot path if needed  

---

## 22. MVP Frontend Checklist

> Master acceptance: **v3 §21.3 Phase 0–3**. This list is a frontend implementation shorthand.

- [ ] Design tokens applied consistently (Civic Steel)  
- [ ] Welcome, Projects, Overview, Workspace, Scenarios, Runs, Compare all routed  
- [ ] Workspace: View + Edit(roads) + live snapshots + **flow animation**  
- [ ] 2D and basic 3D toggle  
- [ ] Sim strip: play/pause/step/reset/speed 1x–100x  
- [ ] Scenario builder + presets empty-state CTA  
- [ ] Comparison table with CI labels + calibration badge + top-3 mechanisms  
- [ ] Screenshot → report placeholders  
- [ ] Keyboard shortcuts + `?` help  
- [ ] First-run onboarding (skippable)  
- [ ] API-down page + mid-session banner  
- [ ] Assumptions accessible from badge  
- [ ] Loading / empty / error states on all MVP pages  
- [ ] Types generated from OpenAPI  
- [ ] Reduced-motion safe  
- [ ] Lazy-loaded workspace bundle  
- [ ] No auth screens  

---

## 23. Risks Specific to Frontend

| Risk | Mitigation |
|---|---|
| Workspace complexity explosion | Mode switcher; one tool at a time; phase tools |
| Snapshot floods React | Isolate canvas store; Web Worker later; minimise React state per frame |
| Dual MapLibre + R3F too early | Synthetic path only until Phase 7 |
| Inconsistent styling | Tokens + Storybook + forbidden one-off colours |
| Fake “AI” chrome | No glow; planner later and clearly assistive |
| Users misread CI | Label chips + assumptions drawer |
| Edit in 3D confusion | Prefer edit in 2D; lock tools in 3D if needed |
| Implying microsimulation | Prefer flow ribbons over dense car models |

---

## 24. Open Frontend Decisions

| Decision | Options | Default leaning |
|---|---|---|
| UI kit base | Custom tokens vs shadcn-style primitives | Custom tokens + headless patterns; optional shadcn later |
| Motion library | CSS + Framer Motion | Framer for routes/panels; CSS for micro |
| Styling | CSS variables + modules / Tailwind | CSS variables design tokens; Tailwind optional if team prefers |
| Map controls help | First-run modal vs permanent `?` | Both: once + `?` |
| Project thumbnails | Static later vs none MVP | None MVP |
| Presentation mode | Fullscreen hide chrome | Phase 5 Demo mode |
| Storybook | Early vs late | Start Phase 1–2 |

---

## 25. Keyboard Shortcuts Catalogue

| Shortcut | Action | Phase |
|---|---|---|
| `Space` | Play / Pause simulation | 3 |
| `Esc` | Deselect / cancel tool | 3 |
| `1`–`4` | Workspace modes View / Edit / Scenario / Analyze | 3 |
| `L` | Toggle layer panel | 3 |
| `I` | Toggle inspector | 3 |
| `Ctrl+S` / `Cmd+S` | Save scene | 3 |
| `Ctrl+Z` / `Cmd+Z` | Undo edit | 3 |
| `2` / `3` | Switch 2D / 3D | 3 |
| `?` | Show shortcuts overlay | 3 |
| `Ctrl+K` / `Cmd+K` | Command palette | 10 optional |

Document in-app; keep conflict-free with browser defaults where possible.

---

## 26. Resilience, Onboarding, and Deep Links

### API / offline

| Situation | UX |
|---|---|
| API unreachable on load | Full-page error with Retry; optional cached project list from `localStorage` |
| API drops mid-session | Persistent banner; disable mutations (save/run); keep last map view read-only |
| WS reconnect | Status bar + backoff; toast on restored |

### First-run workspace overlay (Phase 3)

1. “This is the map. Zoom and pan to explore.”  
2. “Switch modes here: View → Edit → Scenario → Analyze.”  
3. “Use the simulation bar to play and control speed.”  
4. “Compare scenarios to see evidence-based differences.”  

Store `has_seen_onboarding` in `localStorage`. Offer Skip / Don’t show again.

### URL deep-linking (Phase 5)

Example: `/projects/:id/workspace?mode=edit&layers=roads,congestion&view=3d`

Enables shareable views, back/forward between modes, presentation bookmarks.

### Drag-and-drop scene import (Phase 5)

Drop JSON scene on Projects → validate schema → create project (with validation result UI).

---

## 27. Presentation and Polish Features

| Feature | Phase | Notes |
|---|---|---|
| Demo mode | 5 | Precomputed Nexus City walkthrough; fullscreen; narrative overlay |
| Embeddable comparison HTML | 5 | Standalone file for email / slides |
| Video record canvas | 5 | MediaRecorder WebM + sim clock overlay |
| Accessibility heatmap layer | 3/5 | Jobs/services within X minutes by zone |
| Split wipe | 5 | Baseline vs scenario on map |
| Mini-map | 5 | Extent overview |
| Storybook | 1–2 ongoing | Document `shared/ui` states |
| Visual regression | 3+ | Playwright golden screenshots 2D/3D |

---

## 28. Adopted Enhancements Register

Merged from `METACITY_Enhancements.md`:

| ID | Enhancement | Where | Phase |
|---|---|---|---|
| 1.* | Doc authority / acceptance master | Header | 0 |
| 3.1 | Keyboard shortcuts | §25 | 3 |
| 3.2 | API-down handling | §26 | 3 |
| 3.3 | URL deep links | §26 | 5 |
| 3.4 | First-run onboarding | §26 | 3 |
| 3.5 | Drag-drop template | §26 | 5 |
| 3.6 | Mini-map | §14.8 | 5 |
| 6.2 | OpenAPI→TS | §13.4 | 1 |
| 6.3 | Storybook | §27 | 1–2 |
| 8.1 | Accessibility heatmap | layers | 3/5 |
| 8.2 | Flow animation | §14.3 | 2 |
| 8.3 | Split wipe | §14.6 | 5 |
| 8.4 | Screenshot capture | §14.7 | 3 |
| 9.2 | Visual regression | §27 | 3 |
| 10.* | Demo / embed / video | §27 | 5 |
| 12.2–12.3 | Diffs / Web Worker | §13.3 | 5 |

---

## Appendix A — Page Priority Matrix (quick view)

| Page | MVP | Next | Later |
|---|---|---|---|
| Welcome | ● |  |  |
| Project Dashboard | ● |  |  |
| New Project Wizard | ● |  |  |
| Project Overview | ● |  |  |
| Workspace | ● |  |  |
| Scenario Library/Builder | ● |  |  |
| Runs / Run Detail | ● |  |  |
| Compare Hub/Result | ● |  |  |
| Settings / Assumptions | ● |  |  |
| Report Viewer |  | ● |  |
| 3D Walkthrough polish |  | ● |  |
| Evacuation / Hospital |  | ● |  |
| Import / Calibration |  |  | ● |
| AI Planner / Auth |  |  | ● |

---

## Appendix B — One-Page Mental Map

| If you are building… | Start in… |
|---|---|
| Colours / type / motion | `shared/theme` |
| Button / badge / table | `shared/ui` |
| Top bar / nav | `app/shell` |
| A new route | `pages/` + `app/router` |
| Map / layers / camera | `features/map-scene` |
| Road drawing tools | `features/editor-roads` |
| Live play/pause | `features/workspace` + `simStore` |
| Scenario UX | `features/scenarios` |
| CI table / charts | `features/compare` |
| Trust badge | `features/trust` |
| Evac UI | `features/evac` |
| API calls | `shared/lib/api` |
| WS snapshots | `shared/lib/ws` + `simStore` |

---

## Appendix C — Alignment Reminder

| Frontend must always show | Comes from backend |
|---|---|
| Calibration status | Scene / comparison payload |
| Seeds | Run / comparison |
| model_version | Run meta |
| Inconclusive labels | Comparison statistics |
| Assumptions | Report + help content |

---

*Companion to Build Plan v3 and Backend Implementation Plan. Keep code-free; update when routes or design tokens change.*
