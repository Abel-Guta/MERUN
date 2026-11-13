# Architecture

## Data flow

```
src/data/runs.json
        │  imported, asserted as Run[]
        ▼
 app/page.tsx ──► Feed (runs) ──► FeedCard (run) × N
                                   │
                                   └─ src/lib/format.ts (display + spoken text)
```

Data moves one way, from the page down through props. There is no shared state
yet. `app/layout.tsx` wraps every route with the skip link, header and `<main>`.

## Rendering

- The app uses the Next.js App Router. `layout.tsx` and `page.tsx` are server
  components and are prerendered at build time.
- Public pages (planned) will be static or server-rendered.
- The home feed is client-rendered. `Feed` is marked `'use client'` because it
  will own browser-side fetching; `FeedCard` has no interactivity and has no
  directive, but it ships in the client bundle because `Feed` imports it. Put
  `'use client'` on the smallest component that needs state, effects or event
  handlers (for example a like button), not on whole pages.
- The API will live in this project as Route Handlers. Keep server logic in
  plain modules (not inside the handlers) so it can be extracted later.

## API (`src/app/api`)

Route Handlers are thin. Validation and storage live in `src/lib/server/`
(`validate.ts`, `runs.ts`, `http.ts`) so the backend can be extracted later.
Handlers are not cached.

| Method and path | Result |
|---|---|
| `GET /api/runs?limit=20&cursor=<id>` | `200 { items: Run[], nextCursor: string \| null }`, newest first |
| `GET /api/runs/:id` | `200 Run`, or `404` |
| `POST /api/runs` | `201 Run` with a `Location` header, or `400`/`422` |
| `GET /api/users/:username/runs?limit&cursor` | Same shape as the list, or `404` for an unknown user |

- `limit` is 1 to 50 (default 20). The cursor is the id of the last item on the
  previous page.
- `POST` body: `title`, `location`, `distanceKm` (> 0), `durationSec` (whole
  number > 0), `date` (ISO 8601, not in the future), optional `notes`. Text is
  trimmed; unknown fields are ignored; the server sets `id` and `user`.
- Errors share one shape: `{ error: { code, message, fields? } }`. `fields`
  maps input names to messages. Codes: `invalid_json` (400), `invalid_query`
  (400), `invalid_cursor` (400), `validation_failed` (422), `not_found` (404).
- Storage is an in-memory array seeded from `runs.json`. It resets when the
  server restarts and is not shared between serverless instances, so created
  runs are not durable yet.
- There is no auth. Created runs belong to the first seeded user.

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
| `RootLayout` (`app/layout.tsx`) | Skip link, `<header>` with `<h1>`, `<main id="main">` | `main` has `tabIndex={-1}` so the skip link can move focus into it |
| `HomePage` (`app/page.tsx`) | `<Feed>` | Loads the mock data |
| `Feed` | `<section>` labelled by an `<h2>`, a `<ul>` of cards | Client component. Empty list renders an `<output>` message |
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

- Global tokens and utilities live in `src/app/globals.css`: color variables,
  `:focus-visible` ring, `.visually-hidden`, `.skip-link`, reduced-motion rule.
- Component styles live beside the component (`Feed.css`, `FeedCard.css`) and
  use BEM-style class names (`feed-card__title`).
- Colors must come from the variables so contrast stays verified in one place.

## Tooling

- `oxlint` with the `react`, `typescript`, `oxc` and `jsx-a11y` plugins
  (`.oxlintrc.json`).
- `next build` type-checks as part of `npm run build`, with `strict` enabled
  in `tsconfig.json`.
- `react/only-export-components` is off for `src/app/**` because Next requires
  layouts to export `metadata`.
