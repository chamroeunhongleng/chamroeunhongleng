/**
 * The app-side content loader. Every JSON file is validated against the
 * shared zod schemas at build time — invalid content fails `nuxt generate`
 * in any mode. (Mode-dependent rules run separately in the content gate.)
 */
import {
  colophonSchema,
  contactSchema,
  educationSchema,
  experienceSchema,
  interestsSchema,
  learningSchema,
  nowSchema,
  principlesSchema,
  processSchema,
  profileSchema,
  projectSchema,
  type Project
} from '~~/shared/schemas/index'

import profileJson from '~~/content/profile.json'
import educationJson from '~~/content/education.json'
import interestsJson from '~~/content/interests.json'
import experienceJson from '~~/content/experience.json'
import learningJson from '~~/content/learning.json'
import principlesJson from '~~/content/principles.json'
import contactJson from '~~/content/contact.json'
import processJson from '~~/content/process.json'
import nowJson from '~~/content/now.json'
import colophonJson from '~~/content/colophon.json'

export const profile = profileSchema.parse(profileJson)
export const education = educationSchema.parse(educationJson)
export const interests = interestsSchema.parse(interestsJson)
export const experience = experienceSchema.parse(experienceJson)
export const learning = learningSchema.parse(learningJson)
export const principles = principlesSchema.parse(principlesJson)
export const contact = contactSchema.parse(contactJson)
// Named processContent (not `process`) — a top-level `process` export
// collides with Node's global in the server prerender bundle.
export const processContent = processSchema.parse(processJson)
export const now = nowSchema.parse(nowJson)
export const colophon = colophonSchema.parse(colophonJson)

const projectModules = import.meta.glob('../../content/projects/*.json', {
  eager: true,
  import: 'default'
})

const STATUS_ORDER = [
  'Production',
  'Pilot',
  'Public demo',
  'Pre-pilot',
  'Prototype',
  'Experiment',
  'Research',
  'Idea',
  'Paused',
  'Archived'
]

export const projects: Project[] = Object.values(projectModules)
  .map((raw) => projectSchema.parse(raw))
  .filter((p) => p.enabled)
  .sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    if (statusDiff !== 0) return statusDiff
    return a.name.localeCompare(b.name)
  })

export const featuredProjects = projects.filter((p) => p.featured)

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function projectsForPillar(pillarId: string): Project[] {
  return projects.filter((p) => (p.pillars as string[]).includes(pillarId))
}
