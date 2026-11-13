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
