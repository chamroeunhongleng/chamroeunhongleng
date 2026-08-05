/**
 * Chat assistant state + transport. State lives at module scope so the
 * conversation survives client-side navigation (the widget stays mounted in
 * the default layout, but remounts must not reset history either).
 */
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  MAX_HISTORY_ENTRIES,
  MAX_HISTORY_ENTRY_LENGTH,
  MAX_MESSAGE_LENGTH
} from '~~/shared/chat/contract'

export interface ChatBubble {
  role: 'user' | 'assistant'
  text: string
  /** Follow-up question chips rendered under an assistant bubble. */
  suggested?: string[]
  /** Set when this answer moved the visitor — powers the undo affordance. */
  navigatedTo?: string
  /** Where the visitor was before that move, so they can return. */
  returnTo?: string
}

/**
 * Welcome bubble; its chips double as the starter questions. The AI +
 * privacy disclosure lives in the widget's persistent footer, so this stays
 * short. Local text — never sent to or produced by the API.
 */
const SEED_BUBBLE: ChatBubble = {
  role: 'assistant',
  text:
    'Hi — I can answer questions about Chamroeun and his work, and take you straight to the right page. '
    + 'English ឬភាសាខ្មែរ both work.',
  suggested: [
    'What is he working on now?',
    'Tell me about the Khmer speech project',
    'What are his skills?',
    'How can I contact him?'
  ]
}

const FRIENDLY_ERROR
  = 'Sorry — I could not reach the assistant. You can email Chamroeun via the contact page instead.'
const FRIENDLY_RATE_LIMIT
  = 'You are sending messages a little fast — please wait a moment and try again.'

const open = ref(false)
const pending = ref(false)
const messages = ref<ChatBubble[]>([SEED_BUBBLE])

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useChat() {
  const router = useRouter()

  function toggle(): void {
    open.value = !open.value
  }

  function close(): void {
    open.value = false
  }

  /**
   * Answer + auto-navigate: push the route the assistant chose (already
   * allowlist-validated server-side) while the panel stays open, then scroll
   * to the section anchor once the 220ms page transition has settled.
   */
  async function navigate(destination: string): Promise<void> {
    const [rawPath = '', fragment] = destination.split('#')
    const path = rawPath || '/'
    const samePath = router.currentRoute.value.path === path
    if (!samePath) {
      await router.push(fragment ? { path, hash: `#${fragment}` } : { path })
    }
    if (fragment) {
      await nextTick()
      window.setTimeout(() => {
        document.getElementById(fragment)?.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start'
        })
      }, samePath ? 0 : 320)
    }
  }

  async function send(raw: string): Promise<void> {
    const message = raw.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!message || pending.value) return

    // History excludes the local seed bubble — the API never sees it.
    const history = messages.value
      .slice(1)
      .slice(-MAX_HISTORY_ENTRIES)
      .map((m) => ({ role: m.role, content: m.text.slice(0, MAX_HISTORY_ENTRY_LENGTH) }))

    messages.value.push({ role: 'user', text: message })
    pending.value = true
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      })
      if (!res.ok) {
        messages.value.push({
          role: 'assistant',
          text: res.status === 429 ? FRIENDLY_RATE_LIMIT : FRIENDLY_ERROR
        })
        return
      }
      const reply = (await res.json()) as {
        reply?: string
        navigateTo?: string | null
        suggested?: string[]
      }
      const bubble: ChatBubble = {
        role: 'assistant',
        text: typeof reply.reply === 'string' && reply.reply ? reply.reply : FRIENDLY_ERROR,
        suggested: Array.isArray(reply.suggested) ? reply.suggested.slice(0, 3) : []
      }
      messages.value.push(bubble)

      if (typeof reply.navigateTo === 'string' && reply.navigateTo.startsWith('/')) {
        const from = router.currentRoute.value.fullPath
        await navigate(reply.navigateTo)
        // Only offer the undo when the visitor actually left the page they
        // were reading — an in-page scroll needs no way back.
        if (router.currentRoute.value.fullPath !== from) {
          bubble.navigatedTo = reply.navigateTo
          bubble.returnTo = from
        }
      }
    } catch {
      messages.value.push({ role: 'assistant', text: FRIENDLY_ERROR })
    } finally {
      pending.value = false
    }
  }

  /**
   * Start over: drop the transcript back to the welcome bubble.
   *
   * State is module-scoped so a conversation survives navigation, which also
   * means it survives closing the panel — without this the only way to clear a
   * long or wrong-turn thread is a full page reload. History sent to the API
   * derives from `messages`, so this genuinely resets the context too.
   */
  function reset(): void {
    if (pending.value) return
    messages.value = [SEED_BUBBLE]
  }

  /**
   * Undo one assistant-triggered jump: return the visitor to the page they
   * were reading, with the conversation untouched. The affordance clears
   * afterwards so the chat never becomes a back-and-forth toggle.
   */
  async function goBack(bubble: ChatBubble): Promise<void> {
    if (!bubble.returnTo) return
    const destination = bubble.returnTo
    bubble.returnTo = undefined
    bubble.navigatedTo = undefined
    await router.push(destination)
  }

  return { open, pending, messages, toggle, close, send, goBack, reset }
}
