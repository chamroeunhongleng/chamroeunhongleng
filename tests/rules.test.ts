import { describe, expect, it } from 'vitest'
import { loadContent } from '../scripts/lib/load-content'
import { runContentRules, worstSeverity } from '../shared/rules'
import { projectSchema, type ContentBundle } from '../shared/schemas/index'
import { makeProject } from './fixtures'

const { bundle, issues } = loadContent()

describe('real content through the rule engine', () => {
  it('loads without schema issues', () => {
    expect(issues).toEqual([])
    expect(bundle).not.toBeNull()
  })

  it('demo mode: only informational findings', () => {
    const findings = runContentRules(bundle as ContentBundle, 'demo')
    expect(findings.filter((f) => f.severity === 'error')).toEqual([])
    expect(findings.filter((f) => f.severity === 'warning')).toEqual([])
  })

  it('review mode: warnings for placeholders, no errors', () => {
    const findings = runContentRules(bundle as ContentBundle, 'review')
    expect(findings.filter((f) => f.severity === 'error')).toEqual([])
    expect(findings.some((f) => f.code === 'marker-owner-input-required')).toBe(true)
    expect(findings.some((f) => f.code === 'demo-project-enabled')).toBe(true)
  })

  it('production mode: gate fails while placeholders and demo content remain', () => {
    const findings = runContentRules(bundle as ContentBundle, 'production')
    expect(worstSeverity(findings)).toBe('error')
    const codes = new Set(findings.filter((f) => f.severity === 'error').map((f) => f.code))
    expect(codes.has('marker-owner-input-required')).toBe(true)
    expect(codes.has('demo-project-enabled')).toBe(true)
    expect(codes.has('contact-email-missing')).toBe(true)
  })
})

describe('individual rules on synthetic content', () => {
  function bundleWith(projectOverrides: Partial<Record<string, unknown>>): ContentBundle {
    const project = projectSchema.parse(makeProject(projectOverrides as never))
    return {
      ...(bundle as ContentBundle),
      projects: [{ ...project, featured: true }]
    }
  }

  it('flags placeholder links as production errors', () => {
    const b = bundleWith({
      publicLinks: [
        { label: 'Todo', url: 'https://example.com/todo', kind: 'website', evidence: 'Planned' }
      ]
    })
    const findings = runContentRules(b, 'production')
    expect(findings.some((f) => f.code === 'placeholder-link' && f.severity === 'error')).toBe(true)
  })

  it('flags achievement numbers in prose fields', () => {
    const b = bundleWith({
      businessValue: 'Already serving 5,000 users with 40% growth.'
    })
    const findings = runContentRules(b, 'production')
    expect(
      findings.some((f) => f.code === 'numeric-claim-in-prose' && f.severity === 'error')
    ).toBe(true)
  })

  it('does not flag technical parameters like 16 kHz', () => {
    const b = bundleWith({
      systemArchitecture: 'Audio is resampled to 16 kHz before feature extraction.'
    })
    const findings = runContentRules(b, 'production')
    expect(findings.some((f) => f.code === 'numeric-claim-in-prose')).toBe(false)
  })

  it('errors when a pillar references a missing project', () => {
    const b = bundleWith({})
    const broken: ContentBundle = {
      ...b,
      interests: {
        ...b.interests,
        pillars: b.interests.pillars.map((p, i) =>
          i === 0 ? { ...p, projects: ['ghost-project'] } : { ...p, projects: [] }
        ) as ContentBundle['interests']['pillars']
      },
      learning: {
        ...b.learning,
        experiments: b.learning.experiments.map((e) => ({ ...e, projectSlug: undefined }))
      }
    }
    const findings = runContentRules(broken, 'review')
    expect(findings.some((f) => f.code === 'broken-project-reference')).toBe(true)
  })

  it('errors when no enabled project is featured', () => {
    const project = projectSchema.parse(makeProject({ featured: false } as never))
    const b: ContentBundle = { ...(bundle as ContentBundle), projects: [project] }
    const findings = runContentRules(b, 'review')
    expect(findings.some((f) => f.code === 'no-featured-project')).toBe(true)
  })
})
