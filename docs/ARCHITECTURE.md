# Architecture

## Data flow

```
src/data/runs.json
        │  imported, asserted as Run[]
        ▼
   App.tsx ──► Feed (runs) ──► FeedCard (run) × N
                                   │
                                   └─ src/lib/format.ts (display + spoken text)
```

Data moves one way, from `App` down through props. There is no shared state yet.

## Types (`src/types/run.ts`)

```ts
interface User { id; name; username; avatarUrl }
interface Run  { id; user: User; title; distanceKm; durationSec;
                 date /* ISO 8601 */; location; notes? }
```

Each run embeds its user. Units are fixed: distance in kilometres, duration in
seconds. Pace is never stored; it is derived from the two.

## Components

| Component | Renders | Notes |
|---|---|---|
| `App` | Skip link, `<header>` with `<h1>`, `<main id="main">` | `main` has `tabIndex={-1}` so the skip link can move focus into it |
| `Feed` | `<section>` labelled by an `<h2>`, a `<ul>` of cards | Empty list renders an `<output>` message |
| `FeedCard` | One `<article>` labelled by its `<h3>` title | Header (avatar, name, username, date, location), notes, stats `<dl>` |

Cards use `<h3>` because the page outline is `h1` (app) → `h2` (feed) → `h3`
(run). Keep that nesting if you add sections.

## Formatting helpers (`src/lib/format.ts`)

Pure functions. Each metric has a visual form and a spoken form:

| Visual | Spoken (for `aria-label`) | Example output |
|---|---|---|
| `formatDuration` | `durationLabel` | `28:05` / `28 minutes 5 seconds` |
| `formatDistance` | `distanceLabel` | `5.2 km` / `5.2 kilometers` |
| `formatPace` | `paceLabel` | `5:24 /km` / `5 minutes 24 seconds per kilometer` |
| `formatDate` | `formatDateLong` | `Wed, Nov 11` / `Wednesday, November 11, 2026` |

### Contract

- Every parameter is `unknown`. Callers may pass anything.
- Invalid input returns `FALLBACK` (`—`) from visual helpers and
  `FALLBACK_LABEL` (`not available`) from spoken helpers. Nothing throws.
- Invalid means: not a `number` (including numeric strings), `NaN`,
  `±Infinity`, negative, or above the sanity bounds; a date that is not a
  non-empty, parseable string.
- Bounds: duration ≤ 1 year, distance ≤ 100,000 km, pace between 1 s/km and
  99:59 /km. These guard against overflow and nonsense, they are not business
  rules.
- Fractional seconds are rounded to whole seconds.
- Pace needs both distance and duration greater than zero; otherwise it is the
  fallback.
- A duration of `0` is valid: `0:00` visually, `0 seconds` spoken.
- Date output depends on the runtime locale (`toLocaleDateString(undefined)`).

### Adding a helper

Take `unknown`, narrow with the existing guards (`toSeconds`, `toKm`,
`toPaceSec`, `toDate`) or add a new guard, return a fallback on failure, and
add a spoken counterpart if the value appears in the UI.

## Styling

- Global tokens and utilities live in `src/index.css`: color variables,
  `:focus-visible` ring, `.visually-hidden`, `.skip-link`, reduced-motion rule.
- Component styles live beside the component (`Feed.css`, `FeedCard.css`) and
  use BEM-style class names (`feed-card__title`).
- Colors must come from the variables so contrast stays verified in one place.

## Tooling

- `oxlint` with the `react`, `typescript`, `oxc` and `jsx-a11y` plugins
  (`.oxlintrc.json`).
- `tsc -b` runs as part of `npm run build`, with `strict` enabled in both
  tsconfig projects.
