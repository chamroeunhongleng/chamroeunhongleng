import { describe, expect, it } from 'vitest'
import { loadContent } from '../../scripts/lib/load-content'
import {
  PROJECT_SECTION_ANCHORS,
  STATIC_NAV_TARGETS,
  buildNavAllowlist,
  chatProjects,
  validateNavigateTo
} from '../../shared/chat/navigation'

const { bundle } = loadContent()
const allowlist = buildNavAllowlist(bundle!.projects)

describe('navigation allowlist', () => {
  it('covers every static page and verified anchor', () => {
    for (const target of STATIC_NAV_TARGETS) {
      expect(allowlist.has(target.path)).toBe(true)
    }
  })

  it('derives a page and all section anchors for every enabled non-demo project', () => {
    const real = chatProjects(bundle!.projects)
    // Matches the prerendered routes: enabled, non-demo case studies only
    // (disabled projects like ai-layer have no page to navigate to).
    expect(real.length).toBe(bundle!.projects.filter((p) => p.enabled && !p.demo).length)
    expect(real.length).toBeGreaterThan(0)
    for (const project of real) {
      expect(allowlist.has(`/projects/${project.slug}`)).toBe(true)
      for (const anchor of PROJECT_SECTION_ANCHORS) {
        expect(allowlist.has(`/projects/${project.slug}#${anchor.id}`)).toBe(true)
      }
    }
  })

  it('excludes demo projects', () => {
    for (const path of allowlist) {
      expect(path).not.toContain('demo-governance-review')
    }
  })
})

describe('validateNavigateTo', () => {
  it('passes exact allowlisted paths through', () => {
    expect(validateNavigateTo('/contact', allowlist)).toBe('/contact')
    expect(validateNavigateTo('/projects/kaskor-asr#overview', allowlist)).toBe(
      '/projects/kaskor-asr#overview'
    )
  })

  it('collapses everything else to null', () => {
    expect(validateNavigateTo('https://evil.example', allowlist)).toBeNull()
    expect(validateNavigateTo('/admin', allowlist)).toBeNull()
    expect(validateNavigateTo('javascript:alert(1)', allowlist)).toBeNull()
    expect(validateNavigateTo('/projects/kaskor-asr#nope', allowlist)).toBeNull()
    expect(validateNavigateTo('/contact/', allowlist)).toBeNull()
    expect(validateNavigateTo(null, allowlist)).toBeNull()
    expect(validateNavigateTo(42, allowlist)).toBeNull()
    expect(validateNavigateTo(['/contact'], allowlist)).toBeNull()
  })
})
