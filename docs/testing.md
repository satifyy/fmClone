# Testing

## Current checks

Verified today:

- `@fm/shared-types` type-check
- `@fm/simulation` type-check
- `@fm/api` type-check
- `@fm/web` type-check
- simulation unit tests
- Fastify inject smoke test for health, fixture listing, and quick sim

## Existing test coverage

Current automated tests exist in the simulation package:

- deterministic replay for a fixed seed
- basic populated result shape checks

## Recommended unit test expansion

### Simulation

- team strength profile calculation
- tactical modifier effects
- scoring probability ranges
- card frequency behavior
- injury outcome behavior
- checkpoint tactical reactions
- player rating generation
- post-match delta generation

### API services

- save creation and activation
- tactic update validation
- lineup lock behavior
- fixture simulation orchestration
- standings updates
- season advancement
- transfer offer acceptance and rejection

### Frontend

- page render smoke tests
- API client integration tests
- mutation flow tests for tactics and quick sim

## Recommended integration scenarios

1. create a save
2. load the save
3. fetch dashboard and squad
4. update tactics
5. simulate a fixture
6. fetch match result
7. verify standings and player condition changes

## Tooling note

Vitest is already used for the simulation package and can be used across the rest of the workspace for consistency.

