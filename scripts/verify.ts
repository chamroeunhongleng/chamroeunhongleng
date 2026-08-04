/**
 * verify — the one-command verification pipeline: npm run verify
 *
 * Order matters: cheap static checks first, then lint/types/tests, then the
 * full static generation, then checks that inspect the generated output,
 * and finally a self-test proving the production gate actually gates.
 */
import { spawnSync } from 'node:child_process'
import { loadContent } from './lib/load-content'
import { runContentRules } from '../shared/rules'

interface Step {
  name: string
  command: string[]
  /** For the gate self-test: which exit outcome counts as success. */
  expectFailure?: boolean
}

const mode = process.env.NUXT_PUBLIC_PORTFOLIO_MODE ?? 'review'

const steps: Step[] = [
  { name: 'Repository structure', command: ['run', 'check:structure'] },
  { name: 'Secret scan', command: ['run', 'check:secrets'] },
  { name: 'Content schemas', command: ['run', 'check:content'] },
  { name: `Owner content (mode: ${mode})`, command: ['run', 'check:owner-content'] },
  { name: 'Lint', command: ['run', 'lint'] },
  { name: 'Typecheck', command: ['run', 'typecheck'] },
  { name: 'Tests', command: ['run', 'test'] },
  { name: 'Static generation', command: ['run', 'generate'] },
  { name: 'Links & assets', command: ['run', 'check:links'] },
  { name: 'Accessibility basics', command: ['run', 'check:a11y'] },
  { name: 'SEO metadata', command: ['run', 'check:seo'] }
]

// Gate self-test: while unresolved production issues exist, the production
// check MUST fail — a passing gate here would mean the gate is broken.
const { bundle } = loadContent()
const productionErrors = bundle
  ? runContentRules(bundle, 'production', {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://chamroeunhongleng.me'
    }).filter((f) => f.severity === 'error')
  : []
const gateShouldFail = productionErrors.length > 0
steps.push({
  name: gateShouldFail
    ? `Production gate self-test (expects FAILURE — ${productionErrors.length} issue(s) remain)`
    : 'Production gate self-test (expects PASS — content is production-ready)',
  command: ['run', 'check:owner-content', '--', '--mode=production'],
  expectFailure: gateShouldFail
})

console.log(`\nverify — ${steps.length} phases, mode: ${mode}\n${'—'.repeat(60)}`)

const started = Date.now()
let failed = false

for (const [index, step] of steps.entries()) {
  const label = `[${index + 1}/${steps.length}] ${step.name}`
  console.log(`\n${label}`)
  const phaseStart = Date.now()
  const result = spawnSync('npm', step.command, {
    stdio: step.expectFailure !== undefined ? 'pipe' : 'inherit',
    shell: true,
    encoding: 'utf8'
  })
  const seconds = ((Date.now() - phaseStart) / 1000).toFixed(1)
  const exitedNonZero = (result.status ?? 1) !== 0
  const ok = step.expectFailure === undefined ? !exitedNonZero : exitedNonZero === step.expectFailure

  if (ok) {
    console.log(`  PASS (${seconds}s)`)
  } else {
    if (step.expectFailure !== undefined) {
      console.error(result.stdout ?? '')
      console.error(result.stderr ?? '')
      console.error(
        step.expectFailure
          ? '  FAIL — the production gate PASSED while unresolved issues remain. The gate is broken.'
          : '  FAIL — the production gate failed although content looks production-ready.'
      )
    }
    console.error(`  FAIL (${seconds}s) — stopping here.`)
    failed = true
    break
  }
}

const total = ((Date.now() - started) / 1000).toFixed(1)
console.log(`\n${'—'.repeat(60)}`)
if (failed) {
  console.error(`verify — FAILED after ${total}s`)
  process.exit(1)
}
console.log(`verify — ALL ${steps.length} PHASES PASSED in ${total}s`)
