# Roadmap

## Phase 1: scaffold completion

- keep the pure simulation package stable
- move API world logic from route handlers toward module services
- expand Prisma schema to cover real save-scoped entities
- seed a full fictional league and starter world from persistence

## Phase 2: real persistence

- replace the in-memory `WorldStore` with repository-backed services
- add database migrations
- persist matches, standings, cards, injuries, and player condition updates
- add save loading context to every stateful request

## Phase 3: frontend integration

- replace mock data with API fetching
- add real quick sim and full sim UI flows
- add match result screen and match center detail
- wire tactics and training updates to real mutations
- add persistent progression controls for advancing time
- make dashboard, squad, and tactics screens operational rather than read-only

## Phase 4: management depth

- training impact over time
- transfer market and AI recruitment logic
- season rollover and awards
- richer analytics and dashboards
- full squad tables with form and value
- player card pages with season stats and contract context
- historical fixtures and standings views
- club detail pages
- league rules and relegation context
- transfer center workflow
- scouting system with uncertain external player knowledge
- finances, board, and ownership management
- season analytics page with historical comparisons

## Phase 5: balancing and devtools

- bulk season simulation runners
- replay/debug views for match contexts
- balance reports around goals, xG, cards, and injuries
- scenario fixtures for tuning the engine

## Key risks

- letting the simulation package absorb persistence concerns
- letting the frontend own game logic
- overgrowing the in-memory world store instead of replacing it
- adding new systems before save scoping and transaction boundaries are solid
