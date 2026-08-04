---
name: portfolio-ia
description: The portfolio's information architecture and the rules that hold it together
---

# Portfolio information architecture

## Pages
Home · Projects (+ `/projects/<slug>` case studies) · Journey · Learning ·
About · Contact · Colophon. `/#now` is a homepage anchor promoted to nav level.

## Homepage narrative arc (order is deliberate)
who I am (verbatim intro — meaning is owner-approved, do not rewrite) →
four connected pillars → featured proof → what's in motion now → learning
snapshot → principles → idea-to-production process with human gates →
selected evidence → contact.

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
