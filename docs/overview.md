# Overview

## Product

FM Clone is a fictional soccer management simulation game with:

- one league in v1
- one user-controlled club
- AI-controlled opponents
- persistent save worlds
- tactical setup with match impact
- event-driven match simulation
- season progression, transfers, training, and dashboard-style management UI

## Monorepo layout

```text
apps/
  api/
  web/

packages/
  shared-types/
  simulation/
```

## Package responsibilities

### `apps/api`

Fastify backend that owns:

- HTTP routing
- request validation
- orchestration across modules
- world-state mutation
- eventual database persistence through Prisma

### `apps/web`

Next.js frontend that owns:

- management UI
- navigation and page layout
- presentation of dashboards, squad, tactics, fixtures, standings, transfers, and player detail

### `packages/shared-types`

Cross-package domain contracts for:

- clubs
- players
- tactics
- fixtures and league state
- match simulation input and output
- save metadata

### `packages/simulation`

Pure deterministic simulation library that:

- accepts normalized match input
- produces ordered events, stats, ratings, cards, injuries, and post-match effects
- does not know about HTTP, Prisma, Fastify, or database models

## Current implementation status

Implemented now:

- workspace scaffold
- shared domain types
- deterministic simulation engine
- Fastify app with modular route registration
- starter Prisma schema
- in-memory seeded world store
- frontend page shell and static mock screens

Not implemented yet:

- database-backed repositories in the API
- real API consumption in the web app
- full training, transfer, and season systems
- advanced analytics and replay tools

## Design rule

The central architecture rule is unchanged:

1. API loads or assembles world state
2. API transforms that state into simulation input
3. API calls the simulation package
4. API receives pure output
5. API persists the resulting world changes

