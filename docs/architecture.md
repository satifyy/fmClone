# Architecture

## Top-level shape

```text
Next.js web
   |
   v
Fastify API
   |
   +--> domain modules
   |
   v
pure simulation package
   |
   v
Prisma / database target
```

## API module boundaries

The API is organized as a modular monolith. Each module should own:

- route registration
- validation
- service logic
- repository access for its aggregate
- mapping between DB models and domain DTOs

Current module folders:

- `analytics`
- `clubs`
- `devtools`
- `fixtures`
- `league`
- `matches`
- `players`
- `saves`
- `seasons`
- `tactics`
- `training`
- `transfers`

## Current orchestration flow

Today, route handlers call methods on a single in-memory `WorldStore`.

This is a scaffold choice, not the target architecture.

The target flow is:

1. Route handler validates request input.
2. Service loads save-scoped world state from repositories.
3. Service maps state into `@fm/shared-types` DTOs.
4. Service calls `@fm/simulation`.
5. Service applies returned deltas in one persistence transaction.
6. Handler returns response DTOs.

## Match simulation flow

The `fixtures` and `matches` capabilities are the core integration point.

Current behavior:

1. Load fixture, clubs, squad slices, and tactical profiles from the in-memory world.
2. Build `MatchContext`.
3. Call `simulateMatch`.
4. Mark the fixture as simulated.
5. Update standings and player condition deltas.
6. Store the match result in memory.

Target behavior:

1. Lock the fixture and validate eligibility.
2. Load database-backed lineup, tactics, injuries, and suspensions.
3. Build `MatchContext`.
4. Call `simulateMatch`.
5. Persist match rows, event rows, cards, injuries, stats, standings, and post-match player updates in one transaction.

## Separation rules

### Simulation package must not import

- Fastify
- Prisma
- route types
- database table types
- HTTP concerns

### Frontend must not own

- simulation logic
- tactical calculation logic
- standing update logic
- transfer resolution logic

### Shared types should contain

- stable domain contracts
- DTOs crossing package boundaries

### Shared types should not contain

- Prisma-generated types
- framework-specific types

