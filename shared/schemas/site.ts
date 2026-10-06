import { z } from 'zod'
import { EVIDENCE_LABELS, PILLARS, WORK_STATES } from './enums.js'
import { claimSchema, hrefSchema, imageRefSchema, linkSchema, slugSchema } from './common.js'

// ── shared shapes ────────────────────────────────────────────────────────
/** One result as a scannable "award — event" line for /journey. The evidence label is data on
 *  every line; the UI stamps it only when a public link backs it (same as the education card). */
export const resultLineSchema = z.strictObject({
  /** The outcome, e.g. "Gold Medal", "No. 1", "Top 2". */
  award: z.string().min(1),
  /** The competition, examination, or context the outcome comes from. */
  event: z.string().min(1),
  evidence: z.enum(EVIDENCE_LABELS),
  link: hrefSchema.optional()
})
export type ResultLine = z.infer<typeof resultLineSchema>

// ── profile.json ─────────────────────────────────────────────────────────
export const profileSchema = z.strictObject({
  name: z.string().min(1),
  monogram: z.string().min(1).max(3),
  preferredName: z.string().min(1),
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
  /** Feeds the chat assistant only, not a homepage section: the hero numbers strip that showed
   *  these was removed at the owner's request and must not come back. */
  proofPoints: z.array(claimSchema).min(3),
  aiWorkingStyle: z.string().min(1),
  /** check:links fails the build if the referenced file is missing, so the link never ships before the PDF. */
  cv: z.strictObject({ label: z.string().min(1), url: hrefSchema }).optional(),
  photo: imageRefSchema.optional()
})
export type Profile = z.infer<typeof profileSchema>

// ── education.json ───────────────────────────────────────────────────────
export const educationSchema = z.strictObject({
  summary: z.string().min(1),
  entries: z
    .array(
      z.strictObject({
        institution: z.string().min(1),
        /** Field of study; rendered as "<credential> in <program>". */
        program: z.string().min(1),
        /** Degree type spelled out formally, e.g. "Bachelor of Science". */
        credential: z.string().min(1),
        specialization: z.string().min(1).optional(),
        scholarship: z.string().min(1).optional(),
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
        groundedIn: z.string().min(1),
        projects: z.array(slugSchema)
      })
    )
    .length(4),
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
  results: z.array(resultLineSchema).optional(),
  links: z.array(linkSchema).optional(),
  image: imageRefSchema.optional()
})
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>

export const experienceSchema = z.strictObject({
  /** Personal motivation, so plain prose rather than labeled Claims. Told as short steps so
   *  /journey can set them side by side; the first step's text is the homepage pull-quote. */
  story: z
    .strictObject({
      title: z.string().min(1),
      steps: z
        .array(z.strictObject({ title: z.string().min(1), text: z.string().min(1) }))
        .min(1)
    })
    .optional(),
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
  readingMethod: z.string().min(1).optional(),
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

// ── stack.json (the technologies named on the homepage) ──────────────────
/** Every item must trace to real work: the tags of an enabled case study (shared/rules.ts checks
 *  the name IS one of them) or the Skills list on the About page (`source: 'skills'`). */
export const stackItemSchema = z.strictObject({
  name: z.string().min(1),
  /** Simple Icons slug, resolved by app/data/tech-icons.ts. Omit when no mark exists. */
  icon: z
    .string()
    .regex(/^[a-z0-9]+$/, 'icon must be a Simple Icons slug')
    .optional(),
  projects: z.array(slugSchema).default([]),
  source: z.enum(['projects', 'skills']).default('projects')
})
export type StackItem = z.infer<typeof stackItemSchema>

export const stackSchema = z.strictObject({
  intro: z.string().min(1),
  groups: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        title: z.string().min(1),
        items: z.array(stackItemSchema).min(3)
      })
    )
    .min(1)
    .max(4)
})
export type Stack = z.infer<typeof stackSchema>

// ── contributions.json ("What I can contribute") ─────────────────────────
/** One source for the homepage, /about and the chat assistant, instead of template prose mirrored by hand. */
export const contributionsSchema = z.strictObject({
  intro: z.string().min(1),
  items: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        text: z.string().min(1),
        evidence: z.enum(EVIDENCE_LABELS),
        link: hrefSchema.optional()
      })
    )
    .min(4)
    .max(6)
})
export type Contributions = z.infer<typeof contributionsSchema>
