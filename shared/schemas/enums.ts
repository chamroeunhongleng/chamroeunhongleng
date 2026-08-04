/**
 * Canonical vocabularies for the whole site. Everything — app components,
 * content JSON, verification scripts, the build gate, and tests — imports
 * these arrays, so a label that isn't defined here cannot ship.
 *
 * Erasable-syntax TypeScript only (`as const` + type aliases, no TS enums):
 * these files run under Node's native type stripping via jiti as well as
 * under Vite.
 */

/** Project lifecycle. Never label non-production work as Production. */
export const PROJECT_STATUSES = [
  'Idea',
  'Research',
  'Experiment',
  'Prototype',
  'Pre-pilot',
  'Pilot',
  'Public demo',
  'Production',
  'Paused',
  'Archived'
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/**
 * Deployment reality — deliberately separate from lifecycle status so a
 * polished prototype can never read as a shipped product.
 */
export const DEPLOYMENT_REALITIES = [
  'Deployed',
  'Public demo',
  'Local only',
  'Planned',
  'Not deployed'
] as const
export type DeploymentReality = (typeof DEPLOYMENT_REALITIES)[number]

/** Every important claim on the site carries exactly one of these labels. */
export const EVIDENCE_LABELS = [
  'Owner confirmed',
  'Public evidence',
  'Repository evidence',
  'Document evidence',
  'Demo only',
  'Planned',
  'Unverified',
  'Private'
] as const
export type EvidenceLabel = (typeof EVIDENCE_LABELS)[number]

/** Evidence labels strong enough to support a Production status claim. */
export const HARD_EVIDENCE_LABELS = [
  'Owner confirmed',
  'Public evidence',
  'Repository evidence',
  'Document evidence'
] as const

/** State of an individual piece of work inside a case study. */
export const WORK_STATES = [
  'Completed',
  'Demonstrated',
  'Tested',
  'Planned',
  'Unverified',
  'Private'
] as const
export type WorkState = (typeof WORK_STATES)[number]

/** Site content modes. See .env.example for semantics. */
export const PORTFOLIO_MODES = ['demo', 'review', 'production'] as const
export type PortfolioMode = (typeof PORTFOLIO_MODES)[number]

/** The four connected pillars of the portfolio. */
export const PILLARS = [
  'ai-ml',
  'software-product',
  'business-strategy',
  'governance-commercial'
] as const
export type PillarId = (typeof PILLARS)[number]

export const PILLAR_TITLES: Record<PillarId, string> = {
  'ai-ml': 'AI & Machine Learning',
  'software-product': 'Software & Product Systems',
  'business-strategy': 'Business & Strategy',
  'governance-commercial': 'Governance & Commercial Rules'
}
