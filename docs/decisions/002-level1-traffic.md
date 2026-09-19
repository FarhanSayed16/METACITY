# ADR-002: Level-1 Traffic (Macroscopic) for MVP

## Status: Accepted

## Context
Simulating traffic can be microscopic (tracking every single vehicle's acceleration, lane changes, car-following) or macroscopic/mesoscopic (tracking volumes on links and calculating delay). Microscopic simulation is computationally expensive and difficult to calibrate.

## Decision
For the MVP, we will use a Level-1 macroscopic volume-delay model (BPR - Bureau of Public Roads function) combined with discrete event trips. Agents will have explicit activity plans and paths, but their travel time will be determined by the aggregated volume on links.

## Consequences
- The simulation will run much faster, allowing multi-seed comparison and scenario evaluation in seconds rather than hours.
- Visualisation will use "flow animation" rather than rendering individual cars, to accurately reflect the underlying model (avoiding false precision).
- If microscopic detail is needed later, it can be added as a specialized module.
