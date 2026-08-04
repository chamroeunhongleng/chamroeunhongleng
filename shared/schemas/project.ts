import { z } from 'zod'
import {
  DEPLOYMENT_REALITIES,
  EVIDENCE_LABELS,
  HARD_EVIDENCE_LABELS,
  PILLARS,
  PROJECT_STATUSES
} from './enums'
import { claimSchema, hrefSchema, imageRefSchema, linkSchema, slugSchema } from './common'

/**
 * Governance artifact rendered inside a case study — a model card,
 * authority matrix, or policy control map presented as a labeled table.
 * Publishing the artifact IS the governance evidence.
 */
export const governanceArtifactSchema = z.strictObject({
  title: z.string().min(1),
  kind: z.enum(['model-card', 'authority-matrix', 'policy-control-map']),
  description: z.string().min(1),
  rows: z
    .array(
      z.strictObject({
        label: z.string().min(1),
        value: z.string().min(1),
        evidence: z.enum(EVIDENCE_LABELS)
      })
    )
    .min(3)
})
export type GovernanceArtifact = z.infer<typeof governanceArtifactSchema>

/**
 * The full case-study schema — all 28 required fields from the portfolio
 * spec, plus honesty metadata (status vs. deployment as separate axes,
 * demo flag, evidence-labeled claims).
 */
export const projectSchema = z
  .strictObject({
    // ── Identity & honesty metadata ────────────────────────────────────
    slug: slugSchema,
    /** 1. Project name */
    name: z.string().min(1),
    /** 2. One-sentence explanation */
    oneLiner: z.string().min(1).max(180),
    /** 3. Lifecycle status */
    status: z.enum(PROJECT_STATUSES),
    /** Deployment reality — separate axis from status. */
    deployment: z.enum(DEPLOYMENT_REALITIES),
    /** 4. Timeline */
    timeline: z.strictObject({
      start: z.string().min(1),
      end: z.string().nullable(),
      label: z.string().min(1)
    }),
    pillars: z.array(z.enum(PILLARS)).min(1),
    tags: z.array(z.string().min(1)).min(1).max(10),
    featured: z.boolean(),
    /** Disabled projects are excluded from routes and listings. */
    enabled: z.boolean(),
    /** Demonstration project — allowed in demo/review, fatal in production. */
    demo: z.boolean(),
    /** Optional falsifiable question the project tests. */
    question: z.string().optional(),
    cover: imageRefSchema.optional(),

    // ── Story ──────────────────────────────────────────────────────────
    /** 5. Problem */
    problem: z.string().min(1),
    /** 6. Target users */
    targetUsers: z.string().min(1),
    /** 7. Why the problem matters */
    whyItMatters: z.string().min(1),
    /** 8. My exact role */
    exactRole: z.string().min(1),
    /** 9. Team contributions (kept separate from personal role) */
    teamContributions: z.string().min(1),
    /** 10. Research */
    research: z.string().min(1),
    /** 11. Validation */
    validation: z.string().min(1),
    /** 12. Proposed solution */
    proposedSolution: z.string().min(1),
    /** 13. User workflow, as ordered steps */
    userWorkflow: z.array(z.string().min(1)).min(2),
    /** 14. System architecture */
    systemArchitecture: z.string().min(1),
    /** 15. AI or software methods */
    methods: z.string().min(1),
    /** 16. Business value */
    businessValue: z.string().min(1),
    /** 17. Contracts or policy considerations */
    contractsPolicy: z.string().min(1),
    /** 18. Data and privacy considerations */
    dataPrivacy: z.string().min(1),
    /** 19. Risks */
    risks: z.array(z.string().min(1)).min(1),
    /** 20. Human approval points */
    humanApprovalPoints: z.array(z.string().min(1)).min(1),
    /** 21. Technical decisions */
    technicalDecisions: z.array(z.string().min(1)).min(1),
    /** 22. Completed work — claims with work states */
    completedWork: z
      .array(claimSchema.extend({ workState: claimSchema.shape.workState.unwrap() }))
      .min(1),
    /** 23. Evidence — labeled claims, the case study's receipts */
    evidence: z.array(claimSchema).min(1),
    /** 24. Results — labeled claims */
    results: z.array(claimSchema).min(1),
    /** 25. Limitations, split into imposed constraints vs. chosen tradeoffs */
    limitations: z.strictObject({
      constraints: z.array(z.string().min(1)).min(1),
      tradeoffs: z.array(z.string().min(1)).min(1)
    }),
    /** 26. Lessons learned */
    lessonsLearned: z.array(z.string().min(1)).min(1),
    /** 27. Next validation */
    nextValidation: z.array(z.string().min(1)).min(1),
    /** 28. Public links — artifact link strip */
    publicLinks: z.array(linkSchema),

    // ── Transparency extras ────────────────────────────────────────────
    /** Optional governance artifact (model card, authority matrix, …). */
    artifact: governanceArtifactSchema.optional(),
    /** AI-assistance provenance, rendered in the case-study facts block. */
    aiAssistance: z
      .strictObject({
        scope: z.string().min(1),
        humanOwned: z.string().min(1)
      })
      .optional(),
    /** Optional primary external link (used as the card's main receipt). */
    primaryLink: hrefSchema.optional()
  })
  .superRefine((p, ctx) => {
    // Status honesty: Production is a hard claim.
    if (p.status === 'Production') {
      if (p.demo) {
        ctx.addIssue({
          code: 'custom',
          path: ['status'],
          message: 'A demo project can never have Production status.'
        })
      }
      if (p.deployment !== 'Deployed') {
        ctx.addIssue({
          code: 'custom',
          path: ['deployment'],
          message: 'Production status requires Deployed deployment reality.'
        })
      }
      const hard = new Set<string>(HARD_EVIDENCE_LABELS)
      if (!p.results.some((r) => hard.has(r.evidence))) {
        ctx.addIssue({
          code: 'custom',
          path: ['results'],
          message:
            'Production status requires at least one result backed by Owner confirmed, Public, Repository, or Document evidence.'
        })
      }
    }
    // Demo honesty: demo work is never "Deployed".
    if (p.demo && p.deployment === 'Deployed') {
      ctx.addIssue({
        code: 'custom',
        path: ['deployment'],
        message: 'A demo project cannot claim Deployed deployment reality.'
      })
    }
    // Early lifecycle stages cannot claim deployment.
    const earlyStages = new Set(['Idea', 'Research', 'Experiment'])
    if (earlyStages.has(p.status) && p.deployment === 'Deployed') {
      ctx.addIssue({
        code: 'custom',
        path: ['deployment'],
        message: `${p.status} work cannot be labeled Deployed.`
      })
    }
  })

export type Project = z.infer<typeof projectSchema>
