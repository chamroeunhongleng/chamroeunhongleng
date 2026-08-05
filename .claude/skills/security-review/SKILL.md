---
name: security-review
description: Security posture of this site and its serverless function, and what to check when changing either
---

# Security review

## Posture
Static Nuxt site PLUS one serverless function: `api/chat.ts`, which holds
`ANTHROPIC_API_KEY` and processes untrusted visitor input. Two runtime
dependencies (`@anthropic-ai/sdk`, `zod`) exist for it. No forms that POST,
no analytics, no external requests from the static pages (fonts self-hosted).

Review that function FIRST — input validation, rate limiting, the origin
check, prompt injection via client-supplied `history`, and what reaches the
logs — then the supply chain, the headers, and secrets hygiene.

(This section used to read "static site, zero runtime dependencies, no
backend". That stopped being true when the chat function shipped, and it was
priming this very skill to skip the only file with real attack surface.)

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
- The static build needs no secrets. The serverless function needs
  `ANTHROPIC_API_KEY` at runtime; it is set in Vercel and never committed.
  Treat any OTHER new secret as a design smell.

## Supply chain
- Two runtime dependencies, everything else devDependencies; lockfile
  committed; CI uses `npm ci`. `npm audit --omit=dev` is the number that
  describes what actually ships.
- Dependabot (weekly, grouped) + CodeQL are configured.
- New dependencies need a reason the platform can't provide — challenge them.

## When reviewing a change
1. `npm run check:secrets` and `npm run check:structure` pass.
2. No new external request at runtime (check generated HTML for foreign origins).
3. No inline event handlers or v-html with content data.
4. `npm test` passes, including `tests/hooks/guard-bash.test.ts` — the guard
   hook's rules are only as good as that file, and two of them were inert
   until it existed.
5. If `api/chat.ts` changed: does the request still get validated before the
   model call, is the rate limiter still ahead of the API call, and does the
   error path still avoid logging message content?

## What the guard hook is and is not
`.claude/hooks/guard-bash.mjs` is a regex denylist over the raw command
string. It reliably catches the destructive command an agent would plausibly
*type by accident* — `rm -rf`, force push, `.env` reads, production deploys.
It is not a sandbox and cannot be made into one: quoting, `$()`, aliases and
indirection defeat a denylist over an unparsed shell string. Do not describe
it as a security boundary. The real bounds are that CI holds no deploy
credentials, deploys are gated on secrets the runner does not have, and the
Anthropic Console spend limit caps the blast radius.
