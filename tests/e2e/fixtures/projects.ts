import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface ProjectFile {
  slug: string
  name: string
  oneLiner: string
  enabled: boolean
  demo?: boolean
  featured?: boolean
}

const dir = fileURLToPath(new URL('../../../content/projects', import.meta.url))

// Derived from the same directory nuxt.config.ts prerenders from, so a new project
// gains coverage automatically; `enabled` truthiness matches app/data/portfolio.ts.
const all: ProjectFile[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as ProjectFile)

export const publishedProjects = all.filter((p) => p.enabled)
export const unpublishedProjects = all.filter((p) => !p.enabled)

/** Escape a content string for use inside a RegExp (names contain "." and "—"). */
export function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
