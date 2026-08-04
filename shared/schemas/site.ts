import { z } from 'zod'
import { EVIDENCE_LABELS, PILLARS, WORK_STATES } from './enums'
import { claimSchema, linkSchema, slugSchema } from './common'

// ── profile.json ─────────────────────────────────────────────────────────
export const profileSchema = z.strictObject({
  name: z.string().min(1),
  monogram: z.string().min(1).max(3),
  preferredName: z.string().min(1),
  /** Short hero statement. */
  headline: z.string().min(1),
  /** Current identity line (degree as clause, not headline). */
  identity: z.string().min(1),
  /** Core homepage introduction — meaning is owner-approved verbatim. */
  intro: z.array(z.string().min(1)).min(1),
  location: z.strictObject({
    text: z.string().min(1),
    evidence: z.enum(EVIDENCE_LABELS)
  }),
  availability: z.string().min(1),
  links: z.array(linkSchema).min(1),
  /** Selected evidence strip on the homepage. */
  proofPoints: z.array(claimSchema).min(3),
  /** One-line AI-native working-style statement. */
  aiWorkingStyle: z.string().min(1)
})
export type Profile = z.infer<typeof profileSchema>

// ── education.json ───────────────────────────────────────────────────────
export const educationSchema = z.strictObject({
  summary: z.string().min(1),
  entries: z
    .array(
      z.strictObject({
        institution: z.string().min(1),
        program: z.string().min(1),
        credential: z.string().min(1),
        period: z.string().min(1),
        status: z.enum(['In progress', 'Completed', 'Planned', 'Paused']),
        evidence: z.enum(EVIDENCE_LABELS),
        notes: z.string().optional()
      })
    )
    .min(1)
})
export type Education = z.infer<typeof educationSchema>

// ── interests.json (the four pillars) ────────────────────────────────────
export const interestsSchema = z.strictObject({
  pillars: z
    .array(
      z.strictObject({
        id: z.enum(PILLARS),
        number: z.string().regex(/^0[1-4]$/),
        title: z.string().min(1),
        summary: z.string().min(1),
        topics: z.array(z.string().min(1)).min(3),
        /** What real study or work grounds this pillar. */
        groundedIn: z.string().min(1),
        projects: z.array(slugSchema)
      })
    )
    .length(4),
  /** The connective narrative — why these are one system, not four interests. */
  connection: z.string().min(1)
})
export type Interests = z.infer<typeof interestsSchema>

// ── experience.json ──────────────────────────────────────────────────────
export const experienceEntrySchema = z.strictObject({
  organization: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  current: z.boolean(),
  summary: z.string().min(1),
  contributions: z.array(claimSchema),
  links: z.array(linkSchema).optional()
})
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>

export const experienceSchema = z.strictObject({
  groups: z
    .array(
      z.strictObject({
        id: z.string().min(1),
        title: z.string().min(1),
        /** Layout hint: timeline (roles), rows (competitions), cards (community). */
        layout: z.enum(['timeline', 'rows', 'cards']),
        entries: z.array(experienceEntrySchema).min(1)
      })
    )
    .min(1)
})
export type Experience = z.infer<typeof experienceSchema>

// ── learning.json ────────────────────────────────────────────────────────
export const learningSchema = z.strictObject({
  intro: z.string().min(1),
  disciplines: z
    .array(
      z.strictObject({
        pillar: z.enum(PILLARS),
        title: z.string().min(1),
        stance: z.string().min(1),
        currentFocus: z.array(z.string().min(1)).min(1)
      })
    )
    .length(4),
  readingNotes: z.array(
    z.strictObject({
      title: z.string().min(1),
      source: z.string().min(1),
      takeaway: z.string().min(1)
    })
  ),
  experiments: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        question: z.string().min(1),
        state: z.enum(WORK_STATES),
        projectSlug: slugSchema.optional()
      })
    )
    .min(1),
  roadmap: z
    .array(
      z.strictObject({
        horizon: z.enum(['Now', 'Next', 'Later']),
        items: z.array(claimSchema).min(1)
      })
    )
    .length(3)
})
export type Learning = z.infer<typeof learningSchema>

// ── principles.json ──────────────────────────────────────────────────────
export const principlesSchema = z.strictObject({
  principles: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        text: z.string().min(1)
      })
    )
    .min(3)
})
export type Principles = z.infer<typeof principlesSchema>

// ── contact.json ─────────────────────────────────────────────────────────
export const contactSchema = z.strictObject({
  /** May carry an [OWNER_INPUT_REQUIRED:] marker until the owner approves a public address. */
  email: z.string().min(1),
  location: z.string().min(1),
  responseExpectation: z.string().min(1),
  inquiryTypes: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        description: z.string().min(1),
        subject: z.string().min(1)
      })
    )
    .min(2),
  boundaries: z.strictObject({
    seeking: z.array(z.string().min(1)).min(1),
    notSeeking: z.array(z.string().min(1)).min(1)
  }),
  socials: z.array(linkSchema).min(1)
})
export type Contact = z.infer<typeof contactSchema>

// ── process.json (idea → production) ─────────────────────────────────────
export const processSchema = z.strictObject({
  intro: z.string().min(1),
  stages: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        description: z.string().min(1),
        humanGate: z.boolean()
      })
    )
    .min(10),
  /** Decisions that always remain with humans. */
  humanControls: z.array(z.string().min(1)).min(5),
  aiSupport: z.string().min(1)
})
export type Process = z.infer<typeof processSchema>

// ── now.json (current focus feed) ────────────────────────────────────────
export const nowSchema = z.strictObject({
  intro: z.string().min(1),
  entries: z
    .array(
      z.strictObject({
        date: z.string().regex(/^\d{4}-\d{2}$/, 'date must be YYYY-MM'),
        text: z.string().min(1),
        evidence: z.enum(EVIDENCE_LABELS)
      })
    )
    .min(2)
})
export type Now = z.infer<typeof nowSchema>

// ── colophon.json ────────────────────────────────────────────────────────
export const colophonSchema = z.strictObject({
  intro: z.string().min(1),
  aiPolicy: z.strictObject({
    rule: z.string().min(1),
    humanOwned: z.array(z.string().min(1)).min(3),
    aiAssisted: z.array(z.string().min(1)).min(3)
  }),
  howBuilt: z.array(z.string().min(1)).min(3),
  provenance: z.array(claimSchema).min(1),
  noteForAgents: z.string().min(1)
})
export type Colophon = z.infer<typeof colophonSchema>
