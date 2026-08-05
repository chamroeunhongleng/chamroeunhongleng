/**
 * check-content — zod-validates every content file through the shared
 * manifest and enforces structural invariants (slug↔filename, featured
 * coverage, cross-references). Run: npm run check:content
 */
import { loadContent, printIssues } from './lib/load-content'

const { bundle, issues } = loadContent()

if (!bundle) {
  console.error(`check:content — FAILED (${issues.length} issue${issues.length === 1 ? '' : 's'})`)
  printIssues(issues)
  process.exit(1)
}

const enabled = bundle.projects.filter((p) => p.enabled)
const problems: string[] = []

if (enabled.length === 0) problems.push('No enabled projects.')
if (!enabled.some((p) => p.featured)) problems.push('No enabled project is featured.')

const flagships = enabled.filter((p) => p.flagship)
if (flagships.length > 1) {
  problems.push(`More than one flagship project: ${flagships.map((p) => p.slug).join(', ')}.`)
}

const slugs = new Set(bundle.projects.map((p) => p.slug))
if (slugs.size !== bundle.projects.length) problems.push('Duplicate project slugs detected.')

const enabledSlugs = new Set(enabled.map((p) => p.slug))
for (const pillar of bundle.interests.pillars) {
  for (const slug of pillar.projects) {
    if (!enabledSlugs.has(slug)) {
      problems.push(`interests: pillar "${pillar.id}" references unknown/disabled project "${slug}".`)
    }
  }
}

if (problems.length > 0) {
  console.error('check:content — FAILED')
  for (const p of problems) console.error(`  ERROR ${p}`)
  process.exit(1)
}

console.log(
  `check:content — OK (${bundle.projects.length} projects, ${enabled.length} enabled, ${
    enabled.filter((p) => p.demo).length
  } demo)`
)
