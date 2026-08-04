import { describe, expect, it } from 'vitest'
import { projectSchema } from '../shared/schemas/index'
import { makeProject } from './fixtures'

describe('projectSchema', () => {
  it('accepts a minimal valid project', () => {
    expect(projectSchema.safeParse(makeProject()).success).toBe(true)
  })

  it('rejects a claim without an evidence label', () => {
    const bad = makeProject({
      evidence: [{ text: 'No label here' }] as never
    })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects unknown status values', () => {
    const bad = makeProject({ status: 'Shipped' as never })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects Production status on a demo project', () => {
    const bad = makeProject({
      demo: true,
      status: 'Production' as never,
      deployment: 'Public demo' as never
    })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects Production status without Deployed reality', () => {
    const bad = makeProject({ status: 'Production' as never, deployment: 'Local only' as never })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects Production status without hard evidence in results', () => {
    const bad = makeProject({
      status: 'Production' as never,
      deployment: 'Deployed' as never,
      results: [{ text: 'Sounds great', evidence: 'Unverified' }] as never
    })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('accepts Production only with Deployed + hard evidence', () => {
    const good = makeProject({
      status: 'Production' as never,
      deployment: 'Deployed' as never,
      results: [
        { text: 'Live and verified', evidence: 'Public evidence', link: 'https://example-live.app' }
      ] as never
    })
    expect(projectSchema.safeParse(good).success).toBe(true)
  })

  it('rejects Deployed reality on demo projects', () => {
    const bad = makeProject({ demo: true, deployment: 'Deployed' as never })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects Deployed reality for early lifecycle stages', () => {
    const bad = makeProject({ status: 'Experiment' as never, deployment: 'Deployed' as never })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects http (non-https) public links', () => {
    const bad = makeProject({
      publicLinks: [
        { label: 'Insecure', url: 'http://example-site.dev', kind: 'website', evidence: 'Public evidence' }
      ] as never
    })
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects unknown extra fields (strict objects)', () => {
    const bad = makeProject({ marketingScore: 11 } as never)
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })
})
