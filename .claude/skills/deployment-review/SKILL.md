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
- Security headers come from `vercel.json` (routeRules don't apply to static).
- Custom domain (chamroeunhongleng.me) is NOT serving at build time of this
  repo — DNS + domain attach are owner actions.

## Human gates (never yours)
Production deploys, DNS/domain changes, production env vars, analytics,
publishing the contact email, legal/privacy pages, final public claims.
Preview deploys and local builds are fair game. Rollback on Vercel =
promote the previous deployment — document, don't execute.
