import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EvidenceLabel from '../../app/components/ui/EvidenceLabel.vue'
import StatusBadge from '../../app/components/ui/StatusBadge.vue'
import DeploymentBadge from '../../app/components/ui/DeploymentBadge.vue'
import WorkStateBadge from '../../app/components/ui/WorkStateBadge.vue'
import { PROJECT_STATUSES } from '../../shared/schemas/index'

describe('EvidenceLabel', () => {
  it('renders a link when a link is provided', () => {
    const linked = mount(EvidenceLabel, {
      props: { evidence: 'Repository evidence', link: 'https://github.com/example/repo' }
    })
    const anchor = linked.find('a')
    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('href')).toBe('https://github.com/example/repo')
    expect(anchor.attributes('rel')).toContain('noopener')
  })

  it('renders nothing when no link is provided', () => {
    const plain = mount(EvidenceLabel, { props: { evidence: 'Owner confirmed' } })
    expect(plain.find('a').exists()).toBe(false)
  })

  it('displays a small icon for linked evidence', () => {
    const wrapper = mount(EvidenceLabel, {
      props: { evidence: 'Public evidence', link: 'https://example.com' }
    })
    expect(wrapper.find('a span[aria-hidden]').exists()).toBe(true)
  })
})

describe('StatusBadge', () => {
  it('renders every lifecycle status', () => {
    for (const status of PROJECT_STATUSES) {
      const wrapper = mount(StatusBadge, { props: { status } })
      expect(wrapper.text()).toContain(status)
    }
  })
})

describe('DeploymentBadge', () => {
  it('exposes deployment reality as its own axis', () => {
    const wrapper = mount(DeploymentBadge, { props: { deployment: 'Public demo' } })
    expect(wrapper.text()).toContain('Public demo')
    expect(wrapper.find('[data-deployment="public-demo"]').exists()).toBe(true)
  })
})

describe('WorkStateBadge', () => {
  it('renders work states with state attribute', () => {
    const wrapper = mount(WorkStateBadge, { props: { state: 'Planned' } })
    expect(wrapper.text()).toContain('Planned')
    expect(wrapper.find('[data-state="planned"]').exists()).toBe(true)
  })
})
