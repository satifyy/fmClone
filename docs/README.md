# Docs Index

This folder is the primary documentation set for the FM Clone monorepo.

## Start here

- [overview.md](./overview.md): product shape, architecture summary, and package layout
- [setup.md](./setup.md): local development, install, run, and verification
- [architecture.md](./architecture.md): backend module boundaries and request flow
- [simulation.md](./simulation.md): pure engine contract, internals, and balancing notes
- [api.md](./api.md): route inventory and current behavior
- [data-model.md](./data-model.md): current persistence approach and target Prisma model
- [frontend.md](./frontend.md): web app structure and UI direction
- [testing.md](./testing.md): current checks and recommended coverage growth
- [changes.md](./changes.md): active cycle tracker for new implementation gaps and follow-up tasks
- [roadmap.md](./roadmap.md): phased implementation priorities from scaffold to fuller v1

## Current state

The repo is runnable and the current milestone scope is implemented.

- `apps/api` serves the expanded route surface used by dashboard, inbox, tactics, standings, analytics, scouting, transfers, and finance pages
- `packages/simulation` remains the deterministic pure match engine used by backend simulation flows
- `apps/web` is wired to the API client for primary surfaces, with fallback data where appropriate
- Prisma-backed world persistence is in place through `world_state` payload storage (not yet fully normalized domain persistence)

For new work, use [changes.md](./changes.md) as the active tracker for fresh gaps, regressions, or follow-up enhancements.
