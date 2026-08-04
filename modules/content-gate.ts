import { defineNuxtModule } from 'nuxt/kit'
import { loadContent } from '../scripts/lib/load-content'
import { formatFindings, runContentRules } from '../shared/rules'
import { PORTFOLIO_MODES, type PortfolioMode } from '../shared/schemas/index'

/**
 * The production content gate. Runs inside every `nuxt build|generate|dev`
 * — it cannot be bypassed by calling nuxt directly, unlike an npm prebuild
 * chain. It uses the SAME rule engine as `npm run check:owner-content`,
 * so the CLI and the build can never disagree.
 *
 * demo/review: findings are logged, the build proceeds.
 * production:  any error finding (placeholder markers, enabled demo
 *              projects, missing required content, placeholder links)
 *              ABORTS the build with the full violation list.
 */
export default defineNuxtModule({
  meta: { name: 'content-gate' },
  setup() {
    const rawMode = process.env.NUXT_PUBLIC_PORTFOLIO_MODE ?? 'review'
    const mode = (PORTFOLIO_MODES as readonly string[]).includes(rawMode)
      ? (rawMode as PortfolioMode)
      : 'review'

    const { bundle, issues } = loadContent()
    if (!bundle) {
      const detail = issues.map((i) => `  - ${i.file}: ${i.message}`).join('\n')
      throw new Error(`[content-gate] Content failed schema validation:\n${detail}`)
    }

    const findings = runContentRules(bundle, mode, {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://chamroeunhongleng.me'
    })
    const errors = findings.filter((f) => f.severity === 'error')
    const warnings = findings.filter((f) => f.severity === 'warning')

    if (mode === 'production' && errors.length > 0) {
      throw new Error(
        `[content-gate] Production build blocked — ${errors.length} unresolved content issue(s):\n`
        + `${formatFindings(errors)}\n`
        + 'Complete OWNER_INPUT.md, replace or disable demo content, then rebuild.'
      )
    }

    if (findings.length > 0) {
      console.info(
        `[content-gate] mode=${mode}: ${errors.length} error(s), ${warnings.length} warning(s), `
        + `${findings.length - errors.length - warnings.length} info. `
        + 'Run `npm run check:owner-content` for the full list.'
      )
    } else {
      console.info(`[content-gate] mode=${mode}: content clean.`)
    }
  }
})
