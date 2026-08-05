import type { ContentBundle, PortfolioMode } from './schemas/index'
import { collectMarkers } from './markers'
import type { MarkerType } from './markers'

/**
 * The mode-aware content rule engine — the ONE implementation shared by
 * `npm run check:owner-content`, the build gate (modules/content-gate.ts),
 * and the tests. CLI and gate can never disagree because they call the
 * same function.
 */

export type Severity = 'info' | 'warning' | 'error'

export interface Finding {
  severity: Severity
  code: string
  path: string
  message: string
}

export interface RuleOptions {
  /** Canonical site URL the build will use (checked in production mode). */
  siteUrl?: string
}

const PLACEHOLDER_URL_RE = /example\.(com|org|net)|localhost|127\.0\.0\.1|your-domain|CHANGE_ME/i

/**
 * Achievement-shaped numbers (percentages, money, user/test/sample counts)
 * are only allowed inside evidence-labeled Claims — never in loose prose.
 * Technical parameters ("16 kHz", "v0.0") do not match this pattern.
 */
const NUMERIC_CLAIM_RE
  = /\d[\d,.]*\s*(%|percent|users?\b|customers?\b|farmers?\b|samples?\b|tests?\b|interviews?\b|downloads?\b|stars?\b)|\$\s?\d/i

/** Prose fields of a project that must stay free of unlabeled numeric claims. */
const PROJECT_PROSE_FIELDS = [
  'problem',
  'targetUsers',
  'whyItMatters',
  'exactRole',
  'teamContributions',
  'proposedSolution',
  'systemArchitecture',
  'methods',
  'businessValue',
  'contractsPolicy',
  'dataPrivacy'
] as const

function markerSeverity(type: MarkerType, mode: PortfolioMode): Severity {
  if (mode === 'production') return 'error'
  if (type === 'REPLACE_BEFORE_PRODUCTION') return 'warning'
  return mode === 'review' ? 'warning' : 'info'
}

export function runContentRules(
  bundle: ContentBundle,
  mode: PortfolioMode,
  options: RuleOptions = {}
): Finding[] {
  const findings: Finding[] = []
  const add = (severity: Severity, code: string, path: string, message: string) =>
    findings.push({ severity, code, path, message })

  // 1. Placeholder markers anywhere in parsed content.
  const sections: Array<[string, unknown]> = [
    ['profile', bundle.profile],
    ['education', bundle.education],
    ['interests', bundle.interests],
    ['experience', bundle.experience],
    ['learning', bundle.learning],
    ['principles', bundle.principles],
    ['contact', bundle.contact],
    ['process', bundle.process],
    ['now', bundle.now],
    ['colophon', bundle.colophon]
  ]
  for (const project of bundle.projects) {
    // Disabled projects ship nothing — no route, no listing — so their dormant
    // content does not gate production. Rule 2's own remedy ("Disable or
    // replace it before production") depends on this.
    if (project.enabled) sections.push([`projects/${project.slug}`, project])
  }

  for (const [name, section] of sections) {
    for (const { path, marker } of collectMarkers(section, name)) {
      add(
        markerSeverity(marker.type, mode),
        `marker-${marker.type.toLowerCase().replaceAll('_', '-')}`,
        path,
        marker.note
          ? `[${marker.type}] marker present: ${marker.note}`
          : `[${marker.type}] marker present`
      )
    }
  }

  // 2. Demo projects still enabled.
  for (const project of bundle.projects) {
    if (project.demo && project.enabled) {
      add(
        mode === 'production' ? 'error' : mode === 'review' ? 'warning' : 'info',
        'demo-project-enabled',
        `projects/${project.slug}`,
        `Demonstration project "${project.name}" is enabled. Disable or replace it before production.`
      )
    }
  }

  // 3. Demo images.
  for (const project of bundle.projects) {
    if (!project.enabled) continue
    const images: Array<[string, NonNullable<typeof project.cover>]> = []
    if (project.cover) images.push([`projects/${project.slug}.cover`, project.cover])
    if (project.portrait) images.push([`projects/${project.slug}.portrait`, project.portrait])
    for (const [i, image] of (project.gallery ?? []).entries()) {
      images.push([`projects/${project.slug}.gallery[${i}]`, image])
    }
    for (const [path, image] of images) {
      if (image.demo || image.src.includes('/images/demo/')) {
        add(
          mode === 'production' ? 'error' : 'info',
          'demo-image',
          path,
          `Demo image "${image.src}" must be replaced before production.`
        )
      }
    }
  }

  // 4. Placeholder or insecure links anywhere in content.
  const urlWalk = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      const looksLikeUrl = /^(https?:|mailto:|\/|#)/.test(value)
      if (looksLikeUrl) {
        if (value === '#' || value.startsWith('http://') || PLACEHOLDER_URL_RE.test(value)) {
          add(
            mode === 'production' ? 'error' : 'warning',
            'placeholder-link',
            path,
            `Placeholder or insecure link "${value}".`
          )
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => urlWalk(v, `${path}[${i}]`))
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) urlWalk(v, `${path}.${k}`)
    }
  }
  for (const [name, section] of sections) urlWalk(section, name)

  // 5. Numeric claims outside evidence-labeled Claim objects.
  for (const project of bundle.projects) {
    if (!project.enabled) continue
    for (const field of PROJECT_PROSE_FIELDS) {
      const text = project[field]
      if (typeof text === 'string' && NUMERIC_CLAIM_RE.test(text)) {
        add(
          mode === 'production' ? 'error' : 'warning',
          'numeric-claim-in-prose',
          `projects/${project.slug}.${field}`,
          'Achievement-shaped number found in prose. Move it into an evidence-labeled claim (evidence/results/completedWork).'
        )
      }
    }
    for (const [i, step] of project.userWorkflow.entries()) {
      if (NUMERIC_CLAIM_RE.test(step)) {
        add(
          mode === 'production' ? 'error' : 'warning',
          'numeric-claim-in-prose',
          `projects/${project.slug}.userWorkflow[${i}]`,
          'Achievement-shaped number found in workflow step. Move it into an evidence-labeled claim.'
        )
      }
    }
  }

  // 6. Cross-references: pillar → project slugs and experiments → projects.
  const knownSlugs = new Set(bundle.projects.filter((p) => p.enabled).map((p) => p.slug))
  for (const pillar of bundle.interests.pillars) {
    for (const slug of pillar.projects) {
      if (!knownSlugs.has(slug)) {
        add(
          'error',
          'broken-project-reference',
          `interests.pillars.${pillar.id}`,
          `Pillar references unknown or disabled project "${slug}".`
        )
      }
    }
  }
  for (const [i, experiment] of bundle.learning.experiments.entries()) {
    if (experiment.projectSlug && !knownSlugs.has(experiment.projectSlug)) {
      add(
        'error',
        'broken-project-reference',
        `learning.experiments[${i}]`,
        `Experiment references unknown or disabled project "${experiment.projectSlug}".`
      )
    }
  }

  // 7. Featured coverage.
  if (!bundle.projects.some((p) => p.enabled && p.featured)) {
    add('error', 'no-featured-project', 'projects', 'At least one enabled project must be featured.')
  }

  // 8. Contact email must be a real address in production.
  if (mode === 'production' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(bundle.contact.email)) {
    add(
      'error',
      'contact-email-missing',
      'contact.email',
      'Production requires a confirmed public contact email address.'
    )
  }

  // 9. Site URL sanity in production.
  if (mode === 'production' && options.siteUrl) {
    if (!options.siteUrl.startsWith('https://') || PLACEHOLDER_URL_RE.test(options.siteUrl)) {
      add(
        'error',
        'site-url-placeholder',
        'env.NUXT_PUBLIC_SITE_URL',
        `Site URL "${options.siteUrl}" is not a valid production https URL.`
      )
    }
  }

  // 10. Enabled real projects without any public receipt — disclosed, not hidden.
  for (const project of bundle.projects) {
    if (project.enabled && !project.demo && project.publicLinks.length === 0) {
      add(
        'info',
        'no-public-links',
        `projects/${project.slug}`,
        'Project has no public links. Ensure its claims use Owner confirmed / Private labels.'
      )
    }
  }

  return findings
}

export function worstSeverity(findings: Finding[]): Severity | null {
  if (findings.some((f) => f.severity === 'error')) return 'error'
  if (findings.some((f) => f.severity === 'warning')) return 'warning'
  if (findings.length > 0) return 'info'
  return null
}

export function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'No findings.'
  const icon: Record<Severity, string> = { error: 'ERROR', warning: 'WARN ', info: 'INFO ' }
  return findings
    .map((f) => `${icon[f.severity]} [${f.code}] ${f.path} — ${f.message}`)
    .join('\n')
}
