import '../zod-config.js'
import { z } from 'zod'
import { EVIDENCE_LABELS, WORK_STATES } from './enums.js'

/** Placeholder links (example.com, '#', http) pass here; shared/rules.ts flags them with mode-dependent severity. */
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
  kind: z
    .enum(['repository', 'demo', 'docs', 'dataset', 'website', 'profile', 'other'])
    .default('other'),
  evidence: z.enum(EVIDENCE_LABELS).default('Public evidence')
})
export type Link = z.infer<typeof linkSchema>

/** The only way important statements enter the site. The evidence label is required at the
 *  schema level, so a claim without one is a parse error, not a style problem. */
export const claimSchema = z.strictObject({
  text: z.string().min(1),
  evidence: z.enum(EVIDENCE_LABELS),
  link: hrefSchema.optional(),
  workState: z.enum(WORK_STATES).optional()
})
export type Claim = z.infer<typeof claimSchema>

export const imageRefSchema = z.strictObject({
  src: z.string().min(1),
  alt: z.string().min(3),
  caption: z.string().optional(),
  /** Rendered as the img width/height attributes so the browser reserves the box before the file loads. */
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** Demo images are fatal in production mode. */
  demo: z.boolean().default(false)
})
export type ImageRef = z.infer<typeof imageRefSchema>

/** Shared slug rule: lowercase kebab, must equal the content filename. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case')
