---
name: deployment-review
description: How this site deploys, what the modes mean at build time, and where humans decide
---

# Deployment review

## The one fact people trip over
**Mode is baked at build time.** Static generation freezes
`NUXT_PUBLIC_PORTFOLIO_MODE` (and `NUXT_PUBLIC_SITE_URL`) into the output.
Changing an env var after a deploy does nothing — set it in Vercel project
settings BEFORE the build that should use it.

## Environments
| Environment | Mode | Trigger |
|---|---|---|
| Local dev | review (default) | `npm run dev` |
| Vercel preview | review | push to a branch / PR |
| Production | production | owner-approved deploy only |

Production builds run the content gate (`modules/content-gate.ts`): any
placeholder marker, enabled demo project, or missing required content ABORTS
the build. `npm run generate:production` locally answers "would production
build?" without deploying anything.

## Vercel specifics
- Framework preset: Nuxt; output is fully static (`nuxt generate`).
- `npm run generate` is `nuxt generate` PLUS `scripts/inject-csp.ts`, which
  stamps the hash-based CSP into every generated page. vercel.json's
  buildCommand is `npm run generate`, so the deploy recipe is unchanged and
  every path that builds the site — CI, e2e, `cv:pdf`, a workstation deploy —
  gets the policy. Never deploy output built with bare `nuxt generate`.
- **The build output is in two different places** and any script that reads it
  post-build must know which: `vercel build` runs with `VERCEL=1`, which
  selects the `vercel-static` preset and writes `.vercel/output/static`;
  everything else writes `.output/public`. `scripts/lib/output-dir.ts` decides
  from the environment (never by probing for whichever directory exists — a
  stale `.output/public` would otherwise absorb the CSP injection while the
  artifact bound for production shipped bare). inject-csp hardcoded
  `.output/public` at first and aborted the first production build; that was
  the correct failure, and it is why the rule now lives in one tested place.
  To audit the Vercel artifact directly: `VERCEL=1 npm run check:csp`.
- Security headers come from `vercel.json` (routeRules don't apply to static).
- Custom domain (chamroeunhongleng.me) is NOT serving at build time of this
  repo — DNS + domain attach are owner actions.

## Human gates (never yours)
Production deploys, DNS/domain changes, production env vars, analytics,
publishing the contact email, legal/privacy pages, final public claims.
Preview deploys and local builds are fair game. Rollback on Vercel =
promote the previous deployment — document, don't execute.
