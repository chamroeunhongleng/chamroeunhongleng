# Claude Code Contract — Chamroeun Hongleng Portfolio

Read this before changing anything. Then check `git status -sb` and run
`npm run check:owner-content` to see the current content state.

## Mission

Maintain a portfolio positioned at the intersection of **AI/ML, software,
business, and governance** for a dual-degree student who works AI-natively.
The positioning is learner-honest: never describe the owner as a lawyer,
legal expert, senior software engineer, or machine-learning expert.

The homepage intro (two paragraphs in `content/profile.json` → `intro`) and
the hero statement are owner-approved verbatim — presentation may improve,
meaning may not change without owner approval.

## Non-negotiable rules

1. **Evidence before hype.** Every important claim is a `Claim` object with one
   of eight evidence labels. Never invent qualifications, education, employment,
   projects, users, revenue, awards, model performance, deployments, or results.
   Missing information keeps its `[OWNER_INPUT_REQUIRED: …]` marker.
2. **Two-axis honesty.** Lifecycle `status` and `deployment` reality are
   separate labels, shown separately. Never label non-production work as
   Production — the schema rejects it and so should you.
3. **No regex-over-source validation. Ever.** Content is validated by loading
   JSON through the zod schemas in `shared/schemas/` (via `contentManifest`).
   The previous-generation build validated by regexing source text; that
   anti-pattern does not come back.
4. **No hardcoded route lists.** Prerender routes and the sitemap derive from
   `content/projects/*.json` in `nuxt.config.ts`. Adding a project = adding a
   JSON file, nothing else.
5. **One rule engine.** Mode-dependent content rules live in `shared/rules.ts`,
   used identically by `npm run check:owner-content`, the build gate
   (`modules/content-gate.ts`), and the tests. Never fork that logic.
6. **Humans approve consequences.** Production deploys, DNS, env vars,
   analytics, contact-email publication, legal pages, and final public claims
   are owner decisions. Stop at the gate; the hooks enforce it anyway.
7. **Tokens only.** Components style with custom properties from
   `app/assets/css/tokens.css`. Content prose renders through `<MarkedText>`.

## Architecture map

- `content/*.json` + `content/projects/*.json` — ALL site content, zod-validated
- `shared/schemas/` — vocabularies + schemas (single source of truth)
- `shared/markers.ts` — placeholder-marker grammar (`[DEMO]`, `[PLACEHOLDER: …]`,
  `[OWNER_INPUT_REQUIRED: …]`, `[REPLACE_BEFORE_PRODUCTION: …]`)
- `shared/rules.ts` — the mode-aware content rule engine
- `modules/content-gate.ts` — fails production builds while issues remain
- `app/` — Nuxt 4 srcDir: pages, components (layout/ui/projects), composables,
  `data/portfolio.ts` (the validated loader; note: the process content exports
  as `processContent` — a `process` export collides with Node's global)
- `scripts/` — verification pipeline (Node + jiti, no Python assumed)
- `docs/` — setup, deployment, checklists, validation report
- `OWNER_INPUT.md` — the owner questionnaire that retires the placeholders

## Chat assistant

The floating "Ask" widget is the site's only runtime backend: one Vercel
function at `api/chat.ts` (the Nuxt build stays fully static). Rules:

- Its knowledge derives from `content/*.json` (via the same zod loader) plus
  `shared/chat/site-facts.ts`, which mirrors the Skills / "What I bring"
  prose hardcoded in `app/pages/about.vue` — **change both in the same
  commit**. No regex sync-check (rule 3); the comment marks the duty.
- Navigation targets derive from project content (rule 4) in
  `shared/chat/navigation.ts`; the server validates every `navigateTo`
  against that allowlist.
- Evidence rules apply to the system prompt: never overstate the owner,
  qualifiers preserved, placeholder-marked fields dropped.
- `ANTHROPIC_API_KEY` is owner-managed (rule 6): Vercel env vars only,
  never in the repo. Operations guide: `docs/chat-assistant.md`.

## Modes (baked at build time)

`NUXT_PUBLIC_PORTFOLIO_MODE` = `demo` (banner + demo content) · `review`
(default; owner content, markers visible as chips) · `production` (build FAILS
while any marker, enabled demo project, or missing required content remains).
`npm run generate:production` answers "would production build?" locally.

## Verification

```bash
npm run verify          # the full 12-phase pipeline — run before "done"
npm run check:owner-content -- --mode=production   # what still blocks release
```

## Slash commands

`/study-reference` `/plan-portfolio` `/build-ui` `/create-case-study`
`/review-responsive` `/review-accessibility` `/replace-owner-content`
`/audit-claims` `/prepare-preview` `/release-production`

Skills load automatically with those commands; specialist reviewers
(`ux-reviewer`, `accessibility-reviewer`, `evidence-reviewer`,
`security-reviewer`, `seo-reviewer`, `release-verifier`) report findings and
never edit — the main session owns integration.

## Definition of done

The user-visible outcome exists, `npm run verify` is green, claims match their
evidence labels, no secret or unapproved personal data was added, and any
remaining human decisions are stated explicitly.
