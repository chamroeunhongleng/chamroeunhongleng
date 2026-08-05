import { readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { ZodType } from 'zod'
import {
  contentManifest,
  projectSchema,
  type ContentBundle,
  type Project
} from '../../shared/schemas/index.js'

// npm scripts and vitest both execute with the repo root as cwd; vitest's
// module transform makes import.meta.url unreliable here, so cwd it is.
export const repoRoot = process.cwd()
export const contentDir = join(repoRoot, 'content')

export interface LoadIssue {
  file: string
  message: string
}

export interface LoadResult {
  bundle: ContentBundle | null
  issues: LoadIssue[]
}

function parseFile<T>(file: string, schema: ZodType<T>, issues: LoadIssue[]): T | null {
  let raw: string
  try {
    raw = readFileSync(join(contentDir, file), 'utf8')
  } catch {
    issues.push({ file, message: 'File is missing.' })
    return null
  }
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (error) {
    issues.push({ file, message: `Invalid JSON: ${(error as Error).message}` })
    return null
  }
  const result = schema.safeParse(json)
  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({ file, message: `${issue.path.join('.') || '(root)'}: ${issue.message}` })
    }
    return null
  }
  return result.data
}

/**
 * Load and zod-validate the entire content directory via the shared
 * manifest — the same schemas the app imports. Never regex over source.
 */
export function loadContent(): LoadResult {
  const issues: LoadIssue[] = []
  const sections: Record<string, unknown> = {}

  for (const entry of contentManifest) {
    const value = parseFile(entry.file, entry.schema as ZodType<unknown>, issues)
    if (value !== null) sections[entry.key] = value
  }

  const projects: Project[] = []
  const projectFiles = readdirSync(join(contentDir, 'projects')).filter((f) =>
    f.endsWith('.json')
  )
  for (const file of projectFiles) {
    const project = parseFile(join('projects', file), projectSchema, issues)
    if (project) {
      const expectedSlug = basename(file, '.json')
      if (project.slug !== expectedSlug) {
        issues.push({
          file: `projects/${file}`,
          message: `slug "${project.slug}" must equal the filename "${expectedSlug}" (prerender routes derive from it).`
        })
      }
      projects.push(project)
    }
  }

  if (issues.length > 0) return { bundle: null, issues }

  const bundle = { ...sections, projects } as unknown as ContentBundle
  return { bundle, issues }
}

export function printIssues(issues: LoadIssue[]): void {
  for (const issue of issues) {
    console.error(`  ERROR ${issue.file} — ${issue.message}`)
  }
}
