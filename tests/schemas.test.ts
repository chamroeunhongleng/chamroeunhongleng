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

describe('project order', () => {
  it('defaults to 0 when the content file omits it', () => {
    const parsed = projectSchema.parse(makeProject())
    expect(parsed.order).toBe(0)
  })

  it('outranks the alphabet for projects tied on featured and status', () => {
    // The /projects grid sorts featured -> status -> order -> name. Without
    // `order`, "Kaskor ASR" would always precede "LMS —" on initials alone.
    const sortKey = (p: { order: number; name: string }, q: { order: number; name: string }) =>
      p.order !== q.order ? p.order - q.order : p.name.localeCompare(q.name)

    const kaskor = projectSchema.parse(makeProject({ name: 'Kaskor ASR', order: 2 } as never))
    const lms = projectSchema.parse(makeProject({ name: 'LMS — Bilingual', order: 1 } as never))

    expect([kaskor, lms].sort(sortKey).map((p) => p.name)).toEqual([
      'LMS — Bilingual',
      'Kaskor ASR'
    ])
  })

  it('rejects a non-integer order', () => {
    expect(projectSchema.safeParse(makeProject({ order: 1.5 } as never)).success).toBe(false)
  })
})

describe('repoStructure', () => {
  const tree = (entries: Array<{ depth: number; name: string; note?: string }>) =>
    makeProject({
      repoStructure: {
        root: 'example-repo/',
        description: 'The layout is the claim.',
        evidence: 'Repository evidence',
        entries
      }
    } as never)

  it('accepts a well-formed tree', () => {
    const good = tree([
      { depth: 0, name: 'README.md', note: 'What this is' },
      { depth: 0, name: 'tools/', note: 'Deterministic core' },
      { depth: 1, name: 'run.py' }
    ])
    expect(projectSchema.safeParse(good).success).toBe(true)
  })

  it('rejects a child that skips a depth level (an orphan row)', () => {
    const bad = tree([
      { depth: 0, name: 'tools/' },
      { depth: 2, name: 'run.py' },
      { depth: 0, name: 'README.md' }
    ])
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a tree whose first entry is not at the root level', () => {
    const bad = tree([
      { depth: 1, name: 'run.py' },
      { depth: 1, name: 'config.py' },
      { depth: 1, name: 'io.py' }
    ])
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })

  it('requires an evidence label on the block', () => {
    const bad = makeProject({
      repoStructure: {
        root: 'example-repo/',
        description: 'No label.',
        entries: [
          { depth: 0, name: 'a.py' },
          { depth: 0, name: 'b.py' },
          { depth: 0, name: 'c.py' }
        ]
      }
    } as never)
    expect(projectSchema.safeParse(bad).success).toBe(false)
  })
})
