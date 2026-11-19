# Design

The design log for MERUN: the decisions, the tokens and what was rejected.
Read it before changing the look of anything. Append to it after every design
pass. Project rules (accessibility, plain co-located CSS, no UI library) live in
[AGENTS.md](../AGENTS.md) and win over anything here.

Status: planned, not built. Tokens below are the target for the design
foundation work; none are in the code yet.

## Brief

- **Subject:** a run log for people who run in Addis Ababa and want to see what
  their friends ran.
- **Audience:** runners on a phone, usually just after a run, with a few
  seconds. They know distance and pace already.
- **Primary job:** read a friend's run at a glance (how far, how long, how
  fast), then want to log their own.
- **Direction from the owner:** futuristic, modern, a warrior-game feel.
- **Source material:** the highlands at night (Entoto eucalyptus forest) and
  Ethiopian warrior heritage, expressed as forest black, armour gold and blood
  red. These are also the flag's hues; the sources are the forest, metal and
  blood, and the owner can veto the echo.

## Lineage

Game HUD and RPG character-sheet interfaces. Moves borrowed:

1. Clipped-corner panels (chamfers) in place of rounded corners.
2. Segmented meters: a value is also shown as a row of ticks.
3. A dark ground, layered by tone with thin rules, and one metallic accent.

## Concept

Every run is a mission card you can read in one look.

## Tokens (target)

Existing variable names are kept so components keep working; values change and
new names are added.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#0C1512` | page ground (green-tinted black) |
| `--color-surface` | `#15211C` | panels and cards |
| `--color-border` | `#2C3B35` | thin rules |
| `--color-text` | `#E8EBE4` | body text |
| `--color-text-muted` | `#9FB0A6` | secondary text (contrast to verify) |
| `--color-accent` | `#F5C400` | distance, key numbers, focus ring, main button |
| `--color-danger` | `#D9382B` | errors only |
| `--color-focus` | `#F5C400` | keyboard focus ring |

Proportions: about 70 ground and panels, 18 text, 8 gold, 2 red, 2 rules.

Every text and background pair must pass WCAG AA before it is used. Gold is a
fill or text on dark only, never text on a light ground. Red is for errors only
and is never the only signal (pair it with text).

### Type

- One family: **Saira** (Google Fonts, variable weight and width), loaded with
  `next/font` so it is self-hosted at build time.
- Heavy and condensed for numerals; normal width for text.
- Scale: ratio 1.25 on a 16px base: 12.8, 16, 20, 25, 31, 39, 49 px.
- Baseline: 4px; body line-height 24px.
- Tabular numerals for all data. To verify that Saira ships `tnum`; if not,
  choose another face before building.
- Amharic can fall back to Noto Sans Ethiopic when it is needed.

### Spacing

One scale on the 4px baseline: 4, 8, 12, 16, 24, 32, 48, 64.

## Layout

Mobile first, designed at 360px. Single column of mission cards, max width
about 560px, centered on wide screens.

```
┌──────────────────────────╲
▌ Morning easy run          ╲
▌ Abel Guta · @abel          │
▌ Nov 11 · Addis Ababa       │
▌                            │
▌ 5.2 km     ▮▮▮▮▮▯▯▯▯▯      │
▌ 28:05      5:24 /km        │
▌ Legs felt fresh.           │
└──────────────────────────┘
```

Alternatives considered: plain timetable rows with a plate (the earlier
road-sign plan), and a feed of plates only with details behind a tap. The card
wins because it matches the direction and keeps the existing semantic markup.

## The one bold move

The mission card: a clipped top-right corner, a gold edge on the left, and the
distance as a large condensed numeral above a row of km ticks (one tick per
kilometre, capped at 10). The numeral is real text; the ticks are decorative
and hidden from assistive technology.

## Details

- Radius 0 with clipped corners. Avatars stay round because they are people.
- Flat fills and thin rules. No glows, gradients, glass or shadows.
- Labels in sentence case. Only the wordmark is in capitals.
- Motion: at most one moment, a quick clip-path wipe as cards load, skipped
  under `prefers-reduced-motion`. Optional.
- Copy: plain and specific, no marketing text.
- Dark only for now. No light mode.

## Constraints from the project rules

- Plain CSS, one co-located file per component, colours only from the variables
  in `src/app/globals.css`.
- `clip-path` clips outlines. The clipped shape goes on a background layer so
  the keyboard focus ring stays visible.
- Accessibility first: semantic HTML, visible focus, labels, contrast, reduced
  motion. See [ACCESSIBILITY.md](ACCESSIBILITY.md).
- Not part of this design: levels, XP, ranks or streaks. The data has only
  distance, time and pace. Those would be features, decided separately.

## Rejected

- **Road-sign plan** (white ground, yellow plate, wayfinding lineage): replaced
  when the owner asked for a futuristic warrior-game look.
- **Track red** accent: drifts toward the terracotta default.
- **Orbitron, Chakra Petch**: the default sci-fi faces.
- **Cyan, purple or neon palettes, glows and glass**: the generic game look.
- **Inter, Roboto, system fonts**: the personality-free default.

## Sameness test

A generic game-style app would fit cyan, purple and Orbitron. This plan fits
Addis: forest black, gold and red, from the setting. Passed.

## Log

- **Plan agreed (design foundation):** brief, lineage, tokens, type and the
  mission card agreed with the owner. Next: tokens and font, header and shell,
  `FeedCard`, `Feed` states, then screenshots, a critique pass and an update
  here.
