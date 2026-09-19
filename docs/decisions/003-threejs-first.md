# ADR-003: Three.js (R3F) First for Rendering

## Status: Accepted

## Context
The platform needs to visualize both synthetic/hypothetical cities (where no real-world map exists) and real cities. Typical GIS libraries (MapLibre, Mapbox) assume a geographic basemap (Mercator projection, lat/lon), which makes drawing hypothetical 5km x 5km grids cumbersome.

## Decision
We will build the primary renderer using React Three Fiber (Three.js), supporting both 2D (Orthographic) and 3D (Perspective) views on a local Cartesian coordinate system (metres). MapLibre will only be introduced later (Phase 7+) strictly as a basemap underlay for real-world imported data.

## Consequences
- We avoid the "dual-renderer" complexity for MVP.
- We can easily render synthetic templates (Nexus City).
- We have full control over instanced rendering for agents and buildings for high performance.
