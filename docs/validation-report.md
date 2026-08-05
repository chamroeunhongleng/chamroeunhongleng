# Validation report

**Artifact:** Chamroeun Hongleng portfolio (fresh Nuxt 4 build)
**Verified:** 2026-08-04, on Windows 11 · Node v24.16.0 · npm 11.13.0
**State:** Review-ready. Production remains gated behind owner content and owner approval — by design.

## Verified in this environment — `npm run verify`, all 12 phases PASSED (56s)

| # | Phase | Result |
|---|---|---|
| 1 | Repository structure (115 required files, header sync) | PASS |
| 2 | Secret scan (credential patterns, tracked files) | PASS — no findings |
| 3 | Content schemas (zod via shared manifest, 6 projects) | PASS |
| 4 | Owner content, review mode | PASS — 0 errors, 35 expected warnings |
| 5 | ESLint | PASS |
| 6 | vue-tsc typecheck (strict) | PASS |
| 7 | Vitest | PASS — 52 tests, 7 files |
| 8 | Static generation (30 routes prerendered) | PASS |
| 9 | Links & assets on generated HTML (zero network) | PASS — 15 pages |
| 10 | Accessibility basics on generated HTML | PASS — 13 pages |
| 11 | SEO metadata + sitemap↔routes + og.png 1200×630 | PASS — 13 pages |
| 12 | **Production gate self-test** | PASS — `--mode=production` correctly **fails** with 36 readable issues while placeholders/demo content remain |

Also verified directly:
- `npm run check:owner-content -- --mode=production` exits 1 with a per-field
  issue list (the release blocker list — this is correct behavior today).
- Claude hooks block force-push, `curl \| sh`, `.env` reads, and production
  deploy commands (tested by piping sample tool JSON); session-context hook
  reports mode + outstanding markers.
- OG image renders correctly (1200×630, editorial serif on warm paper).

## Not verified here (environment limits — honest gaps)

- **No real-browser testing.** Responsive behavior, theme toggle, filters, and
  clipboard were verified structurally and via generated HTML, not by a human
  in a browser. Walk `docs/ui-review-checklist.md` on `npm run dev` or a
  Vercel preview.
- **No screen-reader pass.** `check:a11y` covers structural basics only.
- **External links not fetched.** Link checking validates syntax and flags
  placeholder domains; it deliberately makes no network calls. The GitHub
  repository links were verified during build research (2026-08-04).
- **CI has not run yet** — workflows are authored but this repo had no remote
  at verification time.

## Content evidence state

Real content is seeded and labeled: repository-verifiable claims carry
Repository/Public evidence with links; owner-only claims (hackathon Top 2,
~86k samples, OrderLoop, AI Layer, Warden details) carry
Owner confirmed or Private, and OWNER_INPUT.md documents the upgrade path for
each. One demonstration project (`demo-governance-review`) is enabled and
labeled; production refuses to build while it remains.

## What remains before production (owner actions)

1. Answer `OWNER_INPUT.md` (36 gate issues trace to it) → `/replace-owner-content`.
2. Decide the demo governance project: replace with a real review or disable.
3. Approve a public contact email.
4. Confirm domain `chamroeunhongleng.me` (NOT serving at build time) and
   attach it in Vercel; set production env vars before the production build.
5. Final claim review + walk `docs/production-release-checklist.md`.
