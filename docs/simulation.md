# Simulation

## Goal

The simulation engine is a pure library intended to support:

- single match simulation
- quick sim
- bulk season runs
- balance tooling
- deterministic replay

## Public contract

Primary entrypoint:

```ts
simulateMatch(context: MatchContext): MatchSimulationResult
```

Core types live in `@fm/shared-types`:

- `MatchContext`
- `TeamMatchState`
- `MatchSimulationResult`
- `MatchEvent`
- `PlayerRating`
- `InjuryEvent`
- `CardEvent`
- `PostMatchEffects`

## Current implementation

Current engine pieces:

- seeded RNG
- team strength profile calculator
- checkpoint tactical notes
- event-window match engine

The engine currently simulates six match windows:

- 1-15
- 16-30
- 31-45
- 46-60
- 61-75
- 76-90

Within each window it:

1. chooses an acting side
2. creates a chance event
3. resolves shot quality
4. resolves shot on target
5. resolves goal or corner
6. checks foul/card outcomes
7. checks injury outcomes
8. adds tactical notes at checkpoint windows

## Determinism

Determinism is driven by the seed in `MatchContext`.

If two runs use the same:

- teams
- tactics
- conditions
- fixture context
- seed

they should produce the same result.

This is already covered by the current simulation test.

## Current limitations

The current engine is intentionally lightweight.

Not yet modeled in depth:

- explicit substitutions
- red-card shape changes
- richer set-piece logic
- tactical state transitions beyond textual notes
- player hidden traits in event weighting
- competition-specific behavior
- extra time and penalties

## Target improvements

Recommended next engine increments:

1. make substitutions real state changes, not only notes
2. add line-by-line tactical shifts that modify event probabilities after halftime and late-game checkpoints
3. separate chance creation from shot resolution more clearly
4. add discipline accumulation so second yellows are meaningful
5. add injury severity effects that map cleanly into persistence
6. expose replay/debug payloads for devtools

## Balancing

Use the simulation package as the sole place to tune:

- home advantage
- xG ranges
- foul and card frequency
- injury frequency
- tactical bonuses and penalties
- fatigue burn

Do not spread these constants across the API or frontend.

