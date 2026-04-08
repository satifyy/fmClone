# Data Model

## Current state

There are two persistence layers in the repo today:

1. a starter Prisma schema in `apps/api/prisma/schema.prisma`
2. an in-memory `WorldStore` used at runtime

The in-memory store exists so the API flow can be exercised before database wiring is finished.

## Current runtime world shape

The `WorldStore` currently holds:

- saves
- active save id
- season state
- clubs
- players
- fixtures
- standings
- tactics
- matches
- training plans
- transfer offers

This is useful for scaffolding, but it compresses too many concerns into one object.

## Prisma starter schema

The schema currently includes:

- `Save`
- `Season`
- `Club`
- `Player`
- `Fixture`

This is a partial starting point, not the full target schema.

## Target relational model

Recommended major table groups:

### World

- `saves`
- `leagues`
- `seasons`
- `competitions`
- `clubs`
- `managers`

### Players

- `players`
- `player_attributes`
- `player_positions`
- `player_traits`
- `player_contracts`
- `player_injuries`
- `player_development_logs`

### Tactics and training

- `tactics`
- `tactic_role_assignments`
- `training_plans`

### Competition

- `fixtures`
- `matches`
- `match_events`
- `match_player_stats`
- `standings`
- `season_awards`

### Transfers

- `transfer_windows`
- `transfer_offers`
- `transfer_history`
- `loans`

### Analytics

- `player_form_snapshots`
- `club_form_snapshots`
- `tactical_reports`

## Persistence rules

Important data rules to keep when Prisma wiring starts:

- all mutable world entities should be save-scoped
- fixtures should move through `scheduled`, `locked`, and `simulated`
- match simulation output should be persisted as both summary and normalized rows
- standings updates should happen transactionally with match completion
- cards and injuries must remain queryable for future eligibility checks

## Recommended migration order

1. expand Prisma schema to cover core world, player, fixture, and match records
2. seed a single fictional league and clubs
3. replace `WorldStore` reads with repositories
4. replace `WorldStore` writes with transactions
5. retain `WorldStore` patterns only for tests or dev-only fixtures if needed

