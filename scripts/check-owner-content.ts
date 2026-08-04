/**
 * check-owner-content — runs the shared mode-aware rule engine over the
 * loaded content. The SAME engine runs inside the build gate
 * (modules/content-gate.ts), so this CLI can never disagree with the build.
 *
 * Usage:
 *   npm run check:owner-content                 (mode from env, default review)
 *   npm run check:owner-content -- --mode=production
 */
import { loadContent, printIssues } from './lib/load-content'
import { formatFindings, runContentRules, worstSeverity } from '../shared/rules'
import { PORTFOLIO_MODES, type PortfolioMode } from '../shared/schemas/index'

const modeArg = process.argv.find((a) => a.startsWith('--mode='))?.slice('--mode='.length)
const mode = (modeArg
  ?? process.env.NUXT_PUBLIC_PORTFOLIO_MODE
  ?? 'review') as PortfolioMode

if (!PORTFOLIO_MODES.includes(mode)) {
  console.error(`Unknown mode "${mode}". Expected one of: ${PORTFOLIO_MODES.join(', ')}`)
  process.exit(2)
}

const { bundle, issues } = loadContent()
if (!bundle) {
  console.error('check:owner-content — content failed schema validation:')
  printIssues(issues)
  process.exit(1)
}

const findings = runContentRules(bundle, mode, {
  siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://chamroeunhongleng.me'
})

const errors = findings.filter((f) => f.severity === 'error')
const warnings = findings.filter((f) => f.severity === 'warning')
const infos = findings.filter((f) => f.severity === 'info')

console.log(`check:owner-content — mode: ${mode}`)
if (findings.length > 0) console.log(formatFindings(findings))
console.log(
  `Summary: ${errors.length} error(s), ${warnings.length} warning(s), ${infos.length} info.`
)

if (worstSeverity(findings) === 'error') {
  console.error(
    mode === 'production'
      ? 'Production gate would FAIL this build. Complete OWNER_INPUT.md and re-run.'
      : 'Errors present — fix before relying on this content.'
  )
  process.exit(1)
}
console.log('check:owner-content — OK')
