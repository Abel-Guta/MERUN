# Accessibility

Accessibility is a requirement from the first line, not a later pass. Use this
as a checklist for every UI change.

## Principles

1. Use the right HTML element before reaching for ARIA.
2. Every interactive control has an accessible name.
3. Everything works from the keyboard, with a visible focus indicator.
4. Information is never conveyed by color alone.
5. Machine-readable values stay machine-readable (`<time>`, `<dl>`, real lists).

## Checklist

**Structure**
- One `<h1>` per page; heading levels never skip.
- Landmarks: `<header>`, `<main>`, and `<nav>` / `<footer>` when they exist.
- Lists of things are `<ul>`/`<ol>`, not stacked `<div>`s.
- Standalone content units are `<article>`, grouping with a heading is
  `<section>` with `aria-labelledby`.
- Label/value pairs use `<dl>`, `<dt>`, `<dd>`.
- Dates use `<time dateTime="...">`.

**Names and text**
- Informative images have meaningful `alt`. Decorative images use `alt=""`
  (the avatar does, because the name is next to it).
- Abbreviations and symbols that read badly aloud get an `aria-label` with the
  spoken form (`5.2 km` → "5.2 kilometers"). Spoken text comes from the
  `*Label` helpers in `src/features/runs/lib/format.ts`.
- Visual-only separators are `aria-hidden="true"`.
- Text that only screen readers need uses `.visually-hidden`.
- Generate ids with `useId` when linking labels, headings and descriptions.

**Keyboard and focus**
- A skip link is the first focusable element and targets `#main`.
- Do not remove outlines. `:focus-visible` in `src/app/globals.css` provides a 3px
  ring; do not override it per component without a replacement.
- Do not put click handlers on non-interactive elements. Use `<button>` for
  actions and `<a href>` for navigation (the lint rules enforce this).

**Color and motion**
- Text colors come from the CSS variables. `--color-text-muted` is chosen to
  meet 4.5:1 contrast on both the page and card backgrounds; verify again if
  you change any color.
- `prefers-reduced-motion` is honoured globally. Do not add animation that
  ignores it.

**Dynamic content**
- Messages that appear or change use a live region (`role="status"` or the
  `<output>` element). The empty feed message uses `<output>` because the lint
  rule `jsx-a11y/prefer-tag-over-role` requires it.

## Forms (for the planned "log a run" feature)

- Every input has a visible `<label>` linked with `htmlFor`/`id`.
- Related inputs are grouped in `<fieldset>` with a `<legend>`.
- Use the correct `type` and `inputMode` (`number`, `date`, `time`) and
  `autoComplete` where it applies.
- Errors are text, not just red borders. Link them with `aria-describedby`,
  set `aria-invalid="true"` on the field, and move focus to the first error on
  submit.
- Mark required fields in the label text, not only with `*`.
- Confirm success through a live region.

## Lint

`jsx-a11y` rules run as part of `npm run lint`. A warning is a failure.
Silence a rule only with a comment explaining why, and tell the owner.

## Not yet verified

The markup has been linted but not tested with a screen reader, in a browser
accessibility tree, or with an automated checker such as axe. Do that before
calling the feed done.
