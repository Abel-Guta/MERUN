# MERUN

A simple, accessible run-logging application for runners who want to record
their runs and see them in a social feed.

## Overview

MERUN lets runners log their runs and follow what others are running. Each run
is presented as a card that shows who ran, when and where, and the key
numbers: distance, time and pace.

The project is an early MVP. It is built to be accessible to keyboard and
screen-reader users from the start, and to handle unexpected data gracefully
rather than fail.

### Current status

| Area | State |
|---|---|
| Landing page | Available at `/` |
| Run feed with run cards | Available at `/feed`, loaded from the runs API |
| Run tracker (stopwatch and GPS distance) | Available at `/run`; runs are not saved yet |
| Saving a tracked run | Planned |
| Runs API (list, read, create) | Available, stored in Supabase |
| Authentication | Not started (new runs belong to the `abel` profile) |

### Features

- Landing page with an illustrated hero, an annotated example run and the
  accessibility story
- Feed of runs with user details, location, notes and run statistics
- Run tracker: Start, Pause, Resume and Stop (with a confirmation), live time
  and GPS distance
- Pace calculated from distance and time
- Screen-reader-friendly output, such as "5 minutes 24 seconds per kilometer"
  in place of `5:24 /km`
- Skip link, landmarks and visible keyboard focus
- Safe fallbacks for missing or invalid run data

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), plain CSS, oxlint.

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run dev
```

The dev server prints the local URL.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run oxlint, including accessibility rules |
| `npm run preview` | Serve the production build locally (run `build` first) |
| `npm test` | Run the Vitest tests |

## Project structure

```
src/
  app/               root layout, the landing (`/`), feed (`/feed`) and
                     tracker (`/run`) routes, global CSS
  features/landing/  the landing page: sections and the hero artwork
  features/runs/     the runs feature: components, formatting helpers, types
                     and server code (API handlers, validation, store)
  shared/            code shared by several features (HTTP helpers)
docs/                architecture, accessibility, changelog
```

## Principles

- **Accessible from the start.** Semantic HTML, labels and ARIA, with
  `jsx-a11y` lint rules enforced. See [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).
- **Defensive by default.** Helper functions do not assume their input was
  validated; bad data produces a safe fallback, never a crash or `NaN`.
- **Small stack.** Plain CSS, no UI library.

## Documentation

- [AGENTS.md](AGENTS.md): rules, conventions and commands for AI agents and
  contributors. Start here if you are about to change code.
- [CONTRIBUTING.md](CONTRIBUTING.md): setup, the branch and pull request
  workflow, and what to check before opening a pull request.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): data flow, components and the
  formatting helper contract.
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md): checklist for UI changes.
- [docs/DESIGN.md](docs/DESIGN.md): the design plan, tokens and decisions.
- [docs/CHANGELOG.md](docs/CHANGELOG.md): what changed, where and why.

## Roadmap

- Form to log a new run
