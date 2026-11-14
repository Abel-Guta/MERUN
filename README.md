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
| Run feed with run cards | Available, loaded from the runs API |
| Logging a new run | Planned |
| Runs API (list, read, create) | Available, stored in memory |
| Authentication, database persistence | Not started |

### Features

- Feed of runs with user details, location, notes and run statistics
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

There is no test runner yet.

## Project structure

```
src/
  app/               layout (skip link, header, main), home page, global CSS
  features/runs/     the runs feature: components, formatting helpers, types,
                     mock data and server code (API handlers, validation, store)
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
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): data flow, components and the
  formatting helper contract.
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md): checklist for UI changes.
- [docs/CHANGELOG.md](docs/CHANGELOG.md): what changed, where and why.

## Roadmap

- Form to log a new run
- Database persistence for runs (the API currently stores them in memory)
- Tests for the formatting helpers
