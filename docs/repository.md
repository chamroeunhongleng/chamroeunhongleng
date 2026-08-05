# Chamroeun Hongleng — Portfolio

A portfolio at the intersection of **AI/ML, software, business, and
governance**, built so that honesty is enforced by the build system: every
important claim carries an evidence label, project maturity uses two
independent axes (lifecycle status + deployment reality), and a production
build **fails** while any placeholder or demo content remains.

Built with Nuxt 4 · Vue 3 · TypeScript (strict) · zod · static generation.
Zero runtime dependencies, no analytics, no trackers, self-hosted fonts.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run verify     # the full 12-phase verification pipeline
```

Full guide: [docs/local-setup.md](local-setup.md)

## How this repository works

| Piece | Where | What it does |
|---|---|---|
| Content | `content/*.json`, `content/projects/*.json` | All site content, one file per case study |
| Schemas | `shared/schemas/` | zod contracts — a claim without an evidence label cannot parse |
| Markers | `shared/markers.ts` | `[OWNER_INPUT_REQUIRED: …]`-style placeholders, rendered as visible chips |
| Rule engine | `shared/rules.ts` | mode-aware content rules, shared by CLI + build gate + tests |
| Build gate | `modules/content-gate.ts` | aborts production builds while issues remain |
| Pages | `app/pages/` | Home, Projects (+ case studies), Journey, Learning, About, Contact, Colophon |
| Verification | `scripts/`, `npm run verify` | structure, secrets, content, lint, types, tests, generate, links, a11y, SEO, gate self-test |
| Claude tooling | `.claude/` | 10 commands, 10 skills, 6 reviewer agents, 3 guard hooks |

## Content modes

`NUXT_PUBLIC_PORTFOLIO_MODE` (baked at build time — see `.env.example`):

- **demo** — demonstration banner + demo content allowed
- **review** (default) — real content; unfinished fields visible as chips
- **production** — the build fails while placeholders, demo projects, or
  unverified required content remain (`npm run generate:production` to test)

## Personalizing

Answer the questionnaire in `OWNER_INPUT.md` — a private working file, kept in
the working tree but gitignored so half-answered personal notes never ship in a
public repository. Then either run
the `/replace-owner-content` command in Claude Code or edit the JSON directly.
[docs/content-replacement-guide.md](content-replacement-guide.md) explains
the rules; `npm run check:owner-content` shows what's left.

## Deploying

- Preview: [docs/preview-deployment.md](preview-deployment.md)
- Production: [docs/production-release-checklist.md](production-release-checklist.md) —
  deliberately gated behind human approval; nothing here deploys automatically.

## Honesty note

This site was built AI-natively (primarily with Claude) under a written
policy: judgment, claims, and evidence labels are the owner's; AI assists
research, scaffolding, drafting, and documentation. The full policy ships on
the site itself at `/colophon`. Current validation state:
[docs/validation-report.md](validation-report.md).
