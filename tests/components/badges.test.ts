import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EvidenceLabel from '../../app/components/ui/EvidenceLabel.vue'
import StatusBadge from '../../app/components/ui/StatusBadge.vue'
import DeploymentBadge from '../../app/components/ui/DeploymentBadge.vue'
import WorkStateBadge from '../../app/components/ui/WorkStateBadge.vue'
import { EVIDENCE_LABELS, PROJECT_STATUSES } from '../../shared/schemas/index'

describe('EvidenceLabel', () => {
  it('renders every defined evidence label as text', () => {
    for (const evidence of EVIDENCE_LABELS) {
      const wrapper = mount(EvidenceLabel, { props: { evidence } })
      expect(wrapper.text()).toContain(evidence)
    }
  })

  it('renders a span without a link and an anchor with one', () => {
    const plain = mount(EvidenceLabel, { props: { evidence: 'Owner confirmed' } })
    expect(plain.find('a').exists()).toBe(false)

    const linked = mount(EvidenceLabel, {
      props: { evidence: 'Repository evidence', link: 'https://github.com/example/repo' }
    })
    const anchor = linked.find('a')
    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('href')).toBe('https://github.com/example/repo')
    expect(anchor.attributes('rel')).toContain('noopener')
  })

  it('slugifies the label into a data attribute for styling', () => {
    const wrapper = mount(EvidenceLabel, { props: { evidence: 'Demo only' } })
    expect(wrapper.find('[data-evidence="demo-only"]').exists()).toBe(true)
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
