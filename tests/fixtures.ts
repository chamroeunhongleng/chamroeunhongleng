import type { Project } from '../shared/schemas/index'

/** Minimal fully-valid project fixture; override fields per test. */
export function makeProject(overrides: Partial<Project> = {}): Record<string, unknown> {
  return {
    slug: 'fixture-project',
    name: 'Fixture Project',
    oneLiner: 'A schema-test fixture project.',
    status: 'Prototype',
    deployment: 'Local only',
    timeline: { start: '2026', end: null, label: '2026 — present' },
    pillars: ['ai-ml'],
    tags: ['Testing'],
    featured: false,
    enabled: true,
    demo: false,
    problem: 'A fixture problem statement.',
    targetUsers: 'Test authors.',
    whyItMatters: 'Schemas without tests drift.',
    exactRole: 'Fixture author.',
    teamContributions: 'None.',
    research: 'Read the schema.',
    validation: 'Parsed by zod.',
    proposedSolution: 'This object.',
    userWorkflow: ['Write fixture', 'Parse fixture'],
    systemArchitecture: 'One flat object.',
    methods: 'Plain data.',
    businessValue: 'None, it is a fixture.',
    contractsPolicy: 'MIT everything.',
    dataPrivacy: 'No personal data.',
    risks: ['The fixture rots'],
    humanApprovalPoints: ['Merging schema changes'],
    technicalDecisions: ['Keep it minimal'],
    completedWork: [
      { text: 'Wrote the fixture', evidence: 'Repository evidence', workState: 'Completed' }
    ],
    evidence: [{ text: 'It parses', evidence: 'Repository evidence' }],
    results: [{ text: 'Tests pass', evidence: 'Repository evidence' }],
    limitations: {
      constraints: ['It is fake'],
      tradeoffs: ['Minimalism over realism']
    },
    lessonsLearned: ['Fixtures should be tiny'],
    nextValidation: ['Run the suite'],
    publicLinks: [],
    ...overrides
  }
}
