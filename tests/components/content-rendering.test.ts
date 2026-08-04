import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MarkedText from '../../app/components/ui/MarkedText.vue'
import ModeBanner from '../../app/components/layout/ModeBanner.vue'
import ProjectCard from '../../app/components/projects/ProjectCard.vue'
import { projectSchema } from '../../shared/schemas/index'
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

  it('renders the proof block with its evidence label', () => {
    const wrapper = mount(ProjectCard, {
      props: { project },
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })
    expect(wrapper.text()).toContain('Proof')
    expect(wrapper.text()).toContain('Repository evidence')
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
