import { defineComponent } from 'vue'
import type { Router } from 'vue-router'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ChatWidget from '../../app/components/chat/ChatWidget.vue'
import ChatMessage from '../../app/components/chat/ChatMessage.vue'

const Empty = defineComponent({ template: '<div />' })

function mountWidget() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: Empty }]
  })
  return mount(ChatWidget, {
    global: { plugins: [router] },
    attachTo: document.body
  })
}

// NOTE: chat state is a module-scope singleton (it must survive route
// changes), so these tests run as one sequential lifecycle.
describe('ChatWidget', () => {
  it('renders only a named toggle button while closed', () => {
    const wrapper = mountWidget()
    const toggle = wrapper.get('button.chat-toggle')
    expect(toggle.attributes('aria-label')).toBe('Chat about this site')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.attributes('aria-controls')).toBe('chat-panel')
    expect(wrapper.find('#chat-panel').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens the panel with the AI disclosure and starter chips', async () => {
    const wrapper = mountWidget()
    await wrapper.get('button.chat-toggle').trigger('click')
    // The launcher is removed while the panel is open — it would float over
    // the panel with nothing useful to do. Close and Escape dismiss instead.
    expect(wrapper.find('button.chat-toggle').exists()).toBe(false)
    const panel = wrapper.get('#chat-panel')
    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.text()).toContain('AI assistant')
    expect(wrapper.findAll('.chat-chip').length).toBeGreaterThan(0)
    expect(wrapper.findComponent(ChatMessage).exists()).toBe(true)
    wrapper.unmount()
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    const wrapper = mountWidget()
    expect(wrapper.find('#chat-panel').exists()).toBe(true) // still open from the previous test
    await wrapper.get('#chat-panel').trigger('keydown', { key: 'Escape' })
    // closeAndRefocus awaits a render before focusing, because the launcher
    // does not exist until the close has been applied.
    await flushPromises()
    expect(wrapper.find('#chat-panel').exists()).toBe(false)
    expect(wrapper.get('button.chat-toggle').attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(wrapper.get('button.chat-toggle').element)
    wrapper.unmount()
  })

  it('offers a way back after the assistant moves the visitor, and honours it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          reply: 'He studies at AUPP and Fort Hays State.',
          navigateTo: '/about',
          suggested: []
        })
      }))
    )
    const wrapper = mountWidget()
    const router = (wrapper.vm as unknown as { $router: Router }).$router
    await router.push('/projects')
    await wrapper.get('button.chat-toggle').trigger('click')

    await wrapper.get('#chat-input').setValue('Where does he study?')
    await wrapper.get('form.chat-form').trigger('submit')
    await flushPromises()

    // The visitor was moved, and the chat says so.
    expect(router.currentRoute.value.fullPath).toBe('/about')
    const note = wrapper.get('.chat-nav-note')
    expect(note.text()).toContain('/about')

    // One click returns them to the page they were reading.
    await note.get('button.chat-back').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/projects')
    // The conversation survives the trip; the undo does not linger.
    expect(wrapper.find('.chat-nav-note').exists()).toBe(false)
    expect(wrapper.text()).toContain('He studies at AUPP and Fort Hays State.')

    // Leave the shared widget state closed for the next test in the sequence.
    // The launcher is gone while open, so close via the header button.
    await wrapper.get('button.chat-close').trigger('click')
    await flushPromises()
    vi.unstubAllGlobals()
    wrapper.unmount()
  })

  it('disables Send while the input is empty and while a reply is pending', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))) // never resolves
    const wrapper = mountWidget()
    await wrapper.get('button.chat-toggle').trigger('click')

    const send = () => wrapper.get('button.chat-send')
    expect(send().attributes('disabled')).toBeDefined()

    await wrapper.get('#chat-input').setValue('What are his skills?')
    expect(send().attributes('disabled')).toBeUndefined()

    await wrapper.get('form.chat-form').trigger('submit')
    expect(send().attributes('disabled')).toBeDefined() // pending
    expect(wrapper.find('.chat-typing').exists()).toBe(true)
    expect(wrapper.text()).toContain('Assistant is typing')

    vi.unstubAllGlobals()
    wrapper.unmount()
  })
})
