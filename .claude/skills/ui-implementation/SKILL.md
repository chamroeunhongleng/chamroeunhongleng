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
value or pixel size is wrong. Breakpoints are 1040px and 760px, written as
literal media queries (custom properties don't work there).

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
