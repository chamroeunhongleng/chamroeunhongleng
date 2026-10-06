import { z } from 'zod'
import {
  DEPLOYMENT_REALITIES,
  EVIDENCE_LABELS,
  HARD_EVIDENCE_LABELS,
  PILLARS,
  PROJECT_STATUSES
} from './enums.js'
import { claimSchema, hrefSchema, imageRefSchema, linkSchema, slugSchema } from './common.js'

/** A labeled table (model card, authority matrix, …) inside a case study. Every row carries its
 *  own evidence label, so a figure can be stated plainly without an unlabeled claim in prose. */
export const governanceArtifactSchema = z.strictObject({
  title: z.string().min(1),
  kind: z.enum(['model-card', 'authority-matrix', 'policy-control-map', 'business-model']),
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

/** The repo layout as data: `entries` is the tree in reading order, connectors are drawn at
 *  render time from `depth`, a name ending in "/" is a directory. One label covers the block. */
export const repoStructureSchema = z
  .strictObject({
    root: z.string().min(1),
    description: z.string().min(1),
    evidence: z.enum(EVIDENCE_LABELS),
    entries: z
      .array(
        z.strictObject({
          /** 0 = a direct child of the root. */
          depth: z.number().int().min(0).max(3),
          name: z.string().min(1),
          note: z.string().min(1).optional()
        })
      )
      .min(3)
      .max(80)
  })
  .superRefine((structure, ctx) => {
    // A depth jump of more than one level describes a child with no parent — a tree the renderer cannot draw.
    let previous = -1
    for (const [i, entry] of structure.entries.entries()) {
      if (entry.depth > previous + 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['entries', i, 'depth'],
          message: `"${entry.name}" sits at depth ${entry.depth} directly under a depth-${previous} row; a child must be exactly one level deeper than its parent.`
        })
      }
      previous = entry.depth
    }
  })
export type RepoStructure = z.infer<typeof repoStructureSchema>

/** The case-study schema: the 28 numbered fields of the portfolio spec plus honesty metadata. */
export const projectSchema = z
  .strictObject({
    // ── Identity & honesty metadata ────────────────────────────────────
    slug: slugSchema,
    /** 1. Project name */
    name: z.string().min(1),
    /** 2. One-sentence explanation */
    oneLiner: z.string().min(1).max(180),
    /** 50–170 chars is the check:seo window. Any metric must be copied verbatim from a labeled
     *  claim (a meta tag cannot show a label); deliberately not in PROJECT_PROSE_FIELDS. */
    seoDescription: z.string().min(50).max(170).optional(),
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
    /** Tie-breaker among projects equal on featured AND status — lower sorts first, otherwise
     *  alphabetical. Defaults to 0 so an unset project keeps its alphabetical place. */
    order: z.number().int().default(0),
    /** Homepage flagship — at most one enabled project carries this (check-content enforces). */
    flagship: z.boolean().default(false),
    /** Disabled projects are excluded from routes and listings. */
    enabled: z.boolean(),
    /** Demonstration project — allowed in demo/review, fatal in production. */
    demo: z.boolean(),
    question: z.string().optional(),
    cover: imageRefSchema.optional(),
    /** Shown beside the case-study header; its caption says what the photo is, not what it proves. */
    portrait: imageRefSchema.optional(),
    /** Captions carry the same honesty duty as prose: describe the photo, claim nothing beyond it. */
    gallery: z.array(imageRefSchema).min(1).max(4).optional(),

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
    artifact: governanceArtifactSchema.optional(),
    repoStructure: repoStructureSchema.optional(),
    aiAssistance: z
      .strictObject({
        scope: z.string().min(1),
        humanOwned: z.string().min(1)
      })
      .optional(),
    primaryLink: hrefSchema.optional()
  })
  .superRefine((p, ctx) => {
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
    if (p.demo && p.deployment === 'Deployed') {
      ctx.addIssue({
        code: 'custom',
        path: ['deployment'],
        message: 'A demo project cannot claim Deployed deployment reality.'
      })
    }
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
