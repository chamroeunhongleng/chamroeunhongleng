---
description: Walk the production release checklist up to the human approval boundary
---

Prepare — but never execute — a production release.

1. Load the `production-release` context from `docs/production-release-checklist.md`
   and the `deployment-review` skill.
2. Verify readiness:
   - `npm run check:owner-content -- --mode=production` passes (no placeholders,
     no demo content, confirmed contact email);
   - `npm run generate:production` succeeds — the content gate is satisfied;
   - `npm run verify` is fully green;
   - `docs/validation-report.md` is current and honest.
3. Confirm the human-owned items are decided BY THE OWNER: domain + DNS,
   Vercel production env vars, contact email publication, final claim review,
   legal/privacy pages if any, analytics (default: none).
4. STOP at the boundary. Deploying to production, changing DNS, or flipping
   the mode to production in Vercel are owner actions. Hand over the exact
   remaining steps as a numbered list and end there. The guard hook will block
   production deploy commands anyway — do not try to route around it.
