---
description: Verify the site and walk the preview-deployment guide
---

Prepare a Vercel preview deployment.

1. Load the `deployment-review` skill.
2. Run the full pipeline: `npm run verify` — every phase must pass.
3. Walk `docs/preview-deployment.md` step by step with the user. Key points:
   - the mode env var must be set in Vercel BEFORE the build
     (`NUXT_PUBLIC_PORTFOLIO_MODE=review` for previews);
   - `NUXT_PUBLIC_SITE_URL` should be the preview URL or stay default;
   - preview deployments are reversible and fine to run; PRODUCTION is not
     yours to trigger — stop at the human gate.
4. After the user deploys, help them run the checklist in
   `docs/ui-review-checklist.md` against the live preview URL.
