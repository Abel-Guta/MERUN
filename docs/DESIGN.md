# Design

The design log for MERUN: the decisions, the tokens and what was rejected.
Read it before changing the look of anything. Append to it after every design
pass. Project rules (accessibility, plain co-located CSS, no UI library) live in
[AGENTS.md](../AGENTS.md) and win over anything here.

Status: built. The landing page (`/`) and the feed (`/feed`) share the system
below.

## Brief

- **Subject:** a run log, with a feed of what everyone ran. The setting is the
  Addis Ababa highlands (the Entoto ridge), used for the art and the example
  data; the copy does not claim to be only for one city.
- **Audience:** runners, on a phone as often as a desktop, who know distance
  and pace already.
- **Primary job:** the landing page makes someone want to open the feed; the
  feed lets them read a run at a glance.
- **Direction from the owner:** an epic, majestic, sci-fi warrior-game look at
  cinema scale, drawn in SVG and CSS (no photographs).

## Lineage

Game-trailer title design and HUD overlays. Moves borrowed:

1. Type at poster scale: wide, heavy, all-caps headlines.
2. HUD overlays on the landscape: a dotted dial ring, a thin ring, km marks.
3. Flat tonal layers and one light source (the gold sun), with no gradients,
   glows or glass.

## Concept

The horizon is a route. The hero is the Entoto ridgeline drawn as a run's
elevation profile, with a gold route line along it and a km mark for every
kilometre, ending in a flag.

## Tokens

All in `src/app/globals.css`.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#0c1512` | page ground (green-tinted black); also the foreground ridge, so the hero meets the page with no seam |
| `--color-surface` | `#15211c` | panels and cards |
| `--color-border` | `#2c3b35` | thin rules and unlit ticks; decorative only |
| `--color-text` | `#e8ebe4` | body text |
| `--color-text-muted` | `#9fb0a6` | secondary text (8.2:1 on bg, 7.3:1 on surface) |
| `--color-accent` | `#f5c400` | the sun, the route, distance numerals, buttons, focus ring |
| `--color-danger` | `#d9382b` | error fills and borders only; fails AA as text |
| `--color-danger-text` | `#ec5a4e` | error text (5.4:1 on bg, 4.85:1 on surface) |
| `--color-focus` | `#f5c400` | keyboard focus ring |
| `--color-ridge-far`, `--color-ridge-mid` | `#1c2f26`, `#132319` | the two ridge layers in the hero |

Spacing: 4, 8, 12, 16, 24, 32, 48, 64 px (`--space-1` to `--space-16`).
Type scale: ratio 1.25 from 16px (`--text-xs` to `--text-3xl`). Everything else
is derived from these; the only raw sizes are layout widths and the 4.5rem
distance numeral.

### Type

One family, **Saira** (variable weight 100-900 and width 50-125), loaded with
`next/font/google`, so it is self-hosted at build time (a build needs a network
connection). It has tabular numerals, which `body` turns on.

- Display headlines: width 125%, weight 800, all caps (CSS `text-transform`).
- Numerals and the wordmark: width 70%, weight 800.
- Text: normal width.

## The one bold move

The route. In the hero the gold route line draws itself across the ridge and
the km marks light up in order, ending at the flag. It is the only motion on
the page. Under `prefers-reduced-motion` the finished art shows at once. The
same idea carries into the cards: the distance is the large gold numeral, with
one tick per whole kilometre (capped at ten) beneath it.

## Components

- **Hero:** headline left-aligned over the art, one call to action. Not a
  centred hero.
- **Mission card:** a gold 4px left edge, a clipped top-right corner (32px),
  radius 0. Used by the feed card and the landing's example run.
- **Buttons:** square, gold. The primary call to action is a solid gold fill;
  feed buttons are gold-outlined. The faint rule colour is never a control's
  only boundary.
- **Errors:** red text on a panel with a red left edge.
- **Skeleton:** same shape as a card, so the feed does not jump.
- **Annotated run:** the example card with leader lines to notes laid out down
  its height, in the order they appear on the card.

## Rules we keep

- Flat fills and thin rules. No glows, gradients, glass or shadows.
- Radius 0, with clipped corners. Avatars stay round because they are people.
- Sentence case for labels; all caps only for display headlines.
- Dark only. No light mode.
- Honest copy: nothing on the page promises a feature the app does not have
  (no sign-up, likes or follows). The example run says it is not live data.
- `clip-path` clips outlines, so nothing focusable sits in a clipped corner.
  Forced-colors mode gets a real outline and no clip.
- The hero artwork is `aria-hidden`; every fact on the page is also text.

## Rejected

- **Road-sign plan** (white ground, yellow plate): replaced by the owner's
  game-style direction.
- **First dark restyle** (the plain list of cards with a gold edge, no
  atmosphere): the owner called it weak. It became the base for the landing
  page and the scaled-up feed.
- **Cyan, purple or neon palettes; Orbitron and Chakra Petch:** the generic
  game look.
- **Track red:** drifts toward a terracotta default.
- **Centred hero, three icon cards, a phone mockup, hero stat blocks:** generic
  marketing templates.
- **Photographs:** none were available; the art is generated SVG.

## Sameness test

A generic fitness landing page has a centred hero and three icon cards. This
one has a route drawn along the Entoto ridge, an annotated card and the
spoken-number story as its feature. Passed.

## Notes for next time

- The artwork is data in `src/features/landing/lib/hero-art.ts`: three ridge
  paths, the route and the km marks, drawn in a 1440 x 600 box. The peaks rise
  to the right, behind the sun, and stay low under the headline so the text
  stays readable. Edit the numbers, or regenerate them with the same idea.
- The landing's example card duplicates the feed card's look in its own CSS,
  because features may not import each other. If a third place needs the card,
  move it to `shared/`.
- Checked with screenshots at 360px and 1440px and an axe audit (WCAG 2 A, AA
  and best practice: no violations on `/` and `/feed`). The audit is not in
  `npm test`.
- The skeleton is a fixed 17.5rem tall, a guess at an average card.
- Open ideas, not built: a log-a-run form (a feature), levels or streaks (a
  feature), a light theme, Amharic with a Noto Sans Ethiopic fallback.

## Log

- **Design foundation:** dark tokens, Saira, header, mission card, feed states.
- **Landing and feed redo:** landing page at `/`, feed moved to `/feed`, hero
  art, annotated run, accessibility section, feed matched to the landing's
  scale. Fixed along the way: a seam where the hero met the page, notes that
  did not point at the card, squashed labels, a header rule wider than the
  content.
