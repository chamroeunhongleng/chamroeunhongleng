---
name: portfolio-ia
description: The portfolio's information architecture and the rules that hold it together
---

# Portfolio information architecture

## Pages
Home · Projects (+ `/projects/<slug>` case studies) · Journey · Learning ·
About · Contact · Colophon. `/#now` is a homepage anchor promoted to nav level.

## Homepage narrative arc (order is deliberate; trimmed 2026-08-05 after HR review)
who I am (verbatim intro — meaning is owner-approved, do not rewrite) with a
hero metrics strip (`profile.metrics`, ≤4 numbers restating labeled claims) →
four connected pillars → what's in motion now → flagship + project rows →
two working principles with a colophon pointer → contact.
Removed by owner decision (do not reintroduce without asking): the learning
snapshot, the selected-evidence ClaimList, and the direction section — the
recruiter-facing homepage stays short; depth lives on the inner pages.

## Non-negotiable rules
1. The two intro paragraphs and the hero statement keep their approved meaning.
2. The four pillars always read as ONE system: CS/ITM degree grounds 01–02,
   international business + contracts/terms work grounds 03–04. Every project
   maps to at least one pillar via `pillars[]`.
3. Positioning is learner-honest: never lawyer, legal expert, senior engineer,
   or ML expert.
4. Two-axis honesty: lifecycle `status` and `deployment` reality are separate
   labels, rendered separately, everywhere a project appears.
5. Content lives in `content/*.json` validated by `shared/schemas/`; pages
   consume `app/data/portfolio.ts`. No content in components.
6. Routes derive from content (nuxt.config reads `content/projects/`);
   never hardcode a route list.
