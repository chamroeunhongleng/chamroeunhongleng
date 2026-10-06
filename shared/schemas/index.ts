import type { z } from 'zod'
import {
  colophonSchema,
  contactSchema,
  contributionsSchema,
  educationSchema,
  experienceSchema,
  interestsSchema,
  learningSchema,
  nowSchema,
  principlesSchema,
  processSchema,
  profileSchema,
  stackSchema
} from './site.js'
import { projectSchema } from './project.js'

export * from './enums.js'
export * from './common.js'
export * from './project.js'
export * from './site.js'

/** The single file → schema map that the app loader, check-content, the build gate and the tests
 *  all iterate, so validation cannot disagree with what the app loads. Never regex source text. */
export const contentManifest = [
  { file: 'profile.json', key: 'profile', schema: profileSchema },
  { file: 'education.json', key: 'education', schema: educationSchema },
  { file: 'interests.json', key: 'interests', schema: interestsSchema },
  { file: 'experience.json', key: 'experience', schema: experienceSchema },
  { file: 'learning.json', key: 'learning', schema: learningSchema },
  { file: 'principles.json', key: 'principles', schema: principlesSchema },
  { file: 'contact.json', key: 'contact', schema: contactSchema },
  { file: 'process.json', key: 'process', schema: processSchema },
  { file: 'now.json', key: 'now', schema: nowSchema },
  { file: 'colophon.json', key: 'colophon', schema: colophonSchema },
  { file: 'stack.json', key: 'stack', schema: stackSchema },
  { file: 'contributions.json', key: 'contributions', schema: contributionsSchema }
] as const

export const projectsDirectory = { dir: 'projects', schema: projectSchema } as const

export interface ContentBundle {
  profile: z.infer<typeof profileSchema>
  education: z.infer<typeof educationSchema>
  interests: z.infer<typeof interestsSchema>
  experience: z.infer<typeof experienceSchema>
  learning: z.infer<typeof learningSchema>
  principles: z.infer<typeof principlesSchema>
  contact: z.infer<typeof contactSchema>
  process: z.infer<typeof processSchema>
  now: z.infer<typeof nowSchema>
  colophon: z.infer<typeof colophonSchema>
  stack: z.infer<typeof stackSchema>
  contributions: z.infer<typeof contributionsSchema>
  projects: Array<z.infer<typeof projectSchema>>
}
