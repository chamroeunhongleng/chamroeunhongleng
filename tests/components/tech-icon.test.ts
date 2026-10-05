import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TechIcon from '../../app/components/ui/TechIcon.vue'
import { hasTechIcon, isDarkMark } from '../../app/data/tech-icons'
import { loadContent } from '../../scripts/lib/load-content'

describe('TechIcon', () => {
  it('draws a registered mark as a decorative inline SVG in the text colour by default', () => {
    const wrapper = mount(TechIcon, { props: { icon: 'python' } })
    const svg = wrapper.get('svg.tech-icon')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.get('path').attributes('d')?.length).toBeGreaterThan(20)
    expect(svg.attributes('data-brand')).toBeUndefined()
    expect(svg.attributes('style')).toBeUndefined()
  })

  it('takes the brand colour through a custom property, never a fill attribute', () => {
    const wrapper = mount(TechIcon, { props: { icon: 'python', brand: true } })
    const svg = wrapper.get('svg.tech-icon')
    expect(svg.attributes('data-brand')).toBe('true')
    expect(svg.attributes('style')).toMatch(/--tech-brand: #[0-9A-Fa-f]{6}/)
    expect(wrapper.html()).not.toMatch(/fill="#/)
  })

  it('flags near-black marks so the dark theme can redraw them in the text colour', () => {
    expect(isDarkMark('000000')).toBe(true)
    expect(isDarkMark('3776AB')).toBe(false)
    const wrapper = mount(TechIcon, { props: { icon: 'nextdotjs', brand: true } })
    expect(wrapper.get('svg').attributes('data-dark-mark')).toBe('true')
  })

  it('renders a quiet placeholder for an unknown slug instead of failing', () => {
    const wrapper = mount(TechIcon, { props: { icon: 'not-a-real-brand' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('.tech-icon-fallback').exists()).toBe(true)
  })

  it('has a registered mark for every icon content/stack.json names', () => {
    const { bundle } = loadContent()
    const slugs = bundle!.stack.groups.flatMap((g) => g.items).flatMap((i) => (i.icon ? [i.icon] : []))
    expect(slugs.length).toBeGreaterThan(0)
    for (const slug of slugs) expect(hasTechIcon(slug), slug).toBe(true)
  })
})
