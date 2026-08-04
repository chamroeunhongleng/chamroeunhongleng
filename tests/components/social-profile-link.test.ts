import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SocialProfileLink from '../../app/components/ui/SocialProfileLink.vue'

describe('SocialProfileLink', () => {
  it.each([
    ['GitHub', 'https://github.com/example', 'github'],
    ['LinkedIn', 'https://www.linkedin.com/in/example', 'linkedin'],
    ['X', 'https://x.com/example', 'x']
  ])('renders the %s brand mark', (label, url, platform) => {
    const wrapper = mount(SocialProfileLink, { props: { label, url } })
    const anchor = wrapper.get('a')

    expect(anchor.attributes('data-platform')).toBe(platform)
    expect(anchor.attributes('href')).toBe(url)
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('rel')).toContain('noopener')
    expect(anchor.attributes('aria-label')).toContain('opens in a new tab')
    expect(anchor.find('svg[aria-hidden="true"][focusable="false"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(label)
  })

  it('identifies GitHub organization links from the URL rather than the label', () => {
    const wrapper = mount(SocialProfileLink, {
      props: { label: 'CHNAI LAB', url: 'https://github.com/CHNAI-LAB' }
    })

    expect(wrapper.get('a').attributes('data-platform')).toBe('github')
  })

  it('uses a generic web mark for an unknown profile host', () => {
    const wrapper = mount(SocialProfileLink, {
      props: { label: 'Portfolio', url: 'https://example.com/profile' }
    })

    expect(wrapper.get('a').attributes('data-platform')).toBe('generic')
  })
})
