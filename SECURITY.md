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
  content; the function stores no messages and sets no cookies.
- **Rate limiting is per-instance and in-memory** (8 requests/IP/minute, 60/IP/day,
  500/day global). Serverless instances do not share that state, so the limits
  are a cost brake, not a guarantee. The real backstop is a spend limit on the
  Anthropic account.
- **The contact form never submits anything.** It composes a `mailto:` link in
  the browser and hands it to the visitor's mail client — no endpoint, no
  third-party form service, no storage.
- No database, no authentication, no analytics, no cookies. Fonts are
  self-hosted, so page rendering makes no third-party requests.

## Dependencies and secrets
- Two runtime dependencies, both used only by the serverless function:
  `@anthropic-ai/sdk` and `zod`. The static pages ship none.
- `ANTHROPIC_API_KEY` is the only secret the deployed site needs. It lives in
  Vercel environment variables and nowhere else — never in this repository.
- `.env*` files are gitignored. `npm run check:secrets` scans the tree in CI and
  locally.
- Security headers ship via `vercel.json` (mirrored in `nuxt.config` routeRules
  for the dev server); `npm run check:structure` keeps the two in sync.
- Supply chain: `npm ci` from a committed lockfile, Dependabot weekly, CodeQL on
  every push.

## Scope
Reports about the deployed site, this repository's build and CI, or the
assistant's handling of input are in scope. The assistant is instructed to
answer only from published site content; if you can get it to leak its prompt,
act outside that scope, or state something the content does not support, that is
worth reporting.
