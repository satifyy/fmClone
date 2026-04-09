# Frontend

## Current stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

## Current pages

- `/`
- `/match-center`
- `/matches/[id]`
- `/squad`
- `/tactics`
- `/fixtures`
- `/standings`
- `/transfers`
- `/season-summary`
- `/players/[id]`

## Missing frontend pages and upgrades

Still needed in the web app:

- scouting page
- finances and board page
- club detail page
- richer season analytics page
- fixtures calendar view
- historical fixtures and standings views

## Current structure

Main frontend pieces:

- `app/layout.tsx`: root layout
- `components/shell.tsx`: persistent navigation shell
- `components/section-title.tsx`: page heading pattern
- `lib/mock-data.ts`: static domain-shaped data

## Current UI direction

The UI intentionally avoids generic dashboard-card mosaics.

Current visual approach:

- editorial typography
- muted warm background
- dense but readable management screens
- dark navigation rail
- simple tables and sections instead of ornamental card stacks

## Current limitation

The frontend is not connected to the API yet.

It currently:

- renders static mock data
- demonstrates page layout and information hierarchy
- does not persist user actions

## Recommended next frontend steps

1. add a thin API client layer
2. fetch real data for dashboard, squad, fixtures, and standings
3. add mutation flows for tactics, training, and quick simulation
4. add match result and match center pages backed by real simulation output
5. add loading, error, and empty states for each page

## Important UI work still missing

### Dashboard

- convert summary panels into actionable controls
- add a persistent progress action for advancing time
- show pending tasks, alerts, and decision queues

### Squad

- render the full squad
- make each row clickable
- add form, recent stats, and market value columns

### Player view

- replace the long attribute list with a compact player card layout
- add season stats, contract, and form blocks

### Tactics

- make the screen interactive
- add formation map, selected lineup, bench, and role placement
- show tactical familiarity and fitness intensity effects

### Fixtures and standings

- add list and calendar modes for personal club scheduling alongside the league scoreboard
- support history views by season
- expand standings with league context, rules, and team drill-in

### Match flow

- connect `match-center`, `matches/[id]`, and `fixtures` to live API data
- add live refresh or polling once stepwise simulation exists
- support direct navigation from simulation actions into result pages

### Transfers, scouting, finances, season

- make transfers a live list-based workflow
- add a scouting surface with uncertain external player knowledge
- add finances and board management
- turn season summary into a real analytics page

## Frontend boundary rule

The web app should present and collect management decisions.

It should not:

- compute standings
- simulate matches
- calculate player development
- own tactical scoring formulas
