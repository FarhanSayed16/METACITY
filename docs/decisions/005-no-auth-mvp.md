# ADR-005: No Authentication for MVP

## Status: Accepted

## Context
Adding authentication (users, login screens, JWT tokens, row-level security) adds significant overhead to both frontend and backend development.

## Decision
The MVP will not include any authentication or authorization. It assumes a "localhost trust model" where a single user is running the software on their machine, or a small trusted team is accessing a shared instance.

## Consequences
- Faster development of the core simulation value.
- The UI can boot directly into the Project Dashboard.
- We must ensure we don't expose sensitive endpoints if deployed to the public internet (it shouldn't be for MVP). Auth will be added in Phase 10 if needed.
