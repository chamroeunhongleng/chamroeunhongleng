// Every JSON file is parsed against the shared schemas here, so invalid content fails `nuxt generate`.
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
  projectSchema,
  stackSchema,
  type Project,
  type ProjectStatus
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
import stackJson from '~~/content/stack.json'
import contributionsJson from '~~/content/contributions.json'

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
export const stack = stackSchema.parse(stackJson)
export const contributions = contributionsSchema.parse(contributionsJson)

const projectModules = import.meta.glob('../../content/projects/*.json', {
  eager: true,
  import: 'default'
})

// Keyed by the vocabulary type so a renamed or added status is a compile error here.
const STATUS_RANK: Record<ProjectStatus, number> = {
  'Production': 0,
  'Pilot': 1,
  'Public demo': 2,
  'Pre-pilot': 3,
  'Prototype': 4,
  'Experiment': 5,
  'Research': 6,
  'Idea': 7,
  'Paused': 8,
  'Archived': 9
}

export const projects: Project[] = Object.values(projectModules)
  .map((raw) => projectSchema.parse(raw))
  .filter((p) => p.enabled)
  .sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const statusDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status]
    if (statusDiff !== 0) return statusDiff
    if (a.order !== b.order) return a.order - b.order
    return a.name.localeCompare(b.name)
  })

export const featuredProjects = projects.filter((p) => p.featured)

const stackIconByName = new Map(
  stack.groups
    .flatMap((group) => group.items)
    .flatMap((item) => (item.icon ? [[item.name.toLowerCase(), item.icon] as const] : []))
)

export function tagItemsFor(project: Project): Array<{ name: string; icon?: string }> {
  return project.tags.map((name) => ({ name, icon: stackIconByName.get(name.toLowerCase()) }))
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function projectsForPillar(pillarId: string): Project[] {
  return projects.filter((p) => (p.pillars as string[]).includes(pillarId))
}
