# FM Clone

Monorepo scaffold for a fictional soccer management simulation game.

## Workspaces

- `apps/web`: Next.js frontend
- `apps/api`: Fastify API and Prisma schema
- `packages/shared-types`: domain contracts shared across the stack
- `packages/simulation`: pure deterministic match simulation engine

## Quick start

1. Install dependencies with `pnpm install`
2. Start the stack in the mode you want
3. Run tests with `pnpm test`

## Run modes

### Full stack

Run both the API and the web app:

```bash
pnpm dev
```

What you get:

- the Next.js frontend on its normal dev server
- the Fastify API on `127.0.0.1:4000`
- dashboard, inbox, training, squad, tactics, and other reads backed by the in-memory API world state
- progression and other frontend mutations working against the API

Use this when you want the app to behave as a connected prototype.

### Web only

Run just the frontend:

```bash
pnpm --filter @fm/web dev
```

What changes:

- the web app still renders without the API running
- dashboard, inbox, and training fall back to local mock data when API fetches fail
- pages that already had local fallbacks, such as squad, player profile, and tactics, continue to render
- actions that require API writes, such as progression or other mutations, will still fail until the API is started

Use this when you only need the UI shell or want to work on frontend layout without the backend running.

## Status

This repository is scaffolded around a pure simulation core plus a modular monolith API. The API currently includes module boundaries, route skeletons, Prisma schema, and an in-memory bootstrap dataset so the application shape is concrete before database wiring is completed.

## Documentation

Project docs live in [docs/README.md](./docs/README.md).
