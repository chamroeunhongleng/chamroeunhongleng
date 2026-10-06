/** The assistant's navigation map and its validator. Project destinations are derived from
 *  loaded content, never hardcoded (CLAUDE.md rule 4); static anchors mirror the page templates. */
import type { Project } from '../schemas/index.js'

export interface NavTarget {
  /** Root-relative path, optionally with a #fragment. */
  path: string
  /** One line the model reads to decide when this destination fits. */
  what: string
}

/** Static pages and their in-page anchors (mirrors app/pages/*.vue ids). */
export const STATIC_NAV_TARGETS: readonly NavTarget[] = [
  { path: '/', what: 'Homepage — who he is, featured projects, current focus' },
  { path: '/#now', what: 'What is in motion right now (current activity feed)' },
  { path: '/#process', what: 'Rules he works by — three working principles on the homepage' },
  { path: '/#stack', what: 'Technologies he has used, grouped, each traced to a case study or his skills' },
  { path: '/about', what: 'His story, skills, what he brings, education' },
  { path: '/about#education-title', what: 'Education — degrees, scholarships, institutions' },
  { path: '/about#links-title', what: 'Public profiles (GitHub, LinkedIn, X) and email' },
  { path: '/projects', what: 'All project case studies with filters' },
  { path: '/journey', what: 'Timeline — roles, competitions, milestones' },
  { path: '/learning', what: 'What he is studying now across the four disciplines' },
  { path: '/learning#experiments-title', what: 'Running experiments and their states' },
  { path: '/learning#reading-title', what: 'Reading notes' },
  { path: '/learning#roadmap-title', what: 'Learning roadmap — now, next, later' },
  { path: '/contact', what: 'Email, contact form, socials, what he is (not) seeking' },
  { path: '/cv', what: 'The CV as a page — education, projects, experience, awards, skills; PDF download' },
  { path: '/colophon', what: 'How this site was built and the AI-use policy' },
  { path: '/colophon#policy-title', what: 'The AI policy — what stays human, what AI assists' },
  { path: '/colophon#build-title', what: 'How the site is built technically' },
  { path: '/colophon#provenance-title', what: 'Receipts for how the site was made' },
  { path: '/colophon#agents-title', what: 'Note for AI agents reading the site' }
]

/** In-page section nav of every case-study page (app/pages/projects/[slug].vue). */
export const PROJECT_SECTION_ANCHORS: ReadonlyArray<{ id: string; what: string }> = [
  { id: 'overview', what: 'problem, users, why it matters' },
  { id: 'role', what: 'his exact role vs team contributions' },
  { id: 'research', what: 'research and validation' },
  { id: 'solution', what: 'proposed solution, workflow, architecture, methods' },
  { id: 'governance', what: 'business value, contracts/policy, data privacy, risks' },
  { id: 'execution', what: 'completed work, evidence, results' },
  { id: 'reflection', what: 'limitations, lessons, next validation' }
]

export function chatProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.enabled && !p.demo)
}

export function buildNavTargets(projects: Project[]): NavTarget[] {
  const targets: NavTarget[] = [...STATIC_NAV_TARGETS]
  for (const project of chatProjects(projects)) {
    targets.push({
      path: `/projects/${project.slug}`,
      what: `Case study: ${project.name} — ${project.oneLiner}`
    })
    for (const anchor of PROJECT_SECTION_ANCHORS) {
      targets.push({
        path: `/projects/${project.slug}#${anchor.id}`,
        what: `${project.name} — ${anchor.what}`
      })
    }
  }
  return targets
}

export function buildNavAllowlist(projects: Project[]): ReadonlySet<string> {
  return new Set(buildNavTargets(projects).map((t) => t.path))
}

/** The only gate between model output and the router: exact allowlist match or null, so
 *  external URLs, javascript: schemes and invented anchors never navigate. */
export function validateNavigateTo(
  value: unknown,
  allowlist: ReadonlySet<string>
): string | null {
  if (typeof value !== 'string') return null
  return allowlist.has(value) ? value : null
}
