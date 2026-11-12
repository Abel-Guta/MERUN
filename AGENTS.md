# AGENTS.md

Entry point for AI coding agents and human contributors. Read this first, then
follow the links for detail.

## Project

MERUN is a run-logging MVP. Current scope: a feed of run cards (who ran, what
they ran) rendered from mock JSON. There is no backend, routing, auth or
persistence yet.

Stack: React 19, TypeScript, Vite, plain CSS, oxlint. No UI library, no test
runner.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Type-check and build | `npm run build` |
| Lint (includes jsx-a11y) | `npm run lint` |
| Preview build | `npm run preview` |

Before finishing any change, `npm run build` and `npm run lint` must both pass
with no warnings. TypeScript runs in strict mode (`"strict": true` in
`tsconfig.app.json` and `tsconfig.node.json`); do not weaken it.

## Layout

```
src/
  main.tsx             entry point
  App.tsx              page shell: skip link, header, <main>, <Feed>
  components/          Feed, FeedCard (each with a co-located .css file)
  data/runs.json       mock data
  lib/format.ts        pure formatting helpers (visual + screen-reader text)
  types/run.ts         User and Run types
  index.css            global styles, CSS variables, utilities
docs/                  see below
```

## Documentation map

| File | Read it when |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | You need the data flow, component responsibilities or the helper contract |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | You are writing or reviewing any UI |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | You need to know what changed, where, and why |

## Rules

These are decisions the owner has made. Do not reverse them without asking.

1. **Accessibility is built in from the start.** Semantic HTML first, ARIA only
   where HTML falls short, labels on every control. Details in
   [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md). `jsx-a11y` lint rules are on
   and must stay clean.
2. **Functions do not trust their input.** Validating before the call is
   planned, but every function must still behave correctly when handed bad
   data: no throws on garbage, no `NaN`/`Infinity`/`Invalid Date` in output.
   Take `unknown` at boundaries and narrow it. See `src/lib/format.ts`.
3. **Plain CSS, co-located.** One `.css` file per component, imported by that
   component. Colors come from the CSS variables in `src/index.css`. Do not add
   a CSS framework or UI library without asking.
4. **Explain every change.** When you finish a piece of work, report what you
   did, which files changed, and why.

## Conventions

- Components are function components with named exports (`App` is the default
  export). Props are typed inline or with a local interface.
- Use `useId` for generated element ids (label/heading association).
- Imports are relative. There is no path alias.
- Files use 2-space indentation, single quotes and no semicolons, matching the
  existing code.
- Comments explain why, not what. Do not narrate the code, add section banners
  or restate a function name. If a comment is not needed by the next reader,
  delete it.
- Commits use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) and
  contain one idea each. Do not add co-author or tool-attribution trailers.
  Do not push; the owner pushes.

## Known gaps

Tracked here so nobody has to rediscover them.

- No tests. The behaviour of `src/lib/format.ts` is specified in
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and is the first candidate for
  Vitest coverage.
- `src/App.tsx` casts the JSON with `as Run[]`, which is a type assertion and
  not a runtime check. Replace it with a validator at the data boundary when a
  real data source arrives.
- User avatars load from a remote host (`i.pravatar.cc`).
- Next planned feature: a form to log a new run (see accessibility notes for
  forms).
