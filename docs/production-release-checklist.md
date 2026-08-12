# Production release checklist

Production is an owner decision. Claude can prepare everything above the line;
only you execute what is below it.

## Machine-verifiable (Claude can drive these)
- [ ] `npm run verify` — all 12 phases green
- [ ] `npm run check:owner-content -- --mode=production` — zero errors
      (no markers, no enabled demo project, confirmed contact email)
- [ ] `npm run generate:production` — builds successfully (the gate passes)
- [ ] `docs/validation-report.md` updated with the real, current results
- [ ] `/audit-claims` run — no label stronger than its receipt
- [ ] Lockfile committed; CI green on the release commit

## Owner judgment (review before approving)
- [ ] Read every page in review mode one last time — is every claim something
      you would defend in an interview?
- [ ] Contact email: you explicitly approve publishing this address
- [ ] Anything you consider private is absent (check OWNER_INPUT.md §9)
- [ ] The demo governance review is replaced or disabled — your call, made
      consciously
- [ ] Walk `ui-review-checklist.md` on the final preview URL

## Owner-only execution (the human gate — Claude stops here)
- [ ] Domain: confirm chamroeunhongleng.me is yours, hosting/DNS points to
      Vercel (it was NOT serving when this repo was built)
- [ ] Vercel production env vars: `NUXT_PUBLIC_PORTFOLIO_MODE=production`,
      `NUXT_PUBLIC_SITE_URL=https://chamroeunhongleng.me`
- [ ] Trigger the production deployment in Vercel
- [ ] After deploy: open the live site, spot-check 3 pages + one case study,
      verify the OG card with a link-preview tool
- [ ] Know the rollback: Vercel → Deployments → promote previous

## Explicitly out of scope until you decide otherwise
A contact form (mailto by design), legal/privacy pages (add only with real
review), third-party embeds (none).

## Analytics (owner-approved 2026-08-12)
Vercel Web Analytics — cookie-free aggregate page counts. The script tag is
included only when the deploy build sets `NUXT_PUBLIC_ANALYTICS=1` (local
builds and tests never reference it, because `/_vercel/insights/script.js`
exists only on Vercel's edge, not in the build output). Web Analytics must
also be enabled on the Vercel project (Project → Analytics → Enable) or the
live script 404s.
