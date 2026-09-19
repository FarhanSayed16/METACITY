# ADR-004: SQLite + Parquet for MVP Persistence

## Status: Accepted

## Context
We need to store project metadata, scenarios, and large simulation results (KPIs, equilibrium iterations). Setting up PostgreSQL requires Docker and infrastructure overhead for new developers or users wanting to run locally.

## Decision
For MVP, we will use SQLite for relational metadata (projects, runs, scenarios) and Parquet files for heavy simulation results (time-series metrics).

## Consequences
- Zero-infrastructure setup: the app runs locally purely from the filesystem.
- SQLite handles concurrency fine for a single user or small team.
- Parquet is highly optimized for analytical queries (via DuckDB) if we need to query the results later.
- If we scale to a multi-tenant cloud offering (Phase 10), we can migrate the SQLite tables to Postgres easily using an ORM (SQLAlchemy) or simple migrations.
