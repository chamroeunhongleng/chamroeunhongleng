import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ChipMarquee from '../../app/components/home/ChipMarquee.vue'

const items = [
  { name: 'Python', icon: 'python' },
  { name: 'Whisper' },
  { name: 'TypeScript', icon: 'typescript' }
]

function setWebdriver(value: boolean) {
  Object.defineProperty(window.navigator, 'webdriver', { value, configurable: true })
}

describe('ChipMarquee', () => {
  afterEach(() => setWebdriver(false))

  it('renders every item exactly once as a still list before any motion starts', () => {
    const wrapper = mount(ChipMarquee, { props: { label: 'ML & data', items } })
    // Mount effects have not re-rendered yet: this is what prerendered HTML holds.
    expect(wrapper.findAll('.marquee-list:not(.marquee-clone) .chip')).toHaveLength(3)
    expect(wrapper.find('.marquee-clone').exists()).toBe(false)
    expect(wrapper.find('h3').text()).toBe('ML & data')
    wrapper.unmount()
  })

  it('adds a hidden, inert copy for the loop only when motion is allowed', async () => {
    setWebdriver(false)
    const wrapper = mount(ChipMarquee, { props: { label: 'Software', items } })
    await nextTick()
    const clone = wrapper.find('.marquee-clone')
    expect(clone.exists()).toBe(true)
    expect(clone.attributes('aria-hidden')).toBe('true')
    expect(clone.attributes()).toHaveProperty('inert')
    expect(wrapper.find('.marquee-row').attributes('data-animate')).toBe('')
    wrapper.unmount()
  })

  it('stays still in automated runs (navigator.webdriver)', async () => {
    setWebdriver(true)
    const wrapper = mount(ChipMarquee, { props: { label: 'Software', items } })
    await nextTick()
    expect(wrapper.find('.marquee-clone').exists()).toBe(false)
    expect(wrapper.find('.marquee-row').attributes('data-animate')).toBeUndefined()
    wrapper.unmount()
  })

  it('draws a mark only for items that have one', () => {
    const wrapper = mount(ChipMarquee, { props: { label: 'Mixed', items } })
    const chips = wrapper.findAll('.marquee-list:not(.marquee-clone) .chip')
    expect(chips[0]!.find('svg.tech-icon path').attributes('d')?.length).toBeGreaterThan(20)
    expect(chips[1]!.find('.tech-icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('carries its loop length as a custom property', () => {
    const wrapper = mount(ChipMarquee, { props: { label: 'Speed', items, speed: 55 } })
    expect(wrapper.find('.marquee-row').attributes('style')).toContain('--marquee-duration: 55s')
    wrapper.unmount()
  })
})
