import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contentDir, loadContent } from '../scripts/lib/load-content'

const { bundle } = loadContent()

describe('shipped content invariants', () => {
  it('every project file slug matches its filename', () => {
    const files = readdirSync(join(contentDir, 'projects')).filter((f) => f.endsWith('.json'))
    const slugs = new Set(bundle!.projects.map((p) => p.slug))
    for (const file of files) {
      expect(slugs.has(file.replace(/\.json$/, ''))).toBe(true)
    }
  })

  it('no shipped project claims Production status', () => {
    for (const project of bundle!.projects) {
      expect(project.status).not.toBe('Production')
    }
  })

  it('demonstration projects are flagged demo and carry Demo only evidence', () => {
    const demos = bundle!.projects.filter((p) => p.demo)
    expect(demos.length).toBeGreaterThan(0)
    for (const demo of demos) {
      expect(demo.evidence.some((c) => c.evidence === 'Demo only')).toBe(true)
    }
  })

  it('every enabled project carries labeled evidence and results', () => {
    for (const project of bundle!.projects.filter((p) => p.enabled)) {
      expect(project.evidence.length).toBeGreaterThan(0)
      expect(project.results.length).toBeGreaterThan(0)
    }
  })

  it('real projects with self-reported metrics say so in the claim text', () => {
    const kaskor = bundle!.projects.find((p) => p.slug === 'kaskor-asr')!
    const metricClaim = kaskor.results.find((r) => r.text.includes('17.48'))
    expect(metricClaim).toBeDefined()
    expect(metricClaim!.text.toLowerCase()).toContain('self-report')
  })

  it('the featured set includes at least one non-demo project', () => {
    expect(bundle!.projects.some((p) => p.featured && !p.demo && p.enabled)).toBe(true)
  })
})
