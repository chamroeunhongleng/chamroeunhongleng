---
name: reference-research
description: Study reference sites and portfolios for structural patterns without copying identity
---

# Reference research

## What to extract from any reference
- Information architecture: pages, nav, nesting depth
- Homepage narrative arc and section order
- Project-card field inventory and hierarchy
- Case-study section templates and their density curve
- Status/maturity labeling systems (the best split lifecycle from deployment reality)
- Evidence presentation: link strips, labeled proof blocks, artifact tables
- How limitations and lessons are framed (constraints vs. tradeoffs vs. learned)
- Responsive strategy and breakpoints

## Hard boundaries — never take
Layouts pixel-for-pixel, source code, branding, colors, typography choices,
images, biography, projects, achievements, education, writing, or career claims.
Patterns are transferable; identities are not. When the owner explicitly asks to
adopt a typographic or visual choice from a reference, record it as a dated
owner decision in the ui-implementation skill.

## Local reference
The previous-generation build sits at `../chamroeunhongleng-portfolio-claude-production/`
(read-only). Its prose for the five real projects is high quality; its validation
approach (regex over source text) and hardcoded prerender list are the two
anti-patterns this repo exists to avoid.

## References studied

### kavatana.me (2026-09-14)
The owner's CHNAI LAB teammate's portfolio, which the owner asked to model the
restyle on. Owner decisions: whole site; bold sans headings but this site's own
palette; stack, timeline, education, contribution, and contact sections; hero
photo, marquee, orbit map, and mascot. (He removed the orbit map on 2026-10-05
after seeing it built.)

| Pattern | Decision | Reason |
|---|---|---|
| Floating rounded header bar, text nav, round icon buttons | Borrow | Frames the wider layout; every header test contract kept |
| Hero split: eyebrow, huge name, coloured role, CTAs; portrait with location pill | Borrow structure | Name-first already; the stats strip was built, then removed by the owner (2026-10-05) |
| Eyebrow + bold h2 left, lede right | Borrow (`SectionHeading`) | One section grammar site-wide |
| Principle cards, numbered focus cards | Borrow | Real `principles.json` and `now.json` |
| Orbit map with a node list | Built, then removed | The owner asked for it, saw it running, and had it taken out (2026-10-05) |
| Technology marquee | Borrow, differ | Self-hosted monochrome marks; each item traced to a case study |
| Horizontal project cards | Borrow, differ | Status AND deployment labels on every card |
| Timeline rail, education cards, contact block | Borrow | Real `experience.json`, `education.json`, `contact.json` |
| Orange accent, his fonts' exact setup, brand-coloured CDN icons | Differ / skip | Identity, CSP, and "not a template of a teammate" |
| "What I can help with" services grid | Differ | Became "What I can contribute" — internship framing, humble voice |
| Client-work shelf, robot art, scroll-hijack zoom, copy of any kind | Skip | Not this owner's work, data, or voice |

## Output format
For each pattern: what it is → where seen → borrow / differ / skip → one-line reason
tied to the four-pillar positioning.
