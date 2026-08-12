---
name: ui-implementation
description: Design-token contract, contrast table, and component conventions
---

# UI implementation

## Identity
"Ink on warm paper" — editorial, typography-led. Fraunces (display), Inter (body),
IBM Plex Mono (the audit-trail register: labels, badges, facts). Light default,
dark first-class. Hairline rules + whitespace; no neon, robots, brains,
fake dashboards, logo walls, or skill bars.

## Token contract
All colors, spacing, radii, type sizes, and motion values come from
`app/assets/css/tokens.css` custom properties. A component that hardcodes a hex
value or pixel size is wrong.

Tailwind utilities are available and read those same tokens — the bridge is
`app/assets/css/tailwind.css`, which maps them with `@theme inline` so the dark
swap still works at runtime. Utility names differ from token names on purpose
(a self-referential `--color-x: var(--color-x)` would break the token):
`bg-paper`, `bg-card`, `text-ink`, `text-ink-muted`, `text-ink-faint`,
`text-brand`, `text-clay`, `border-line`, `font-title`, `font-text`, `font-code`.
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
| accent / bg | ~7.2:1 | ~8.5:1 | 4.5:1 |
| accent-2 / bg | ~5.9:1 | ~5:1 | 4.5:1 |

## Component conventions
- Content prose → `<MarkedText>` (renders placeholder markers as chips).
- Important claims → `<ClaimList>` / `<EvidenceLabel>`.
- Project status → `<StatusBadge>` + `<DeploymentBadge>`, always both.
- One `h1` per page (`SectionHeading as="h1"` for listing pages); no skipped levels.
- Cards use the stretched-link pattern (`.card-link::after`), one real `<a>`.
- Motion: opacity/transform only, 150–250ms; `motion.css` owns the
  reduced-motion reset.
- Leaf components import Vue APIs explicitly (`import { computed } from 'vue'`)
  so they mount in vitest without Nuxt.

## Definition of done
`npm run lint` + `npm run typecheck` + `npm run test` green; if output changed,
`npm run generate` + `npm run check:a11y` too; both themes visually checked.
