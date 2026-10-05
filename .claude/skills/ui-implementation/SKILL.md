---
name: ui-implementation
description: Design-token contract, contrast table, and component conventions
---

# UI implementation

## Identity
"Bold sans on warm paper, annotated by hand" — Inter Variable at 700–800 for
display and headings (tight tracking), Inter for body, IBM Plex Mono for the
audit-trail register (eyebrows, labels, badges, facts), and a handwritten face
for a few margin notes. Own palette: indigo accent, terracotta second accent,
warm paper light, dark first-class. Cards on hairlines with soft shadows, pill
buttons, chips, pen strokes. No neon, fake dashboards, or skill bars.

Restyled 2026-09-14 after the owner studied kavatana.me (patterns borrowed,
identity kept — see the reference-research skill). Fraunces is no longer the
display face; it survives only on `/cv`, pinned so the printed PDF is unchanged.

Owner-approved exceptions (2026-09-14) — do not "fix" these back:
1. **No orbit map.** An interactive canvas map of projects, pillars, and Now
   entries was built for the Now section on 2026-09-14 and **removed at the
   owner's request on 2026-10-05** — he saw it running and said "remove this
   for me". Do not rebuild it, or any other animated graphic or decorative
   dashboard, without asking first.
2. **Brand-coloured technology marks in chips** — Simple Icons path data,
   self-hosted through `TechIcon brand`. The owner asked for the coloured look
   after sharing a screenshot of the reference's technology panel. The colour
   rides a `--tech-brand` custom property, never a fill attribute, and
   near-black marks fall back to the text colour in the dark theme. Never a CDN
   (`img-src 'self'`), never a mark for a tool no project or skill line names.
   Every chip is a name first.
3. **A small decorative hero mascot** (`HeroMascot`), `aria-hidden`, still unless
   motion is allowed.
4. **Three ambient loops** — the technology marquee, the mascot float, and the
   slow turn of the hero stamp. Transform only, static under reduced motion and
   in automated runs (`useMotionAllowed`). Everything else keeps the 150–250ms
   rule. A fourth loop needs the owner's say-so.

"More human, more creative" pass (owner request, 2026-10-05):
- **The handwritten register** — `.hand` (Caveat SemiBold, a 17 KB basic-Latin
  subset self-hosted in `app/assets/fonts/`, `--font-hand`). For a few margin
  notes and sign-offs only: short, friendly, and never a claim. Decorative
  notes are `aria-hidden`. It has no Khmer and no accented glyphs — keep to
  plain ASCII, or re-subset the font.
- **Pen strokes** — `Scribble` (underline, arrow, loop), always decorative, in
  `currentColor`. `SectionHeading mark="…"` underlines one phrase of a title;
  the heading's text is unchanged for screen readers.
- **Paper touches** — cards a fraction of a degree out of line on wide screens
  (straight on hover and on phones), the tilted portrait on an offset
  backplate, the round current-role stamp (decorative; the statement itself
  is real text in the Now section), outlined numerals, one palette
  colour per card in turn, the dotted hero ground, the faint footer wordmark.
- **The mascot is a button**: it opens the chat panel (`useChat().open`).

Phone design (760px and below) — its own layout, not a squeezed desktop:
- `MobileDock`: four destinations fixed at the bottom, sharing a baseline with
  the chat launcher. The header is not sticky at this width. `.chat-widget`
  is click-through (`pointer-events: none`, its three parts `auto`) so its
  full-width box never swallows taps meant for the dock.
- The hero leads with a profile row (photo, location, current role); the copy
  block uses `display: contents` so the order can differ from desktop.
- `.card-row` turns card grids into one swipeable row with the next card
  peeking in. Use it for any new group of cards (`data-cols`, `data-mid`).
- Primary actions span the width; previews clamp long text.

## Token contract
All colors, spacing, radii, type sizes, and motion values come from
`app/assets/css/tokens.css` custom properties. A component that hardcodes a hex
value or pixel size is wrong.

Tailwind utilities are available and read those same tokens — the bridge is
`app/assets/css/tailwind.css`, which maps them with `@theme inline` so the dark
swap still works at runtime. Utility names differ from token names on purpose
(a self-referential `--color-x: var(--color-x)` would break the token):
`bg-paper`, `bg-card`, `text-ink`, `text-ink-muted`, `text-ink-faint`,
`text-brand`, `text-clay`, `border-line`, `font-title`, `font-text`, `font-code`,
`rounded-tile`, `shadow-tile`, `shadow-lift`, `shadow-halo`.
Preflight is deliberately not imported — base.css and typography.css own the
element reset — so utilities add, they never re-reset.

Breakpoints: `sm:` 480px, `md:` 760px, `nav:` 820px, `lg:` 1040px. These mirror
the literal media queries already in the components (custom properties don't
work in media queries, so Tailwind resolves them at build time). 820px is the
header's mobile-menu contract, asserted by `tests/e2e/responsive.spec.ts`.
`dark:` follows the `data-theme` attribute the toggle sets, not the OS.

## Contrast table (verify when touching colors — both themes)
| Pair | Light | Dark | Minimum |
|---|---|---|---|
| text / bg | ~15.6:1 | ~14:1 | 4.5:1 |
| text-muted / bg | ~6.4:1 | ~7:1 | 4.5:1 |
| text-faint / bg | ~4.6:1 | ~4.9:1 | 4.5:1 |
| accent / bg (eyebrows, links) | ~7.2:1 | ~8.5:1 | 4.5:1 |
| accent-2 / bg (hero role line) | ~5.9:1 | ~5:1 | 4.5:1 |
| positive / positive-tint (availability pill) | ~6.3:1 | ~9:1 | 4.5:1 |

## Component conventions
- Content prose → `<MarkedText>` (renders placeholder markers as chips).
- Important claims → `<ClaimList>` / `<EvidenceLabel>`.
- Project status → `<StatusBadge>` + `<DeploymentBadge>`, always both.
- One `h1` per page (`SectionHeading as="h1"` for listing pages); no skipped levels.
- Section headers → `SectionHeading`: mono eyebrow + bold heading, the lede and
  an optional `aside` slot in a right-hand column; `layout="stack"` where a form
  or long list follows directly.
- Surfaces → `.card` (surface, hairline, `--radius-card`, `--shadow-card`),
  `.card-lift` for hover. Actions → `.btn` (pill), `.pill` / `.pill-filled`,
  `.pill-live` for true current statements, `.icon-btn` (accessible name from
  `aria-label` or visually-hidden text, 44px on coarse pointers).
- Chips → `.chip`, or `TagList :items` for chips with marks. `TechIcon` slugs
  must exist in `app/data/tech-icons.ts` (`check:content` fails the build on an
  unknown one). Interface glyphs come from `Glyph.vue`.
- `ChipMarquee`: the duplicate list exists only while animating and is
  `aria-hidden` + `inert`; the static state wraps every chip.
- Cards use the stretched-link pattern (`.card-link::after`), one real `<a>`;
  independent links inside lift above it with `position: relative; z-index: 2`.
- Motion: opacity/transform only, 150–250ms (the two ambient loops above
  excepted); `motion.css` owns the reduced-motion reset.
- Leaf components import Vue APIs explicitly (`import { computed } from 'vue'`)
  and use relative imports for app modules so they mount in vitest without Nuxt.

## Definition of done
`npm run lint` + `npm run typecheck` + `npm run test` green; if output changed,
`npm run generate` + `npm run check:a11y` too; both themes visually checked
(`npm run test:e2e:shots`, then again with `E2E_THEME=dark`).
