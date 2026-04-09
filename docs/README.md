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
- [changes.md](./changes.md): outstanding implementation work found from current changes
- [roadmap.md](./roadmap.md): phased implementation priorities from scaffold to fuller v1

## Current state

The repo is scaffolded and runnable, but it is not feature-complete yet.

- `apps/api` exposes the intended module boundaries and route surface
- `packages/simulation` is a deterministic pure match engine
- `apps/web` is a static frontend shell using mock data
- Prisma schema exists, but the API currently uses an in-memory world store rather than database-backed repositories

Read the docs with that distinction in mind: some pages describe what is implemented now, and some describe the intended target architecture already reflected by the scaffold.
