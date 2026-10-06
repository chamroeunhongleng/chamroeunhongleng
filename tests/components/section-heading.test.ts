import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionHeading from '../../app/components/ui/SectionHeading.vue'

describe('SectionHeading', () => {
  it('renders the eyebrow, the heading at the requested level, and the lede', () => {
    const wrapper = mount(SectionHeading, {
      props: { eyebrow: 'About', title: 'A bit about me', text: 'Some context.', as: 'h1', id: 'about-title' }
    })
    expect(wrapper.get('.eyebrow').text()).toBe('About')
    expect(wrapper.get('h1').attributes('id')).toBe('about-title')
    expect(wrapper.get('h1').text()).toBe('A bit about me')
    expect(wrapper.get('.lede').text()).toBe('Some context.')
  })

  it('underlines the marked phrase without changing the heading text', () => {
    const wrapper = mount(SectionHeading, {
      props: { eyebrow: 'About', title: 'A bit about me', mark: 'about me' }
    })
    const heading = wrapper.get('h2')
    expect(heading.text()).toBe('A bit about me')
    expect(heading.get('.heading-mark').text()).toBe('about me')
    expect(heading.get('.heading-mark svg').attributes('aria-hidden')).toBe('true')
  })

  it('renders the title plain when the marked phrase is not in it', () => {
    const wrapper = mount(SectionHeading, {
      props: { eyebrow: 'About', title: 'A bit about me', mark: 'somebody else' }
    })
    expect(wrapper.get('h2').text()).toBe('A bit about me')
    expect(wrapper.find('.heading-mark').exists()).toBe(false)
  })

  it('stacks when there is nothing for the right-hand column', () => {
    const wrapper = mount(SectionHeading, { props: { eyebrow: 'Reading', title: 'Reading notes' } })
    expect(wrapper.get('header').attributes('data-layout')).toBe('stack')
    expect(wrapper.find('.section-head-aside').exists()).toBe(false)
  })
})
