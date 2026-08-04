# Preview deployment (Vercel)

Preview deployments are safe and reversible. Production is a separate,
owner-only decision — see `production-release-checklist.md`.

## One-time setup
1. Push this repository to GitHub (private is fine).
2. In Vercel: **Add New → Project**, import the repo. Framework preset:
   **Nuxt** (auto-detected). Build command `npm run generate` is inferred;
   output is fully static.
3. **Before the first build**, set the environment variables (Project →
   Settings → Environment Variables) — the mode is baked at build time, so
   setting it after a deploy does nothing until the next build:

   | Variable | Preview value | Production value (later) |
   |---|---|---|
   | `NUXT_PUBLIC_PORTFOLIO_MODE` | `review` | `production` |
   | `NUXT_PUBLIC_SITE_URL` | (leave unset or the preview URL) | `https://chamroeunhongleng.me` |

## Every preview after that
Push a branch or open a PR → Vercel builds a unique preview URL automatically.
CI (`quality.yml`) runs `npm run verify` in parallel on GitHub.

## Reviewing a preview
Walk `ui-review-checklist.md` against the preview URL: both themes, mobile
widths, all 8 pages, the 6 case studies, filters, the 404 page.

## Notes
- Security headers come from `vercel.json` (Nuxt routeRules don't apply to
  static hosting).
- With `production` mode set, Vercel builds will FAIL while placeholders or
  demo content remain — that is the content gate, not a bug.
- Rollback = Vercel dashboard → Deployments → promote a previous deployment.
