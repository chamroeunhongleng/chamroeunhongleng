---
name: security-review
description: Security posture of this static site and what to check when changing it
---

# Security review

## Posture
Static site, zero runtime dependencies, no backend, no forms, no analytics,
no external requests at runtime (fonts self-hosted). The attack surface is
the supply chain, the headers, and secrets hygiene — review accordingly.

## Headers (duplicated on purpose)
`nuxt.config.ts` routeRules AND `vercel.json` carry the same set —
X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy,
Permissions-Policy, COOP. Static hosting ignores routeRules, so vercel.json is
the one that matters in production; `check-structure` fails if they drift.

## Secrets
- `.env` is gitignored; only `.env.example` ships. The Read deny-list and the
  guard hook both block reading `.env`.
- `npm run check:secrets` scans every tracked text file for credential patterns;
  the `check-written-file` hook warns at write time.
- This site needs NO secrets to build or deploy — treat any PR introducing one
  as a design smell.

## Supply chain
- devDependencies only; lockfile committed; CI uses `npm ci`.
- Dependabot (weekly, grouped) + CodeQL are configured.
- New dependencies need a reason the platform can't provide — challenge them.

## When reviewing a change
1. `npm run check:secrets` and `npm run check:structure` pass.
2. No new external request at runtime (check generated HTML for foreign origins).
3. No inline event handlers or v-html with content data.
4. Hooks still block: force-push, curl|sh, .env reads, production deploys.
