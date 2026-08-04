---
description: Scaffold a new project case study with all 28 fields and honest labels
---

Create `content/projects/<slug>.json` for the project the user describes.

1. Load the `case-study-development` skill for the field-by-field guidance.
2. The slug must equal the filename (prerender routes derive from it).
3. Walk all 28 fields from `shared/schemas/project.ts` — never skip one; use
   `[OWNER_INPUT_REQUIRED: question]` markers where the owner must answer.
4. Choose `status` and `deployment` separately and honestly. Never label
   non-production work as Production — the schema will reject it anyway.
5. Every claim in `evidence`, `results`, and `completedWork` needs the correct
   evidence label; numbers live ONLY inside labeled claims, never loose prose.
6. Set `demo: true` and `[DEMO]` markers if this is demonstration content.
7. Validate with `npm run check:content` and `npm run check:owner-content`,
   then `npm run generate` to confirm the route builds.
