# Content replacement guide

How placeholder content becomes your real content, safely.

## The system in one paragraph
All content lives in `content/*.json` and `content/projects/*.json`, validated
by the schemas in `shared/schemas/`. Unfinished fields carry in-text markers —
`[OWNER_INPUT_REQUIRED: question]`, `[PLACEHOLDER: what goes here]`, `[DEMO]`,
`[REPLACE_BEFORE_PRODUCTION: note]` — which render as visible chips in review
mode and BLOCK the build in production mode. Replacement = answering the
question, updating the JSON, and deleting the marker.

## Two ways to do it
1. **With Claude:** fill in `OWNER_INPUT.md`, then run `/replace-owner-content`.
   Claude maps answers to files, sets honest evidence labels, and never invents
   missing information.
2. **By hand:** edit the JSON directly. The schema will catch structural
   mistakes (`npm run check:content`); the rule engine tracks remaining markers
   (`npm run check:owner-content`).

## Rules that keep the site honest
- Every important claim is `{ "text": …, "evidence": <label>, "link"?: … }`.
  Labels: Owner confirmed · Public evidence · Repository evidence ·
  Document evidence · Demo only · Planned · Unverified · Private.
- A label is never stronger than its receipt. No public URL → Owner confirmed.
- Numbers (%, counts, money) go inside labeled claims, never loose prose —
  the production gate enforces this.
- `status` and `deployment` are separate axes; the schema rejects dishonest
  combinations (e.g. Production without Deployed + hard evidence).
- Project slug = filename. New project = new JSON file; routes and the sitemap
  update themselves.

## The demo project
`content/projects/demo-governance-review.json` (`"demo": true`) exists to show
the governance case-study format. Before production either replace it with a
real review or set `"enabled": false`. The gate will not let you forget.

## Checking progress
```bash
npm run check:owner-content                     # current mode, human-readable
npm run check:owner-content -- --mode=production # exactly what blocks release
npm run verify                                   # everything
```
