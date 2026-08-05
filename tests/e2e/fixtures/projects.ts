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

/**
 * Rule 4 (CLAUDE.md): never hardcode a project route list. These derive from
 * the same directory `nuxt.config.ts` builds its prerender routes from, so a
 * new project JSON file gains E2E coverage automatically — and a project that
 * is switched off is automatically asserted to be unreachable.
 *
 * The published set uses `enabled` truthiness to match the runtime loader in
 * app/data/portfolio.ts, which is what decides whether a page renders at all.
 */
const all: ProjectFile[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as ProjectFile)

export const publishedProjects = all.filter((p) => p.enabled)
export const unpublishedProjects = all.filter((p) => !p.enabled)

/** Escape a content string for use inside a RegExp (names contain "." and "—"). */
export function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
