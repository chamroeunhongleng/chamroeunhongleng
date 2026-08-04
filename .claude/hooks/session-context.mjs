#!/usr/bin/env node
/**
 * SessionStart context: prints the current portfolio mode and how much
 * owner content is still outstanding, so every session starts oriented.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const mode = process.env.NUXT_PUBLIC_PORTFOLIO_MODE ?? 'review (default)'

let markerCount = 0
let demoProjects = 0

function countMarkers(value) {
  if (typeof value === 'string') {
    markerCount += (value.match(/\[(DEMO|PLACEHOLDER|OWNER_INPUT_REQUIRED|REPLACE_BEFORE_PRODUCTION)/g) ?? []).length
  } else if (Array.isArray(value)) {
    value.forEach(countMarkers)
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(countMarkers)
  }
}

try {
  const contentDir = join(root, 'content')
  if (existsSync(contentDir)) {
    for (const file of readdirSync(contentDir).filter((f) => f.endsWith('.json'))) {
      countMarkers(JSON.parse(readFileSync(join(contentDir, file), 'utf8')))
    }
    const projectsDir = join(contentDir, 'projects')
    for (const file of readdirSync(projectsDir).filter((f) => f.endsWith('.json'))) {
      const project = JSON.parse(readFileSync(join(projectsDir, file), 'utf8'))
      countMarkers(project)
      if (project.demo && project.enabled !== false) demoProjects += 1
    }
  }
} catch {
  // Context is best-effort; never break session start.
}

console.log(
  `[portfolio] mode: ${mode} · ${markerCount} placeholder marker(s) outstanding · `
  + `${demoProjects} demo project(s) enabled. `
  + 'Read CLAUDE.md before editing; run `npm run verify` before calling anything release-ready. '
  + 'Owner answers belong in OWNER_INPUT.md → content/*.json.'
)
