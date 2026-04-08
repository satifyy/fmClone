# API

## Current server

The API is a Fastify app registered in `apps/api/src/app.ts`.

Health route:

- `GET /health`

## Current route surface

### Saves

- `GET /saves`
- `POST /saves`
- `GET /saves/:id`
- `POST /saves/:id/load`

### Clubs

- `GET /clubs/:id`
- `GET /clubs/:id/squad`
- `GET /clubs/:id/finances`
- `GET /clubs/:id/dashboard`

### Players

- `GET /players/:id`
- `GET /players/:id/development`
- `GET /players/:id/form`

### Tactics

- `GET /clubs/:id/tactics`
- `PUT /clubs/:id/tactics`
- `POST /clubs/:id/lineup`

### Training

- `GET /clubs/:id/training`
- `PUT /clubs/:id/training`

### Fixtures and matches

- `GET /fixtures/upcoming`
- `POST /fixtures/:fixtureId/simulate`
- `POST /fixtures/:fixtureId/quick-sim`
- `GET /matches/:id`

### League and season

- `GET /season/current`
- `POST /season/advance-day`
- `POST /season/simulate-week`
- `POST /season/simulate-season`
- `GET /standings`
- `GET /awards`

### Transfers

- `GET /transfers/targets`
- `POST /transfers/offers`
- `POST /transfers/offers/:id/respond`
- `GET /transfers/history`

### Analytics

- `GET /analytics/club/:id`
- `GET /analytics/player/:id`
- `GET /analytics/tactics/:clubId`

### Devtools

- `POST /dev/seed`
- `POST /dev/run-season`
- `GET /dev/balance-report`

## Validation

Current validation uses Zod in route handlers and shared helper schemas.

Examples:

- tactical profile validation
- training plan validation
- transfer offer validation

## Current behavior notes

- routes are functional
- responses come from an in-memory seeded world
- no authentication is implemented
- no save isolation middleware is implemented yet
- no database transaction boundary exists yet

## Recommended API next steps

1. add save-scoped request context
2. move route logic into service classes per module
3. add repository interfaces and Prisma-backed implementations
4. define explicit response DTOs instead of returning internal world store objects directly
5. add API tests with Fastify inject for all write flows

