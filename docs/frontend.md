# Frontend

## Current stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

## Current pages

- `/`
- `/squad`
- `/tactics`
- `/fixtures`
- `/standings`
- `/transfers`
- `/season-summary`
- `/players/[id]`

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

## Frontend boundary rule

The web app should present and collect management decisions.

It should not:

- compute standings
- simulate matches
- calculate player development
- own tactical scoring formulas

