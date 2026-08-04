# Security

## Reporting
If you find a security issue in this repository or the deployed site, please
open a GitHub security advisory on the repository (Security → Report a
vulnerability) or contact the owner through the profiles listed on the site.
Please do not open a public issue for security reports.

## Posture
- Fully static site: no backend, no database, no forms, no authentication,
  no cookies, no analytics, no external requests at runtime (fonts self-hosted).
- Zero runtime npm dependencies; all packages are build-time only.
- Secrets: none are required to build or deploy. `.env*` files are gitignored;
  `npm run check:secrets` scans the tree in CI and locally.
- Security headers ship via `vercel.json` (mirrored in nuxt.config routeRules
  for the dev server); `npm run check:structure` keeps them in sync.
- Supply chain: `npm ci` from a committed lockfile, Dependabot weekly, CodeQL
  on every push.
