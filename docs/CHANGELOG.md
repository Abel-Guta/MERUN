# Changelog

What changed, where, and why, in the order it happened. Newest last. Append an
entry for every piece of work (see the rules in [AGENTS.md](../AGENTS.md)).

Entry format: **What** (the change), **Where** (files), **Why** (the reason).

---

## 1. Project scaffold: `0785e1b`

- **What:** Vite + React + TypeScript project created and dependencies
  installed.
- **Where:** repository root (`package.json`, `vite.config.ts`, `tsconfig*.json`,
  `index.html`, `src/`).
- **Why:** Starting point chosen by the owner: React, Vite, TypeScript.

## 2. Remove Vite boilerplate: `dc47d5c`

- **What:** Deleted the demo content and replaced `App` with a bare component.
- **Where:** removed `src/assets/`, `src/App.css`, `public/icons.svg`; rewrote
  `src/App.tsx` and `src/index.css`. Kept `public/favicon.svg` because
  `index.html` references it.
- **Why:** A clean base so nothing demo-related leaks into the product.

## 3. Feed and feed card with mock data: `9e039db`

- **What:** A feed of run cards showing the user and the run they did.
- **Where:**
  - `src/types/run.ts`: `User` and `Run` types.
  - `src/data/runs.json`: three mock runs, each embedding its user.
  - `src/lib/format.ts`: duration, pace and date formatters.
  - `src/components/FeedCard.tsx` and `.css`: one run card.
  - `src/components/Feed.tsx` and `.css`: the list.
  - `src/App.tsx`: loads the JSON and renders `<Feed>`.
- **Why:** The MVP needs to display runs. Pace is derived rather than stored to
  avoid data that can disagree with itself. Plain CSS keeps the stack small.

## 4. Accessibility pass: `2aef937`

- **What:** Semantic HTML, labels and ARIA across the feed, plus `jsx-a11y`
  linting.
- **Where:**
  - `src/App.tsx`: skip link, `<header>`, `<main id="main" tabIndex={-1}>`.
  - `src/components/Feed.tsx`: `<section>` labelled by an `<h2>`, `<ul>`/`<li>`
    list, empty state as `<output>`.
  - `src/components/FeedCard.tsx`: `<article>` labelled by its title,
    `<time dateTime>`, `<dl>` stats, `aria-label` on stat values, decorative
    avatar (`alt=""`), `aria-hidden` separators.
  - `src/lib/format.ts`: spoken-text helpers (`durationLabel`, `paceLabel`,
    `distanceLabel`, `formatDateLong`).
  - `src/index.css`: color variables, `:focus-visible` ring, `.visually-hidden`,
    `.skip-link`, reduced-motion rule, darker muted text for contrast.
  - `src/components/*.css`: hard-coded colors replaced with variables.
  - `.oxlintrc.json`: added the `jsx-a11y` plugin.
- **Why:** The owner wants a strong accessible base now instead of retrofitting
  later. Screen readers read `km` and `5:24` badly, so spoken labels are
  generated in one place. The lint rules catch regressions automatically. The
  `<output>` element replaced `role="status"` because the lint rule
  `prefer-tag-over-role` flagged the latter.

## 5. Harden format helpers: `cb63230`

- **What:** Formatting helpers no longer trust their arguments.
- **Where:**
  - `src/lib/format.ts`: all parameters are `unknown`; private guards
    (`toSeconds`, `toKm`, `toPaceSec`, `toDate`) validate input; invalid input
    returns `FALLBACK` (`—`) or `FALLBACK_LABEL` (`not available`); added
    `formatDistance`.
  - `src/components/FeedCard.tsx`: distance goes through `formatDistance`
    instead of calling `.toFixed` on the raw value.
- **Why:** Input validation is planned but not built, and the owner's rule is
  that functions must be safe regardless. Defects fixed: `.toFixed` threw on
  non-numbers; fractional seconds rendered as `0:5.5`; zero distance or time
  gave `Infinity`/`NaN` pace; a zero-length run produced an empty spoken label.
  Sanity bounds (about 1 year, 100,000 km, pace under 100 min/km) prevent
  overflow and nonsense output.
- **Verified:** build and lint pass. A scratch script (not in the repo) checked
  11 invalid values against every helper, plus zero and valid cases, and all
  passed.

## 6. Comment cleanup, agent documentation: `cb63230` (comments), docs pending commit

- **What:** Rewrote the comments in `format.ts` and added the project docs.
- **Where:**
  - `src/lib/format.ts`: removed section banners and comments that restated the
    code. Extracted `splitDuration` to remove the duplicated
    hours/minutes/seconds arithmetic in `formatDuration` and `durationLabel`.
    Behaviour is unchanged. (Comments were trimmed further in entry 7.)
  - `AGENTS.md`: entry point with commands, layout, rules, conventions, known
    gaps.
  - `docs/ARCHITECTURE.md`: data flow, components, formatter contract.
  - `docs/ACCESSIBILITY.md`: checklist and form guidance.
  - `docs/CHANGELOG.md`: this file.
- **Why:** The comments read as generated and narrated the code instead of
  explaining decisions. The docs let a new agent or contributor get the
  project's rules and context without rediscovering them. Behaviour of
  `format.ts` was re-checked against the same scratch script after the
  refactor.

## 7. TypeScript strict mode, comments moved to the docs: `96f4626` (strict mode) and `cb63230` (comments)

- **What:** Enabled `"strict": true` and removed `format.ts` comments that the
  docs already cover.
- **Where:**
  - `tsconfig.app.json` and `tsconfig.node.json`: added `"strict": true`. The
    Vite template ships without it. The code already type-checked under strict,
    so no source changes were needed.
  - `src/lib/format.ts`: the module comment is now one line pointing to
    `docs/ARCHITECTURE.md`, which holds the contract and the output examples.
    Per-function comments were deleted because the formatter table in that doc
    shows the same examples. One comment remains: why the upper bounds exist
    (`toFixed` goes exponential at 1e21), since the docs do not explain that.
  - `AGENTS.md`: removed the "strict not enabled" known gap and added a note
    not to weaken it. `docs/ARCHITECTURE.md`: tooling section mentions strict.
- **Why:** Strict mode catches null/undefined and implicit `any` errors at
  compile time, which fits the project's rule of not trusting data. Keeping the
  contract in one place (the doc) avoids two descriptions drifting apart.

## 8. Project README

- **What:** Replaced the Vite template README with a project README, then
  added a professional project description (tagline, overview, current status
  table, feature list).
- **Where:** `README.md`; `AGENTS.md` (removed the "README is still the Vite
  template" known gap).
- **Why:** The template text described Vite, not MERUN. The new README gives a
  human reader the purpose, setup commands, structure, principles and roadmap,
  and links to `AGENTS.md` and `docs/`. The description states only what
  exists today and marks logging, backend, auth and persistence as planned or
  not started, so the README does not promise features the code lacks. It is
  committed together with the docs.

## 9. Migrate from Vite to Next.js (App Router)

- **What:** Replaced the Vite toolchain with Next.js 16 (App Router). UI and
  behaviour are unchanged.
- **Where:**
  - `package.json`, `package-lock.json`: added `next`, removed `vite` and
    `@vitejs/plugin-react`. Scripts are `next dev`, `next build`, `next start`.
  - `src/app/layout.tsx` (new): `<html lang="en">`, skip link, header,
    `<main id="main" tabIndex={-1}>`, page title and favicon. Holds what
    `index.html` and `App.tsx` held.
  - `src/app/page.tsx` (new): loads the mock JSON and renders `<Feed>`.
  - `src/app/globals.css`: moved from `src/index.css`, contents unchanged.
  - `src/components/Feed.tsx`: marked `'use client'`.
  - `next.config.ts` (new): empty for now.
  - `tsconfig.json`: now a single Next-style config. Strict mode and the extra
    checks are kept. Replaces `tsconfig.app.json` and `tsconfig.node.json`.
  - `.oxlintrc.json`: `react/only-export-components` is off for `src/app/**`.
  - `.gitignore`: ignores `.next`, `out`, `next-env.d.ts`.
  - Removed `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- **Why:** The owner plans public pages (server-rendered or static) next to a
  client-rendered, personalized home feed, with the API and front end in one
  deployable project. `Feed` is a client component because it will own the
  browser-side data fetching. The lint override exists because Next requires
  `layout.tsx` to export `metadata`, which the Fast Refresh rule flags falsely.
- **Verified:** `npm run build` and `npm run lint` pass with no warnings. The
  dev server renders the skip link, `<main>`, heading and cards.
- **Not done:** `AGENTS.md` and `docs/ARCHITECTURE.md` still describe Vite and
  are updated in a later step.

## 10. Docs updated for the Next.js stack

- **What:** Replaced Vite-era descriptions with the Next.js App Router setup and
  recorded the rendering strategy.
- **Where:**
  - `AGENTS.md`: stack line, project scope, rendering strategy, commands,
    layout tree, strict-mode config path, CSS path, known-gap path.
  - `docs/ARCHITECTURE.md`: data flow starts at `app/page.tsx`, new Rendering
    section, component table lists `RootLayout`, `HomePage` and `Feed`,
    styling and tooling paths, lint override note.
  - `docs/ACCESSIBILITY.md`: global CSS path.
  - `README.md`: stack, `preview` note, project structure.
- **Why:** The docs still pointed at `vite`, `App.tsx`, `main.tsx`,
  `index.css` and the split tsconfigs, which no longer exist. The rendering
  decisions (public pages static or server-rendered, client-rendered feed, API
  in the same project) are the owner's and belong where agents read the rules.

## 11. Runs API (v1)

- **What:** REST endpoints to list, read and create runs, with server-side
  validation and cursor pagination. The feed does not use them yet.
- **Where:**
  - `src/app/api/runs/route.ts`: `GET` (list) and `POST` (create).
  - `src/app/api/runs/[id]/route.ts`: `GET` one run.
  - `src/app/api/users/[username]/runs/route.ts`: `GET` a user's runs.
  - `src/lib/server/validate.ts`: `parseNewRun` and `parseLimit`. Take
    `unknown` and return field errors instead of throwing.
  - `src/lib/server/runs.ts`: in-memory store seeded from `runs.json`.
  - `src/lib/server/http.ts`: the shared error response and list handler.
  - `docs/ARCHITECTURE.md`: new API section with the contract.
- **Why:** The feed needs a data source and the log-a-run form needs
  somewhere to post. Handlers stay thin and the logic sits in plain modules so
  the backend can be split out later. Bounds match the display helpers so any
  accepted run can be rendered. Errors have one shape, with per-field
  messages, so the form can show them next to inputs. The store is in memory
  as a stand-in for a database.
- **Verified:** `npm run build` and `npm run lint` pass. Against a production
  server: pagination across two pages, bad `limit` and `cursor`, 404s, a valid
  `POST` (201, trimmed, date normalized to UTC, newest-first in the list), and
  invalid bodies (malformed JSON, wrong types, arrays, out-of-range numbers,
  future date).
- **Limits:** No automated tests (there is no test runner). Created runs are
  lost on restart. No auth, rate limiting or request size limit.

## 12. Feature-based structure, `@/` alias, enforced boundaries

- **What:** Reorganized `src/` into `app/` (routing only), `features/runs/`
  and `shared/`, added the `@/` import alias, and enforced the module
  boundaries with lint and `server-only`. No behaviour change.
- **Where:**
  - Moved with `git mv`: `components/*` to `features/runs/components/`,
    `lib/format.ts` to `features/runs/format.ts`, `types/run.ts` to
    `features/runs/types.ts`, `data/runs.json` to `features/runs/seed.json`,
    `lib/server/validate.ts` and `runs.ts` to `features/runs/server/validate.ts`
    and `store.ts`, `lib/server/http.ts` to `shared/server/http.ts`.
  - New: `features/runs/index.ts` (client-safe surface),
    `features/runs/server/index.ts` (server surface),
    `features/runs/server/handlers.ts` (route handlers and the list helper,
    moved out of `http.ts`), `features/runs/mock-runs.ts` (the one place that
    casts the seed to `Run[]`).
  - `src/app/api/**/route.ts`: now one-line re-exports of the feature handlers.
    `src/app/page.tsx` imports `Feed` and `mockRuns` from `@/features/runs`.
  - `tsconfig.json`: `paths` maps `@/*` to `./src/*`.
  - `.oxlintrc.json`: `no-restricted-imports` overrides for `app`, `shared`,
    `features` and `features/*/components`.
  - `package.json`: added `server-only`. Server modules import it.
  - `AGENTS.md` (layout, new rule 5, import convention, paths),
    `docs/ARCHITECTURE.md` (new Code organization section, paths),
    `docs/ACCESSIBILITY.md` and `README.md` (paths).
- **Why:** The code was getting hard to review for people and agents. A feature
  folder puts a whole slice (UI, types, server logic, data) in one place, and
  `app/` stays thin. The boundaries are enforced, not just documented: lint
  rejects deep imports, cross-feature imports, `shared` depending on features,
  and components importing server code; `server-only` fails the build if
  client code reaches the server modules. The alias reverses the earlier
  "imports are relative" convention at the owner's request, so imports that
  cross folders do not turn into `../../../` chains.
- **Verified:** `npm run build` and `npm run lint` pass. Temporary probe files
  confirmed every lint rule fires on a violation and stays quiet on valid
  imports. A deliberate client import of `store.ts` failed the build through
  `server-only`. After the move, every API endpoint and the home page responded
  as before.

## 13. Feature `lib/` folder convention

- **What:** Pure helper modules live in `features/<name>/lib/`. `format.ts`
  moved there. No behaviour change.
- **Where:** `src/features/runs/format.ts` to `src/features/runs/lib/format.ts`;
  the import in `components/FeedCard.tsx`; a comment in
  `server/validate.ts`; `AGENTS.md` (layout and feature structure note),
  `docs/ARCHITECTURE.md`, `docs/ACCESSIBILITY.md`.
- **Why:** The owner wants one predictable place for helpers in every feature,
  so reviewers and agents know where to look. Types, mock data, components and
  server code keep their own places.
- **Verified:** `npm run build` and `npm run lint` pass.

## 14. Feed fetches from the runs API

- **What:** The home feed loads runs in the browser from `GET /api/runs`, with
  loading, error, empty and "load more" states. The mock data is no longer
  passed through the page.
- **Where:**
  - `src/features/runs/lib/parse.ts` (new): `parseRun` and `parseRunsPage`
    validate the response as `unknown` and never throw.
  - `src/features/runs/lib/api.ts` (new): `fetchRuns`.
  - `src/features/runs/hooks/use-runs.ts` (new): `useRuns` holds the state,
    aborts on unmount or retry, paginates by cursor and de-duplicates by id.
  - `src/features/runs/components/Feed.tsx`: takes no props; renders the
    states. `Feed.css` adds skeleton, message and button styles.
  - `src/app/page.tsx` renders `<Feed />`. `features/runs/index.ts` no longer
    exports `mockRuns` (the store still uses it as its seed).
  - `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md` (new Client data loading
    section), `docs/ACCESSIBILITY.md` (async patterns).
- **Why:** This is the planned client-rendered feed: the static page shell is
  prerendered and the personalized data loads in the browser. The response is
  validated because the owner's rule is not to trust input, and this closes the
  `as Run[]` gap for the feed. One bad item is dropped rather than failing the
  page. Failures show a fixed message instead of server text. The load-more
  button uses `aria-disabled` so focus is not lost. No data-fetching library
  was added; a small hook covers the current needs. `hooks/` is a new folder in
  the feature layout for React hooks, since `lib/` is for plain helpers.
- **Verified:** `npm run build` and `npm run lint` pass. A scratch script (not
  in the repo) fed 11 bad runs and 8 bad pages to the parsers: all rejected, none
  threw, and a mixed page kept only its valid runs. In headless Chrome against a
  production server, the HTML ships the loading state, then shows "Showing 3
  runs" with 3 cards; with 12 runs it shows 10 cards and "Load more runs".
- **Not verified:** the error state and retry, clicking "Load more runs", and
  all async states with a screen reader.

## 15. Add Vitest and tests for helpers and API

- **What:** Test runner and 125 tests: format helpers (contract, fallbacks,
  bounds, garbage input), response parsers, `fetchRuns` (with a stubbed
  `fetch`), request validation, and the route handlers end to end against the
  in-memory store (list, pagination, create, get, per-user list, error codes).
- **Where:**
  - `package.json`: `vitest` dev dependency, `test` and `test:watch` scripts.
  - `vitest.config.ts` (new): node environment, `@/` alias, and a
    `server-only` alias to the package's own `empty.js`.
  - `src/features/runs/lib/tests/{format,parse,api}.test.ts` and
    `src/features/runs/server/tests/{validate,handlers}.test.ts` (new). Tests
    sit in a `tests/` subfolder of the folder they cover, so each folder stays
    small as the feature grows.
  - `AGENTS.md`, `docs/ARCHITECTURE.md`: stack, commands, conventions, known gaps.
- **Why:** The owner's rule is that functions do not trust their input; the
  tests pin that down so refactors cannot quietly break it. Handlers are tested
  by calling them directly, so no HTTP server is needed. Component and hook
  tests are left out because they need a DOM environment and Testing Library,
  a separate decision.
- **Verified:** `npm test` (125 pass), `npm run lint` and `npm run build` pass.
- **Noted, not changed:** `formatDate('5')` returns a date (May 1 2001) because
  `Date` parses some bare numeric strings. This matches the documented contract
  ("parseable string"), so it is not asserted; tighten `toDate` if unwanted.

## 16. Component tests for FeedCard and Feed

- **What:** 20 tests. `FeedCard`: article named by its `<h3>`, spoken stat
  labels, machine-readable `<time>`, decorative avatar, optional notes,
  fallbacks instead of `NaN`. `Feed`: first load (busy, count announcement,
  first request, empty), errors and retry (fixed alert, network and shape
  failures, loading again on retry), and load more (cursor request, append,
  de-duplication, `aria-disabled` with focus kept, failure keeps loaded runs
  and retries the same cursor).
- **Where:**
  - `package.json`: `jsdom`, `@testing-library/react`, `@testing-library/dom`.
  - `vitest.config.ts`: test pattern also matches `.tsx`.
  - `src/features/runs/components/tests/{FeedCard,Feed}.test.tsx` (new).
  - `AGENTS.md`, `docs/ARCHITECTURE.md`: commands, conventions, known gaps.
- **Why:** These are the states listed as untested in Known gaps. jsdom is
  enabled per file so the server tests keep running in node. Queries use roles
  and labels so the tests check what assistive technology would see.
- **Verified:** `npm test` (145 pass), `npm run lint` and `npm run build` pass.
- **Not covered:** `useRuns` aborting on unmount, and screen reader output
  (jsdom only checks markup and roles).
- **Noted, not changed:** `Feed` says "Showing 1 runs" for a single run, and a
  test pins that text. `FeedCard` puts `aria-label` on a `<dl>`, which has no
  ARIA role, so the "Run statistics" name may not be announced.

## 17. Read and create single runs in Supabase

- **What:** `getRun` and `createRun` now use Supabase instead of the in-memory
  array, which is removed. `getRun` returns 404 for a non-UUID id. `createRun`
  inserts the run and returns it through `toRun`. A temporary
  `currentProfileId` looks up the `abel` profile id until auth exists, then it
  is deleted and the id comes from the session.
- **Where:** `src/features/runs/server/store.ts`, `server/handlers.ts` (both
  handlers now `await`), `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`.
- **Why:** Created runs were lost on restart. This finishes the move of the
  runs API to Supabase.
- **Verified:** `npm run build` and `npm run lint` pass. `getRun` was checked
  live (real id 200, unknown UUID 404, non-UUID 404). `createRun` was checked
  live: a valid POST returned 201 with `Location`, the run belonged to `abel`,
  `GET` returned it and it led the feed; an invalid body returned 422. `npm
  test`: 6 handler tests fail without Supabase env vars.
- **Noted, not changed:** `mock-runs.ts` and `seed.json` are now unused.

## 18. Remove the unused mock data

- **What:** Deleted the mock runs module and its JSON seed.
- **Where:** `src/features/runs/mock-runs.ts` and `seed.json` (removed),
  `AGENTS.md` (layout and known gaps).
- **Why:** Nothing imports them since the store moved to Supabase.
- **Verified:** `npm run build` and `npm run lint` pass.
- **Noted, not changed:** `server/tests/handlers.test.ts` still has a comment
  about seeded data and clears `globalThis.__merunRuns`; both go when the
  handler tests are reworked.

## 19. Mock the store in the handler tests

- **What:** The handler tests now replace `../store` with `vi.mock`, so they
  test only handler logic. They no longer need Supabase, and the in-memory
  reset (`globalThis.__merunRuns`, `vi.resetModules`) is gone. Added checks that
  the handler passes the right arguments to the store (limit, cursor, username,
  the validated and trimmed run, the id) and that bad requests never reach it.
- **Where:** `src/features/runs/server/tests/handlers.test.ts`, `AGENTS.md`
  (Known gaps), `docs/ARCHITECTURE.md` (testing note).
- **Why:** Six tests failed because they called the real store, which queries
  Supabase. A mocked store keeps `npm test` offline and deterministic; the
  owner chose this for now and deferred live store tests to a second Supabase
  project.
- **Removed:** "newest first", cursor pagination, create-then-fetch and
  case-insensitive username tests. They tested store behavior (SQL), and the
  old pagination test was already wrong (it assumed the cursor was an id).
  They are listed as a gap, not covered.
- **Verified:** `npm test` (162 pass), `npm run lint` and `npm run build` pass.

## 20. Branch and pull request workflow, contribution guide

- **What:** New rule 7 in AGENTS.md: every change goes on a branch, through a
  pull request and a merge, never directly on `main`. New `CONTRIBUTING.md`
  with setup, the workflow (squash merge, Conventional Commit PR titles), the
  pre-PR checks and what a PR should say.
- **Where:** `AGENTS.md` (rule 7, documentation map), `CONTRIBUTING.md` (new),
  `README.md` (documentation list).
- **Why:** The project now has enough structure that unreviewed commits on
  `main` are a risk. The owner decided on branches and PRs from this point on.
  The earlier work up to `5e076ff` was committed on `main` as a one-time
  exception.
- **Noted, not changed:** `README.md` still says "There is no test runner yet"
  and lists "mock data" in the project structure; both are out of date.

## 21. Design foundation, landing page and feed redo

- **What:** A dark, game-style design system and a new landing page.
  - Tokens and font: a forest-night, gold and red palette, a spacing scale, a
    type scale and Saira (with the width axis), in `globals.css` and the root
    layout.
  - Landing page at `/`: an illustrated hero (SVG ridgeline, sun and a route
    that draws itself, skipped under reduced motion), an annotated example run,
    an accessibility section built from the real spoken strings, a closing call
    to action and a footer.
  - The feed moved to `/feed` and was restyled to match: a mission card with a
    gold edge, a clipped corner, a large distance numeral and a km tick meter
    (`kmTicks` in `lib/format.ts`), plus the loading, empty, error and
    load-more states.
  - Routes use two route groups, `(marketing)` and `(app)`, under one root
    layout.
- **Where:** `src/app/` (layouts, routes, `globals.css`),
  `src/features/landing/` (new), `src/features/runs/components/` (card and feed
  CSS, `FeedCard.tsx`), `src/features/runs/lib/format.ts` and its tests,
  `docs/DESIGN.md` (new), `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`.
- **Why:** The owner wanted a much stronger, majestic look and a marketing
  page, and a plain restyle of the feed was not enough.
- **Verified:** `npm run build`, `npm run lint` and `npm test` (186 pass);
  screenshots at 360px and 1440px; an axe audit (WCAG 2 A and AA, best
  practice) with no violations on `/` and `/feed`; the load animation and the
  reduced-motion state checked by screenshot.
- **Noted, not changed:** the `TEST createRun check` row is still in Supabase.
  The landing's example card duplicates the feed card's styling by design (see
  `docs/DESIGN.md`). Nothing tests the artwork.
- **Also fixed:** the README said there was no test runner, mentioned mock data
  and listed formatting-helper tests as a roadmap item; all three were out of
  date.

## 22. Run tracker logic (branch `feat/run-tracker`)

- **What:** The pure logic for recording a run in the browser.
  - `distanceKm`: haversine distance between two GPS points.
  - `totalDistanceKm`: sums a list of GPS fixes, ignoring poor-accuracy fixes
    (above 30 m) and hops smaller than 3 m or the fix's own accuracy, measured
    from the last accepted fix.
  - `trackerReducer` and `elapsedSec`: a stopwatch state machine (idle,
    running, paused, finished) that does not count paused time and ignores a
    device clock that moved backwards.
- **Where:** `src/features/runs/lib/geo.ts`, `src/features/runs/lib/tracker.ts`
  and their tests in `lib/tests/`, `AGENTS.md` (layout and next-feature notes),
  `docs/ARCHITECTURE.md` (new "Run tracker" section).
- **Why:** The owner chose to log runs by tracking them (Start button, GPS
  distance, device clock) instead of a plain form. The logic is built first as
  small pure modules so it is easy to test and reuse in a mobile wrapper. GPS
  is noisy, so unfiltered sums would count standing still as distance.
- **Also changed:** `AGENTS.md` rule 2 now asks for defensive code only where
  data comes from outside the app, as the owner decided, instead of in every
  function.
- **Noted, not changed:** nothing is wired into the UI yet. The accuracy and hop thresholds are untested against real GPS
  data.

## 23. Validate GPS positions at the boundary (branch `feat/run-tracker`)

- **What:** `toFix` turns a browser GPS position (`unknown`) into a typed `Fix`
  or `null`, checking that latitude, longitude and accuracy are finite and in
  range. With that boundary in place, `distanceKm` and `totalDistanceKm` now
  take plain `Point` and `Fix[]` and no longer validate; their garbage-input
  tests and `toPoint` were removed.
- **Where:** `src/features/runs/lib/position.ts` (new) and its test,
  `src/features/runs/lib/geo.ts` and its test, `AGENTS.md` (layout),
  `docs/ARCHITECTURE.md` (Run tracker section).
- **Why:** The owner wants defensive checks only where data comes from outside
  (rule 2). GPS positions are the outside data, so they are checked once, in
  one place, and the maths after it can trust its input. Accuracy 0 is
  accepted (the owner's call): dropping odd readings is harder to notice than
  keeping them.
- **Noted, not changed:** the hook that calls `watchPosition` and `toFix` does
  not exist yet. Positions also carry a timestamp that `Fix` ignores until the
  speed-jump filter is built.

## 24. GPS watch and tracker hooks (branch `feat/run-tracker`)

- **What:** Two hooks that connect the tracker logic to the browser.
  - `useGpsWatch(active, onFix)` watches the device position while `active`,
    validates each position with `toFix`, calls `onFix` with the valid ones, and
    reports `'unsupported'`, `'denied'` or `'unavailable'`.
  - `useTracker()` combines `trackerReducer`, per-stretch lists of fixes (so
    travel while paused is not counted), a one-second clock tick and the GPS
    watch, and returns the status, distance, duration and the Start, Pause,
    Resume, Stop and Reset actions.
- **Where:** `src/features/runs/hooks/use-gps-watch.ts`, `use-tracker.ts`, their
  tests and a fake geolocation helper in `hooks/tests/`.
- **Why:** The pure logic had no caller. A callback (not returned state) carries
  each position so none are lost when two arrive together; the watch stops on
  pause so the GPS is not running for nothing.
- **Noted, not changed:** the fixes live in hook state beside the reducer, which
  keeps two sources of truth in step by hand; folding them into the reducer was
  discussed and left for later. `onFix` must be referentially stable. `error`
  stays set after a pause until a good position arrives (the owner's flow is:
  ask on the first run, keep timing when denied, add a manual distance and an
  "enable GPS" button later).

## 25. Run tracker screen at `/run` (branch `feat/run-tracker`)

- **What:** The tracker on screen.
  - `TrackerStatus`: a live-region word ("Ready", "Running", "Paused", "Run
    finished") with a decorative mark.
  - `TrackerStats`: time as the loudest numeral, distance in gold with km ticks.
    The time has no spoken label so screen readers are not read a new time every
    second.
  - `TrackerControls`: Start, Pause and Resume as one persistent button (so
    keyboard focus survives Pause to Resume), Stop with an "End this run?"
    confirmation (focus on "Keep going", Escape cancels), and New run when
    finished (focus moves to it).
  - `Tracker` composes them with `useTracker`; `app/(app)/run/page.tsx` renders
    it. The hook's `error` is not shown, by the owner's decision.
- **Where:** `src/features/runs/components/Tracker*.tsx` and `.css` with tests in
  `components/tests/`, `src/features/runs/index.ts`, `src/app/(app)/run/page.tsx`,
  `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`.
- **Why:** The owner wanted a tracker UI in the project's game-HUD style. Stop
  asks first because a mis-tap would end the run with no undo; the safe choice is
  the loud button. The finished state offers New run so the page is not a dead
  end until the save form exists.
- **Verified:** `npm run build`, `npm run lint` and `npm test` (287 pass); the
  production build in Chrome with a simulated location moving about 1.1 km;
  screenshots at 360px and 1280px; an axe audit with no violations in the ready,
  running, confirm and finished states; focus checked by script at each step.
- **Noted, not changed:** nothing is saved, and there is no nav link to `/run`.
  Not tried with a screen reader, a real permission prompt or an outdoor run.
  Numerals do not dim while paused. The GPS thresholds are still guesses.
