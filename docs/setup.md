# Setup

## Requirements

- Node.js 24+
- `corepack` enabled
- `pnpm`

## Install

```bash
corepack pnpm install
```

## Run the apps

Start both frontend and backend:

```bash
corepack pnpm dev
```

Run only the API:

```bash
corepack pnpm --filter @fm/api dev
```

Run only the web app:

```bash
corepack pnpm --filter @fm/web dev
```

## Verification

Workspace lint and type-check:

```bash
corepack pnpm --filter @fm/shared-types lint
corepack pnpm --filter @fm/simulation lint
corepack pnpm --filter @fm/api lint
corepack pnpm --filter @fm/web lint
```

Simulation tests:

```bash
corepack pnpm --filter @fm/simulation test
```

## Prisma note

The schema lives in `apps/api/prisma/schema.prisma`, but the running API currently uses an in-memory `WorldStore`.

That means:

- the backend shape is real
- route behavior is real
- persistence is temporary until repositories are wired to Prisma

## Recommended next setup steps

1. Add `apps/api/.env` with a real `DATABASE_URL`
2. Run `prisma generate` and first migration
3. Replace the in-memory world store with repository-backed services
4. Swap frontend mock data for API calls

