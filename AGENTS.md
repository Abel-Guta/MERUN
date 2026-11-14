# AGENTS.md

Entry point for AI coding agents and human contributors. Read this first, then
follow the links for detail.

## Project

MERUN is a run-logging MVP. Current scope: a feed of run cards (who ran, what
they ran). The home feed fetches runs from the runs API under `/api` in the
browser. Storage is in memory (seeded from mock JSON, lost on restart). There is
one page (`/`), no auth and no real persistence yet.

Stack: Next.js 16 (App Router), React 19, TypeScript, plain CSS, oxlint,
Vitest. No UI library.

Rendering strategy (owner decision): public pages will be static or
server-rendered. The personalized home feed is client-rendered: `Feed` is a
client component that will own browser-side fetching. Next.js also hosts the
API (Route Handlers) in the same project; keep server logic in plain modules so
it can be split out later if the app outgrows one project.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Type-check and build | `npm run build` (`next build` type-checks) |
| Lint (includes jsx-a11y) | `npm run lint` |
| Tests (Vitest; node, jsdom for components) | `npm test` (`npm run test:watch` while editing) |
| Serve the production build | `npm run preview` (`next start`, run `build` first) |

Before finishing any change, `npm run build`, `npm run lint` and `npm test` must
all pass with no warnings. TypeScript runs in strict mode (`"strict": true` in
`tsconfig.json`); do not weaken it.

## Layout

```
src/
  app/                       routing only; no logic
    layout.tsx               root shell: skip link, header, <main>, metadata
    page.tsx                 home route: renders <Feed>
    globals.css              global styles, CSS variables, utilities
    api/                     one-line route files that re-export feature handlers
  features/
    runs/                    one folder per feature
      index.ts               public, client-safe surface
      components/            Feed, FeedCard (each with a co-located .css file)
      hooks/                 React hooks (useRuns: client-side fetching state)
      lib/                   plain helpers, no React, no server APIs
        format.ts            formatting helpers (visual + screen-reader text)
        api.ts, parse.ts     fetch the runs API, validate its response
      types.ts               User and Run types
      mock-runs.ts, seed.json  mock data that seeds the store
      server/                server-only code
        index.ts             public server surface (route handlers)
        handlers.ts, store.ts, validate.ts
  shared/                    code used by two or more features
    server/http.ts           error response helper
vitest.config.ts             Vitest config (`@/` alias, `server-only` alias)
docs/                        see below
```

Feature structure: a feature owns its UI, types, server logic and data. Create a
new folder under `features/` when a new feature starts; do not add empty ones.
Pure helper modules (formatters, parsers, calculations) go in the feature's
`lib/` folder and React hooks in `hooks/`. Server-only code goes in `server/`. Move code to `shared/` only
when a second feature needs it.

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
   Take `unknown` at boundaries and narrow it. See `src/features/runs/lib/format.ts`.
3. **Plain CSS, co-located.** One `.css` file per component, imported by that
   component. Colors come from the CSS variables in `src/app/globals.css`. Do not add
   a CSS framework or UI library without asking.
4. **Explain every change.** When you finish a piece of work, report what you
   did, which files changed, and why.
5. **Feature boundaries are enforced.** Import a feature only through
   `@/features/<name>` (client-safe) or `@/features/<name>/server` (server
   only). Features never import other features or `app/`; `shared/` never
   imports features or `app/`; components never import server code. Server
   modules start with `import 'server-only'`. `npm run lint` enforces the
   import rules (see `.oxlintrc.json`) and the build enforces `server-only`.
   Do not weaken or bypass them without asking.

6. **Small steps, human review between each.** Make one small change, stop,
   and report it so the owner can read it in a minute, understand it and look
   for what the agent missed. Wait for the go-ahead before the next step. Do
   not bundle unrelated edits, and do not batch a whole feature into one
   update. If a task needs several steps, say what they are, do the first and
   stop. This applies to every agent and session.

## Conventions

- Components are function components with named exports (`App` is the default
  export). Props are typed inline or with a local interface.
- Use `useId` for generated element ids (label/heading association).
- Use the `@/` alias (maps to `src/`) for imports that cross a top-level folder
  (`app`, `features`, `shared`). Inside a feature, use relative imports; features
  cannot import themselves through the alias.
- `app/` route files are one-line re-exports. Put logic in the feature.
- Tests live in a `tests/` subfolder of the folder they cover (`lib/tests/`,
  `server/tests/`, `components/tests/`) as `<name>.test.ts` (`.tsx` for components). Create the folder
  with the first test, not before. Import from `vitest` explicitly (no
  globals). Server tests work because Vitest aliases `server-only` to the
  package's own `empty.js`.
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

- Tests cover `lib/` (format, parse, api) and `server/` (validate, handlers with
  the store), and `FeedCard` and `Feed` (loading, error, retry, empty and
  load-more states, via `useRuns`, with `fetch` stubbed). There are no direct
  `useRuns` tests, and no test aborts the request on unmount. Component tests
  check markup and roles in jsdom, not screen reader output.
- `src/features/runs/mock-runs.ts` casts the seed JSON with `as Run[]`, a type
  assertion rather than a runtime check. It is server-only and our own data;
  replace it when a real database arrives. The feed's API response is validated
  (`lib/parse.ts`).
- The feed has no data-fetching library, caching or revalidation, and the
  loading, error and load-more states have not been tested with a screen
  reader.
- User avatars load from a remote host (`i.pravatar.cc`).
- Next planned feature: a form to log a new run (see accessibility notes for
  forms).
