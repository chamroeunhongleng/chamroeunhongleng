/**
 * check-structure — asserts the repository contract:
 *  - every required file exists (pages, content, schemas, docs, .claude tooling, CI)
 *  - no .env file is committed / .gitignore covers secrets and build output
 *  - vercel.json security headers stay in sync with nuxt.config routeRules
 *    (the duplication is load-bearing: static hosting ignores routeRules)
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const problems: string[] = []

const REQUIRED_FILES = [
  // Root contract
  'package.json',
  'package-lock.json',
  'nuxt.config.ts',
  'tsconfig.json',
  'vitest.config.ts',
  'eslint.config.mjs',
  'vercel.json',
  '.env.example',
  '.gitignore',
  '.nvmrc',
  '.editorconfig',
  'README.md',
  'CLAUDE.md',
  // OWNER_INPUT.md is deliberately NOT required: it is a private working
  // questionnaire, gitignored so half-answered personal notes never ship
  // in a public repo. It still lives in the working tree locally.
  'SECURITY.md',
  'LICENSE',
  // App
  'app/app.vue',
  'app/error.vue',
  'app/layouts/default.vue',
  'app/pages/index.vue',
  'app/pages/about.vue',
  'app/pages/journey.vue',
  'app/pages/learning.vue',
  'app/pages/contact.vue',
  'app/pages/colophon.vue',
  'app/pages/projects/index.vue',
  'app/pages/projects/[slug].vue',
  'app/data/portfolio.ts',
  'app/composables/usePortfolioMode.ts',
  'app/composables/usePageMeta.ts',
  // Design system
  'app/assets/css/tokens.css',
  'app/assets/css/base.css',
  'app/assets/css/typography.css',
  'app/assets/css/utilities.css',
  'app/assets/css/motion.css',
  // Shared contract
  'shared/markers.ts',
  'shared/rules.ts',
  'shared/schemas/index.ts',
  'shared/schemas/enums.ts',
  'shared/schemas/common.ts',
  'shared/schemas/project.ts',
  'shared/schemas/site.ts',
  'modules/content-gate.ts',
  // Chat assistant
  'api/chat.ts',
  'shared/chat/contract.ts',
  'shared/chat/knowledge.ts',
  'shared/chat/navigation.ts',
  'shared/chat/site-facts.ts',
  'app/components/chat/ChatWidget.vue',
  'app/components/chat/ChatMessage.vue',
  'app/composables/useChat.ts',
  'docs/chat-assistant.md',
  // Content
  'content/profile.json',
  'content/education.json',
  'content/interests.json',
  'content/experience.json',
  'content/learning.json',
  'content/principles.json',
  'content/contact.json',
  'content/process.json',
  'content/now.json',
  'content/colophon.json',
  'content/projects/kaskor-asr.json',
  'content/projects/chomkar-decision-grid.json',
  'content/projects/chomkar-orderloop.json',
  'content/projects/ai-layer.json',
  'content/projects/lms.json',
  'content/projects/demo-governance-review.json',
  // Public assets
  'public/robots.txt',
  'public/site.webmanifest',
  'public/icon.svg',
  'public/og.png',
  'public/apple-touch-icon.png',
  'public/favicon-32.png',
  // Verification
  'scripts/verify.ts',
  'scripts/check-structure.ts',
  'scripts/check-secrets.ts',
  'scripts/check-content.ts',
  'scripts/check-owner-content.ts',
  'scripts/check-links.ts',
  'scripts/check-a11y.ts',
  'scripts/check-seo.ts',
  'scripts/generate-assets.ts',
  'scripts/lib/load-content.ts',
  // Docs
  'docs/local-setup.md',
  'docs/preview-deployment.md',
  'docs/ui-review-checklist.md',
  'docs/content-replacement-guide.md',
  'docs/production-release-checklist.md',
  'docs/validation-report.md',
  // CI
  '.github/workflows/quality.yml',
  '.github/workflows/production-gate.yml',
  '.github/workflows/codeql.yml',
  '.github/dependabot.yml',
  // Claude tooling
  '.claude/settings.json',
  '.claude/hooks/guard-bash.mjs',
  '.claude/hooks/check-written-file.mjs',
  '.claude/hooks/session-context.mjs',
  ...[
    'study-reference',
    'plan-portfolio',
    'build-ui',
    'create-case-study',
    'review-responsive',
    'review-accessibility',
    'replace-owner-content',
    'audit-claims',
    'prepare-preview',
    'release-production'
  ].map((c) => `.claude/commands/${c}.md`),
  ...[
    'reference-research',
    'portfolio-ia',
    'ui-implementation',
    'case-study-development',
    'accessibility',
    'evidence-verification',
    'owner-content-replacement',
    'security-review',
    'seo-review',
    'deployment-review'
  ].map((s) => `.claude/skills/${s}/SKILL.md`),
  ...[
    'ux-reviewer',
    'accessibility-reviewer',
    'evidence-reviewer',
    'security-reviewer',
    'seo-reviewer',
    'release-verifier'
  ].map((a) => `.claude/agents/${a}.md`)
]

for (const file of REQUIRED_FILES) {
  if (!existsSync(join(root, file))) problems.push(`Missing required file: ${file}`)
}

// Secret hygiene
if (existsSync(join(root, '.env'))) {
  problems.push('.env exists in the working tree — verify it is gitignored and never committed.')
}
const gitignore = existsSync(join(root, '.gitignore'))
  ? readFileSync(join(root, '.gitignore'), 'utf8')
  : ''
for (const required of ['.env', 'node_modules', '.nuxt', '.output']) {
  if (!gitignore.split(/\r?\n/).some((line) => line.trim() === required || line.trim() === `${required}/`)) {
    problems.push(`.gitignore must cover "${required}".`)
  }
}

// Header sync: nuxt.config routeRules vs vercel.json
async function checkHeaderSync() {
  const { default: nuxtConfig } = await import('../nuxt.config')
  const routeHeaders
    = (nuxtConfig as { routeRules?: Record<string, { headers?: Record<string, string> }> })
      .routeRules?.['/**']?.headers ?? {}
  const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
    headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>
  }
  const vercelHeaders = Object.fromEntries(
    (vercel.headers?.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value])
  )
  for (const [key, value] of Object.entries(routeHeaders)) {
    if (vercelHeaders[key] !== value) {
      problems.push(
        `Security header out of sync: "${key}" is "${value}" in nuxt.config but "${vercelHeaders[key] ?? 'missing'}" in vercel.json.`
      )
    }
  }
  for (const key of Object.keys(vercelHeaders)) {
    if (!(key in routeHeaders) && key !== 'Cache-Control') {
      problems.push(`Security header "${key}" exists in vercel.json but not in nuxt.config routeRules.`)
    }
  }
}

await checkHeaderSync()

if (problems.length > 0) {
  console.error(`check:structure — FAILED (${problems.length} problem(s))`)
  for (const p of problems) console.error(`  ERROR ${p}`)
  process.exit(1)
}
console.log(`check:structure — OK (${REQUIRED_FILES.length} required files present, headers in sync)`)
