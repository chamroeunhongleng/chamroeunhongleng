import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MarkedText from '../../app/components/ui/MarkedText.vue'
import ModeBanner from '../../app/components/layout/ModeBanner.vue'
import ProjectCard from '../../app/components/projects/ProjectCard.vue'
import RepoTree from '../../app/components/projects/RepoTree.vue'
import { projectSchema, repoStructureSchema } from '../../shared/schemas/index'
import { makeProject } from '../fixtures'

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

describe('MarkedText', () => {
  it('renders plain text untouched', () => {
    const wrapper = mount(MarkedText, { props: { text: 'Just prose.' } })
    expect(wrapper.text()).toBe('Just prose.')
  })

  it('renders markers as visible chips instead of raw brackets', () => {
    const wrapper = mount(MarkedText, {
      props: { text: 'Start [OWNER_INPUT_REQUIRED: Confirm this] end' }
    })
    expect(wrapper.text()).toContain('Owner input required')
    expect(wrapper.text()).toContain('Confirm this')
    expect(wrapper.text()).not.toContain('[OWNER_INPUT_REQUIRED')
  })

  it('marks demo content with a Demo chip', () => {
    const wrapper = mount(MarkedText, { props: { text: '[DEMO] Sample content' } })
    expect(wrapper.text()).toContain('Demo')
    expect(wrapper.text()).toContain('Sample content')
  })
})

describe('ModeBanner', () => {
  it('shows the exact demo banner wording in demo mode', () => {
    const wrapper = mount(ModeBanner, { props: { mode: 'demo' } })
    expect(wrapper.text()).toBe(
      'Demonstration portfolio — some personal information and project content are not final.'
    )
  })

  it('renders nothing in review and production modes', () => {
    for (const mode of ['review', 'production'] as const) {
      const wrapper = mount(ModeBanner, { props: { mode } })
      expect(wrapper.find('p').exists()).toBe(false)
    }
  })
})

describe('ProjectCard', () => {
  const project = projectSchema.parse(makeProject())

  it('shows both honesty axes: status and deployment', () => {
    const wrapper = mount(ProjectCard, {
      props: { project },
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })
    expect(wrapper.text()).toContain('Prototype')
    expect(wrapper.text()).toContain('Local only')
  })

  it('links the whole card to the case study', () => {
    const wrapper = mount(ProjectCard, {
      props: { project },
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })
    expect(wrapper.find('a').attributes('href')).toBe('/projects/fixture-project')
    expect(wrapper.find('.card-link').exists()).toBe(true)
  })

  it('renders the proof block with the evidence claim', () => {
    const wrapper = mount(ProjectCard, {
      props: { project },
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })
    expect(wrapper.text()).toContain('Proof')
    // Evidence claims are displayed; if a link exists, it becomes clickable
    const proofBlock = wrapper.find('.card-proof')
    expect(proofBlock.exists()).toBe(true)
    expect(proofBlock.text()).toContain('It parses')
  })

  it('marks demo projects visually', () => {
    const demoProject = projectSchema.parse(
      makeProject({ demo: true, deployment: 'Not deployed' as never })
    )
    const wrapper = mount(ProjectCard, {
      props: { project: demoProject },
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })
    expect(wrapper.find('[data-demo]').exists()).toBe(true)
  })
})

describe('RepoTree', () => {
  //  fixture-repo/
  //  ├── CLAUDE.md
  //  ├── .claude/
  //  │   ├── commands/
  //  │   │   └── run.md
  //  │   └── settings.json
  //  └── tools/
  const structure = repoStructureSchema.parse({
    root: 'fixture-repo/',
    description: 'The layout is the claim.',
    evidence: 'Repository evidence',
    entries: [
      { depth: 0, name: 'CLAUDE.md', note: 'Project brain' },
      { depth: 0, name: '.claude/' },
      { depth: 1, name: 'commands/' },
      { depth: 2, name: 'run.md' },
      { depth: 1, name: 'settings.json' },
      { depth: 0, name: 'tools/', note: 'Deterministic core' }
    ]
  })

  // textContent, not .text(): wrapper.text() trims, and the trailing space
  // after each connector is exactly what aligns the column.
  const branches = () =>
    mount(RepoTree, { props: { structure } })
      .findAll('.branch')
      .map((b) => b.element.textContent)

  it('draws tee connectors for siblings and an elbow for the last child', () => {
    const drawn = branches()
    expect(drawn[0]).toBe('├── ')
    expect(drawn[5]).toBe('└── ')
  })

  it('carries the spine down through open ancestors only', () => {
    const drawn = branches()
    expect(drawn[2]).toBe('│   ├── ')
    expect(drawn[3]).toBe('│   │   └── ')
    expect(drawn[4]).toBe('│   └── ')
  })

  it('hides the connectors from assistive technology but not the paths', () => {
    const wrapper = mount(RepoTree, { props: { structure } })
    for (const branch of wrapper.findAll('.branch')) {
      expect(branch.attributes('aria-hidden')).toBe('true')
    }
    expect(wrapper.findAll('.path').map((p) => p.text())).toContain('settings.json')
  })

  it('labels the block with its evidence and marks directories', () => {
    const wrapper = mount(RepoTree, { props: { structure } })
    expect(wrapper.text()).toContain('Repository evidence')
    expect(wrapper.text()).toContain('fixture-repo/')
    // Directories are the names ending in "/": .claude/, commands/, tools/
    expect(wrapper.findAll('li[data-dir]')).toHaveLength(3)
  })
})
