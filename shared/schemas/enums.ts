// Canonical vocabularies for the whole site — a label not defined here cannot ship.
// Erasable syntax only (`as const`, no TS enums): these run under Node type stripping as well as Vite.

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

/** Deliberately separate from lifecycle status, so a polished prototype can never read as shipped. */
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

/** Labels strong enough to support a Production status. `satisfies` pins each entry to the
 *  vocabulary above, so renaming a label there is a compile error instead of a weakened rule. */
export const HARD_EVIDENCE_LABELS = [
  'Owner confirmed',
  'Public evidence',
  'Repository evidence',
  'Document evidence'
] as const satisfies readonly EvidenceLabel[]

export const WORK_STATES = [
  'Completed',
  'Demonstrated',
  'Tested',
  'Planned',
  'Unverified',
  'Private'
] as const
export type WorkState = (typeof WORK_STATES)[number]

export const PORTFOLIO_MODES = ['demo', 'review', 'production'] as const
export type PortfolioMode = (typeof PORTFOLIO_MODES)[number]

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
