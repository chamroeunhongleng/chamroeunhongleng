# Security

## Reporting
If you find a security issue in this repository or the deployed site, please
open a GitHub security advisory on the repository (Security → Report a
vulnerability) or contact the owner through the profiles listed on the site.
Please do not open a public issue for security reports.

## What is actually deployed
The site is a prerendered Nuxt application served as static files, plus
**exactly one serverless function** — `api/chat.ts` on Vercel, which backs the
"Ask" assistant. There is no other backend.

- **The assistant** calls the Anthropic API server-side. The API key never
  reaches the browser. Requests are answered from this repository's published
  content; the function stores no messages and sets no cookies. It accepts
  POSTs only, from an allowlisted `Origin` that must be present — browsers
  always send one, so a request without it is not a visitor.
- **Rate limiting is per-instance and in-memory** (8 requests/IP/minute, 60/IP/day,
  500/day global). Serverless instances do not share that state, so the limits
  are a cost brake, not a guarantee. The real backstop is a spend limit on the
  Anthropic account.
- **The contact form never submits anything.** It composes a `mailto:` link in
  the browser and hands it to the visitor's mail client — no endpoint, no
  third-party form service, no storage.
- No database, no authentication, no cookies. Analytics are Vercel Web
  Analytics: cookie-free aggregate page counts, loaded from the site's own
  domain. Fonts are self-hosted, so page rendering makes no third-party
  requests.

## Dependencies and secrets
- Two runtime dependencies, both used only by the serverless function:
  `@anthropic-ai/sdk` and `zod`. The static pages ship none.
- `ANTHROPIC_API_KEY` is the only secret the deployed site needs. It lives in
  Vercel environment variables and nowhere else — never in this repository.
- `.env*` files are gitignored. `npm run check:secrets` scans every committable
  file — tracked plus untracked-but-not-ignored — for credential patterns,
  including JWTs, in CI and locally.
- Security headers ship via `vercel.json` (mirrored in `nuxt.config` routeRules
  for the dev server); `npm run check:structure` keeps the two in sync.
  The set: nosniff, `X-Frame-Options: DENY`, Referrer-Policy,
  Permissions-Policy, COOP, HSTS, and CSP `frame-ancestors 'none'`.
- **Content-Security-Policy**: the pages carry a hash-based policy with no
  `unsafe-inline` in `script-src`, computed from the build output and injected
  as a `<meta>` tag by `scripts/inject-csp.ts` (hashes rotate with each build,
  so a static header could not express it). `npm run check:csp` re-derives the
  policy from the artifacts and fails on any mismatch. The site loads no
  third-party scripts, styles, fonts, or frames.
- The CV PDFs are served with `X-Robots-Tag: noindex` — downloadable from the
  site, absent from search indexes.
- Supply chain: `npm ci` from a committed lockfile, `npm audit --omit=dev`
  as a pipeline phase (`npm run check:audit`), Dependabot weekly, CodeQL on
  every push.

## Scope
Reports about the deployed site, this repository's build and CI, or the
assistant's handling of input are in scope. The assistant is instructed to
answer only from published site content; if you can get it to leak its prompt,
act outside that scope, or state something the content does not support, that is
worth reporting.
