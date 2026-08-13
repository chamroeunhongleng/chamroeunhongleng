---
name: security-review
description: Security posture of this site and its serverless function, and what to check when changing either
---

# Security review

## Posture
Static Nuxt site PLUS one serverless function: `api/chat.ts`, which holds
`ANTHROPIC_API_KEY` and processes untrusted visitor input. Two runtime
dependencies (`@anthropic-ai/sdk`, `zod`) exist for it. No forms that POST,
no third-party requests from the static pages (fonts self-hosted). Analytics
is Vercel Web Analytics: one same-origin script (`/_vercel/insights/script.js`,
served by the Vercel edge, not a build file), included only when the deploy
build sets `NUXT_PUBLIC_ANALYTICS=1` — local builds and tests never ship it.

Review that function FIRST — input validation, rate limiting, the origin
check, prompt injection via client-supplied `history`, and what reaches the
logs — then the supply chain, the headers, and secrets hygiene.

(This section used to read "static site, zero runtime dependencies, no
backend". That stopped being true when the chat function shipped, and it was
priming this very skill to skip the only file with real attack surface.)

## Headers (duplicated on purpose)
`nuxt.config.ts` routeRules AND `vercel.json` carry the same set —
X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy,
Permissions-Policy (17 features denied), COOP, HSTS
(`max-age=63072000; includeSubDomains`, no preload), and a
`Content-Security-Policy` carrying **frame-ancestors only**. Static hosting
ignores routeRules, so vercel.json is the one that matters in production;
`check-structure` fails if they drift, and it compares values exactly.

Two vercel.json blocks sit OUTSIDE that sync check because routeRules has no
equivalent: `/_nuxt/(.*)` immutable caching, and `/cv/(.*)` →
`X-Robots-Tag: noindex` (the CV PDFs stay downloadable but leave the search
index; `/cv` the page is unaffected — the pattern needs the literal slash).

## Content-Security-Policy (split across two places, deliberately)
- **script-src with SHA-256 hashes** ships as a `<meta>` tag inside each
  generated page, injected by `scripts/inject-csp.ts` as the second half of
  `npm run generate`. It cannot be a header: Nuxt's `window.__NUXT__.config`
  inline script embeds the buildId, so its hash changes every build and a
  hardcoded header would break the site one deploy later. Static hosting also
  rules out nonces — there is no server to mint one per request.
- **frame-ancestors** ships as a header, because `<meta>` cannot carry it.
- `scripts/lib/csp.ts` holds the whole policy and the hashing rules. It throws
  on any script type it cannot classify and on any off-origin `src` rather
  than quietly omitting it — a Nuxt upgrade that adds a new inline script
  fails the build instead of shipping a policy that breaks the page.
- `npm run check:csp` re-derives the policy from the built artifacts and
  demands an exact match, so a skipped page or a post-injection edit fails.
- `style-src` still needs `'unsafe-inline'` (Vue scoped styles and inline
  style attributes); `script-src` does NOT and must never gain it.
- The dev server gets headers but no meta CSP — injection is post-generate.
  `npm run test:e2e` serves the built output through
  `tests/e2e/static-server.mjs`, which reads vercel.json for its headers, so
  the zero-console-error e2e sweep is what catches a policy that breaks a page.

## Secrets
- `.env` is gitignored; only `.env.example` ships. The Read deny-list and the
  guard hook both block reading `.env`.
- `npm run check:secrets` takes its file list from
  `git ls-files --cached --others --exclude-standard` — everything that can
  reach the public repo, nothing that cannot. It used to walk the filesystem
  while claiming to scan tracked files, which read `.vercel/` and `.env.local`
  and reported on files git would never accept. Patterns include a JWT rule
  (`eyJ….eyJ….`); the generic credential rule cannot see those, because its
  character class has no dot. The `check-written-file` hook warns at write time.
- The static build needs no secrets. The serverless function needs
  `ANTHROPIC_API_KEY` at runtime; it is set in Vercel and never committed.
  Treat any OTHER new secret as a design smell.

## Supply chain
- Two runtime dependencies, everything else devDependencies; lockfile
  committed; CI uses `npm ci`. `npm audit --omit=dev` is the number that
  describes what actually ships, and `npm run check:audit` runs it as a
  pipeline phase (high/critical fails; an unreachable registry warns and
  passes, so `verify` still works offline; unparseable output fails).
- Dependabot (weekly, grouped) + CodeQL are configured.
- New dependencies need a reason the platform can't provide — challenge them.

## When reviewing a change
1. `npm run check:secrets` and `npm run check:structure` pass.
2. No new external request at runtime — `npm run check:csp` now enforces this
   mechanically: every script and stylesheet reference in the built output
   must be root-relative. The same-origin `/_vercel/insights/` analytics
   script is the one sanctioned exception (and it is same-origin, so it passes).
3. No inline event handlers or v-html with content data. A new inline script
   anywhere means a new CSP hash — `inject-csp` picks it up automatically, but
   an inline `onclick=` attribute is NOT hashable and the CSP will block it.
4. `npm test` passes, including `tests/hooks/guard-bash.test.ts` — the guard
   hook's rules are only as good as that file, and two of them were inert
   until it existed.
5. If `api/chat.ts` changed: does the request still get validated before the
   model call, is the rate limiter still ahead of the API call, and does the
   error path still avoid logging message content? The `Origin` header is
   REQUIRED (missing → 403), so any new non-browser caller — including
   `scripts/eval-chat.ts --target=live` — has to send one. The allowlist is
   exact hosts plus a preview pattern that includes the TEAM slug; never
   widen it to a `.vercel.app` prefix or suffix test, because that namespace
   is shared with every Vercel user. `tests/chat/handler.test.ts` pins the
   bypasses (unowned `chamroeunhongleng-*.vercel.app`, wrong team, suffix
   append, plain http).
6. If the build output changed shape: `npm run check:csp` after `generate`,
   and `npm run test:e2e`, which is the only check that runs the policy
   through a real browser.

## What the guard hook is and is not
`.claude/hooks/guard-bash.mjs` is a regex denylist over the raw command
string. It reliably catches the destructive command an agent would plausibly
*type by accident* — `rm -rf`, force push, `.env` reads, production deploys.
It is not a sandbox and cannot be made into one: quoting, `$()`, aliases and
indirection defeat a denylist over an unparsed shell string. Do not describe
it as a security boundary. The real bounds are that CI holds no deploy
credentials, deploys are gated on secrets the runner does not have, and the
Anthropic Console spend limit caps the blast radius.
