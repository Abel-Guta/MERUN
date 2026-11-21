# Architecture

## Data flow

```
browser                                          server
Feed ─► useRuns ─► lib/api.ts ── GET /api/runs ──► Route Handler ─► store (Supabase)
 │                     │
 │                     └─ lib/parse.ts (validates the response)
 ▼
FeedCard (run) × N ─► lib/format.ts (display + spoken text)
```

The feed page (`/feed`) is prerendered with the loading state; the browser then
fetches the first page of runs. The landing page (`/`) is fully static and
fetches nothing. `app/layout.tsx` wraps every route with the skip link; the
route groups `(marketing)` and `(app)` add their own header and `<main>`.
The two groups share one root layout, so moving between them is a normal
client navigation.

## Rendering

- The app uses the Next.js App Router. `layout.tsx` and `page.tsx` are server
  components and are prerendered at build time.
- Public pages are static or server-rendered. The landing page (`/`) is static
  and is made only of server components; its artwork is inline SVG and its one
  animation is CSS.
- The feed (`/feed`) is client-rendered. `Feed` is marked `'use client'` because it
  owns browser-side fetching (`useRuns`); `FeedCard` has no interactivity and has no
  directive, but it ships in the client bundle because `Feed` imports it. Put
  `'use client'` on the smallest component that needs state, effects or event
  handlers (for example a like button), not on whole pages.
- The API lives in this project as Route Handlers. Keep server logic in plain
  modules (not inside the handlers) so it can be extracted later.

## Client data loading

- `lib/api.ts` (`fetchRuns`) calls `GET /api/runs` and throws on a non-OK status
  or an unexpected shape. The UI shows a fixed message; server error text is
  not displayed.
- `lib/parse.ts` (`parseRun`, `parseRunsPage`) takes `unknown`, never throws,
  and returns `null` for invalid data. A malformed response envelope is an
  error; a malformed item is dropped so one bad run does not blank the feed.
  It checks types only; range checks and fallbacks stay in `format.ts`.
- `hooks/use-runs.ts` (`useRuns`) holds the state: first page (with abort on
  unmount or retry), `loadMore` with the cursor, de-duplication by id, and
  failure flags for both. There is no data-fetching library yet; consider SWR or
  TanStack Query if caching or revalidation is needed.
- Page size is 10 (`PAGE_SIZE`); the API allows up to 50.

## Code organization

Feature-based modular monolith. A feature owns its UI, types, server logic and
data; `app/` only wires routes to features; `shared/` holds code that two or
more features need.

```
src/app/                routing only (pages, layout, one-line route files)
src/features/<name>/    index.ts (client-safe), server/index.ts (server only),
                        lib/ (pure helpers), components/, types.ts
src/shared/             never imports features/ or app/
```

Rules (enforced by `no-restricted-imports` in `.oxlintrc.json`, and by
`server-only` at build time):

- Other code imports a feature only through `@/features/<name>` or
  `@/features/<name>/server`, never deeper paths.
- Features do not import other features or `app/`. Inside a feature, use
  relative imports.
- `shared/` does not import features or `app/`.
- Components do not import server code. Server modules start with
  `import 'server-only'`, so a client import fails the build.
- Imports that cross a top-level folder use the `@/` alias (`src/`).

When a second feature needs something from the first, move it to `shared/`
rather than importing across features. The lint patterns apply to every feature
under `src/features/`, so adding a feature needs no config change.

## API (`src/app/api`)

Route files only re-export handlers from `src/features/runs/server`. Handler
logic, validation and storage live in `features/runs/server/` (`handlers.ts`,
`validate.ts`, `store.ts`), and `shared/server/http.ts` holds the error
response helper, so the backend can be extracted later. Handlers are not
cached.

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
- Storage is Supabase (`runs` and `profiles` tables), read and written only by
  the server with the secret key. `getRun` returns 404 for an id that is not a
  UUID instead of letting Postgres fail.
- There is no auth. `createRun` looks up the `abel` profile id
  (`currentProfileId` in `store.ts`) and inserts the run with it. This is a
  temporary mock: it is deleted when auth is built and the id comes from the
  session.

## Types (`src/features/runs/types.ts`)

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
| `RootLayout` (`app/layout.tsx`) | Skip link, then the route group's layout | Loads the font and sets the page metadata |
| `MarketingLayout` (`app/(marketing)/layout.tsx`) | `<header>` with the wordmark and a `Feed` link, `<main id="main">`, `<footer>` | `main` has `tabIndex={-1}` so the skip link can move focus into it |
| `HomePage` (`app/(marketing)/page.tsx`) | `<Landing />` | Static. The `<h1>` is the hero headline, so the header has none |
| `AppLayout` (`app/(app)/layout.tsx`) | `<header>` with the wordmark as the `<h1>`, `<main id="main">` | Same `main` focus rule |
| `FeedPage` (`app/(app)/feed/page.tsx`) | `<Feed />` | No data passed; the feed fetches its own |
| `RunPage` (`app/(app)/run/page.tsx`) | `<Tracker />` | Static; the tracker is a client component |
| `Tracker`, `TrackerStatus`, `TrackerStats`, `TrackerControls` | See "Run tracker" above | The tracker screen at `/run` |
| `Landing` | Hero, `AnnotatedRun`, `Accessible`, `Closing` sections | Each section is a `<section>` named by its `<h2>`. The hero artwork is `aria-hidden`; the example run is labelled as not live data |
| `Feed` | `<section>` labelled by an `<h2>` with `aria-busy`, a `<ul>` of cards | Client component. States: loading (skeletons, hidden "Loading runs" status), error (`role="alert"` and a "Try again" button), empty (`<output>`), ready, plus a "Load more runs" button |
| `FeedCard` | One `<article>` labelled by its `<h3>` title | Header (avatar, name, username, date, location), notes, stats `<dl>` |

Cards use `<h3>` because the feed page outline is `h1` (wordmark) → `h2` (feed)
→ `h3` (run). On the landing page the `<h1>` is the headline and each section
is an `<h2>`. Keep that nesting if you add sections.

## Formatting helpers (`src/features/runs/lib/format.ts`)

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

## Run tracker (`lib/geo.ts`, `lib/tracker.ts`, hooks, components)

Recording a run in the browser, in three layers. The logic modules in `lib/`
use no React or browser APIs, so they can move into a mobile wrapper
unchanged. Two hooks connect them to the browser. Four components show the
result at `/run`. Nothing is saved yet.

- `distanceKm(a, b)` is the haversine distance between two points.
- `totalDistanceKm(fixes)` sums the hops along a list of fixes
  (`{ lat, lng, accuracy }`, accuracy in metres). It skips fixes with accuracy
  above `MAX_ACCURACY_M` (30) and hops shorter than the larger of `MIN_HOP_M`
  (3) and the fix's own accuracy. Each fix is compared with the last
  *accepted* fix, so a stationary wobble never accumulates while slow real
  movement still does. The thresholds are starting values to tune on real
  runs. These two take plain typed `Point` and `Fix[]` and do no validation.
- `toFix(position)` in `lib/position.ts` is the boundary: it takes the
  browser's `GeolocationPosition` as `unknown`, checks that latitude, longitude
  and accuracy are finite and in range, and returns a `Fix` or `null`. Callers
  drop the `null`s. Accuracy 0 is accepted.
- `trackerReducer(state, event)` is a state machine: `idle`, `running`,
  `paused`, `finished`, driven by `start`, `pause`, `resume`, `stop`, `reset`.
  Illegal moves return the same state. The state stores banked `elapsedMs` and
  the `resumedAt` of the current stretch, so paused time is never counted. The
  caller passes the time in each event (`at`), so the reducer never reads the
  clock. Parameters are plain types: the hook that calls it is trusted.
- `elapsedSec(state, now)` gives whole seconds, for display and for the API's
  `durationSec`.
- A device clock moved backwards mid-run counts as a zero-length span, so the
  duration is never negative.

### Hooks

- `useGpsWatch(active, onFix)` (`hooks/use-gps-watch.ts`) wraps
  `navigator.geolocation.watchPosition` with high accuracy and no cached
  positions. While `active` is true it passes each position through `toFix` and
  calls `onFix` with the valid ones; it stops the watch when `active` turns
  false or on unmount. It returns `{ error }`: `'unsupported'`, `'denied'` or
  `'unavailable'`. `onFix` is a callback, not returned state, so two positions
  arriving in one render are never merged into one. `onFix` must keep the same
  identity between renders, or the effect restarts the watch every render.
- `useTracker()` (`hooks/use-tracker.ts`) combines `trackerReducer`, a list of
  fix *segments* (a new one on every start and resume, so travel while paused is
  never measured), a one-second `now` tick and `useGpsWatch`. It returns
  `{ status, startedAt, distanceKm, durationSec, error, start, pause, resume,
  stop, reset }`. Elapsed time comes from clock differences, not from counting
  ticks, so a throttled background tab does not drift.
- Time lives in the reducer and the fixes live in separate state; the hook keeps
  them in step (its `start` and `resume` check the status). Moving the fixes
  into the reducer as a `fix` event would give one source of truth; not done.
- `error` is kept until a good position arrives. A pause or resume does not
  clear it, and a resume calls `watchPosition` again.

### Components

Each is a function of plain props except `Tracker`, which owns the hook.

- `TrackerStatus` renders an `<output>` (a live region) saying "Ready",
  "Running", "Paused" or "Run finished", with an `aria-hidden` square mark.
- `TrackerStats` renders time and distance in a `<dl>`, with one km tick per
  whole kilometre as in the feed card. The time has no spoken label because it
  changes every second; the clock is not inside a live region.
- `TrackerControls` renders the buttons for the status: Start; Pause or Resume
  with Stop; New run when finished. The first button is the same element in
  every state and only changes its label, so keyboard focus survives Pause to
  Resume. Stop asks "End this run?" in a `<fieldset>` first: "Keep going" gets
  focus (so a reflex Enter cancels) and Escape cancels, returning focus to
  Stop. When the run finishes, focus moves to New run. The clock keeps running
  while the question is open.
- `Tracker` (`components/Tracker.tsx`) calls `useTracker` and lays out the
  three, under an `<h2>`. It does not show the hook's `error`: a denied
  location leaves the distance at zero while the time keeps counting.

## Styling

- Global tokens and utilities live in `src/app/globals.css`: color variables,
  `:focus-visible` ring, `.visually-hidden`, `.skip-link`, reduced-motion rule.
- Component styles live beside the component (`Feed.css`, `FeedCard.css`) and
  use BEM-style class names (`feed-card__title`).
- Colors must come from the variables so contrast stays verified in one place.

## Tooling

- Vitest (`npm test`, `vitest.config.ts`) in the node environment. Tests live
  in a `tests/` subfolder of the folder they cover, as `*.test.ts` (`.tsx` for
  components).
- Component tests use jsdom and Testing Library, switched on per file with a
  `// @vitest-environment jsdom` first line, so server tests stay in node. They
  call `afterEach(cleanup)` themselves because test globals are off, query by
  role or label like a user would, and replace `fetch` with `vi.stubGlobal`.
  `server-only` is aliased to the package's own `empty.js` (the file Next.js
  picks for server code); without it Vitest loads the default file, which
  throws. `handlers.test.ts` replaces `../store` with `vi.mock`, so the real
  handlers and `validate.ts` run against a fake data layer and no Supabase env
  vars are needed (store behavior is a known gap in AGENTS.md).
  `formatDate` tests assert shape, not text, because output depends on locale.
- `oxlint` with the `react`, `typescript`, `oxc` and `jsx-a11y` plugins
  (`.oxlintrc.json`).
- `next build` type-checks as part of `npm run build`, with `strict` enabled
  in `tsconfig.json`.
- `react/only-export-components` is off for `src/app/**` because Next requires
  layouts to export `metadata`.
