# FM Clone

Monorepo scaffold for a fictional soccer management simulation game.

## Workspaces

- `apps/web`: Next.js frontend
- `apps/api`: Fastify API and Prisma schema
- `packages/shared-types`: domain contracts shared across the stack
- `packages/simulation`: pure deterministic match simulation engine

## Quick start

1. Install dependencies with `pnpm install`
2. Start the API and web app with `pnpm dev`
3. Run tests with `pnpm test`

## Status

This repository is scaffolded around a pure simulation core plus a modular monolith API. The API currently includes module boundaries, route skeletons, Prisma schema, and an in-memory bootstrap dataset so the application shape is concrete before database wiring is completed.

