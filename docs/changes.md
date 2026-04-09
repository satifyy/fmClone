# Outstanding Implementation Work

This page captures feature gaps that are still missing from the current scaffold after reviewing the changed files and current UI.

These items are not cosmetic only. Many require new backend routes, richer save data, and simulation or analytics support.

## Dashboard and progression

Still needed:

- [x] actionable dashboard controls instead of read-only summary blocks
- [x] a persistent progress control similar to Football Manager for advancing time
- [x] explicit workflow actions from the dashboard, such as:
  - [x] advance day
  - [x] simulate next fixture
  - [x] review inbox or alerts
  - [x] open training, transfers, and tactics directly
- [x] dashboard widgets that show unresolved tasks, board pressure, scouting updates, injuries, and contract issues

Backend support still needed:

- [x] a save-scoped progression endpoint with richer response payloads than the current season summary
- [x] inbox or notification data model
- [x] pending-action summary endpoint for the active club
- [x] inbox notifications must be clickable and actionable — each notification should route to the relevant page or trigger an in-place action depending on type
- [x] block day advancement when a fixture is scheduled for the current day — the player must simulate or play the match before progressing

## Match center

Still needed:

- [x] a true match center page focused on the live slate and other matches, not a recap block on the main dashboard
- [x] ability to view other league matches during the current matchday
- [x] separation between:
  - [x] live match center
  - [x] your own match result page
  - [x] league-wide fixture scoreboard
- [x] richer match event feeds if live or stepwise simulation is added later

Backend support still needed:

- [x] matchday scoreboard endpoint
- [x] ability to fetch all fixtures and results for a given date or round
- [x] richer match event feeds if live or stepwise simulation is added later

## Squad page

Still needed:

- [x] full squad list rather than a small mocked subset
- [x] recent form or recent match stats per player
- [x] player market value
- [x] row-level click interaction for the full player row
- [x] clearer grouping for starters, bench, reserves, injured, and suspended players

Backend support still needed:

- [x] player value calculation
- [x] recent form snapshots or rolling stats
- [x] squad status classification

## Player profile

Still needed:

- [x] player card layout instead of a long attribute list
- [x] quick-read summary for value, form, morale, contract, role fit, and development trajectory
- [x] sections for season stats, history, injuries, traits, and scouting knowledge

Backend support still needed:

- [x] player statistics history
- [x] contract and valuation fields
- [x] scouting-confidence or knowledge model if the same page is used for external players

## Tactics screen

Still needed:

- [x] interactive tactical controls rather than static instruction display
- [x] formation board with starters, subs, and role placements
- [x] tactical familiarity visible in UI
- [x] visible fitness cost or intensity impact on the squad
- [x] ability to change formation, roles, and instructions with meaningful feedback

Backend support still needed:

- [x] tactic familiarity persistence per club and possibly per player-role combination
- [x] tactical intensity and familiarity calculations
- [x] lineup and bench validation rules
- [x] tactical board DTOs that expose starting XI, bench, and slot-role structure directly

## Fixtures

Still needed:

- [x] calendar view
- [x] list view
- [x] current and past season fixture history
- [x] access to previous seasons
- [x] clearer separation of upcoming, completed, and postponed fixtures

Backend support still needed:

- [x] fixture history queries by season and competition
- [x] season archive support
- [x] pagination or filtering for longer histories

## Standings and team pages

Still needed:

- [x] richer standings table with more columns such as xG and contextual markers
- [x] relegation and promotion zones
- [x] league rules display
- [x] support for multiple leagues later
- [x] historical league tables for prior seasons
- [x] clickable clubs that open team pages

Team page still needed:

- [x] club information
- [x] stadium capacity
- [x] city
- [x] financial status
- [x] colors
- [x] club history
- [x] squad overview and recent results

Backend support still needed:

- [x] club detail endpoint expansion
- [x] league metadata and rules endpoint
- [x] historical standings storage
- [x] xG aggregation at club and league level

## Transfers and scouting

Still needed for transfers:

- [x] list-oriented transfer center focused on:
  - [x] active negotiations
  - [x] incoming targets
  - [x] outgoing offers
  - [x] completed transfer history

Still needed for scouting:

- [x] dedicated scouting page
- [x] scout assignment by region or league
- [x] player discovery pipeline
- [x] estimated attributes with scout uncertainty
- [x] scout quality affecting estimate accuracy

Backend support still needed:

- [x] scouting data model
- [x] scout assignments and territories
- [x] player knowledge model
- [x] uncertain attribute estimates
- [x] transfer list and negotiation state beyond simple offer status

## Finances and board

Still needed:

- [x] financial management page
- [x] wage and transfer budget management UI
- [x] board expectations and confidence UI
- [x] investors or ownership structure
- [x] long-term financial planning as a core mechanic

Backend support still needed:

- [x] finance endpoint (`/clubs/:id/finances`)
- [x] board confidence model
- [x] budget adjustment rules
- [x] ownership and investor events if that system is added

## Season analytics

Still needed:

- [x] a true season analytics page rather than a simple summary screen (season-summary still uses static mock data)
- [x] player, club, tactical, and league-level stats views
- [x] charts for trends over time
- [x] historical comparisons across seasons

Backend support still needed:

- [x] analytics endpoints for club, player, and tactics data
- [x] snapshot tables or precomputed aggregates
- [x] richer analytics endpoints beyond basic shape and risk scores
- [x] archived season stats

## Cross-cutting implementation gaps

These are the systems still needed to support the feature requests above.

Frontend:

- [x] live API client (`lib/api.ts`) replacing frontend mock data for most pages
- [x] season-summary page still uses static mock data — wire to live API

Backend:

- [x] replace in-memory `worldStore` with Prisma-backed persistence
- [x] save-scoped historical data model for previous seasons
- [x] richer data tables: club financials, player history, scouting records, analytics snapshots
- [x] shared DTO expansion for history summaries, UI-friendly detail payloads, and archived season data
