import { z } from 'zod'
import { EVIDENCE_LABELS, WORK_STATES } from './enums'

/**
 * Allowed link targets: absolute https, mailto, or root-relative internal
 * paths. Anything else (http, example.com, '#', empty) is caught by the
 * content rule engine with mode-dependent severity.
 */
export const hrefSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith('https://') || v.startsWith('mailto:') || v.startsWith('/'),
    { message: 'href must be https://, mailto:, or a root-relative path' }
  )

export const linkSchema = z.strictObject({
  label: z.string().min(1),
  url: hrefSchema,
  /** What kind of receipt this is, shown on artifact link strips. */
  kind: z
    .enum(['repository', 'demo', 'docs', 'dataset', 'website', 'profile', 'other'])
    .default('other'),
  evidence: z.enum(EVIDENCE_LABELS).default('Public evidence')
})
export type Link = z.infer<typeof linkSchema>

/**
 * A Claim is the only way important statements enter the site. The evidence
 * label is REQUIRED at the schema level, so "claim without an evidence label"
 * is a parse error, not a style problem.
 */
export const claimSchema = z.strictObject({
  text: z.string().min(1),
  evidence: z.enum(EVIDENCE_LABELS),
  /** Optional receipt backing the claim. */
  link: hrefSchema.optional(),
  /** Optional work-state for execution items (Completed, Planned, …). */
  workState: z.enum(WORK_STATES).optional()
})
export type Claim = z.infer<typeof claimSchema>

export const imageRefSchema = z.strictObject({
  src: z.string().min(1),
  alt: z.string().min(3),
  caption: z.string().optional(),
  /** Demo images are fatal in production mode. */
  demo: z.boolean().default(false)
})
export type ImageRef = z.infer<typeof imageRefSchema>

/** Shared slug rule: lowercase kebab, must equal the content filename. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case')
