<script setup lang="ts">
/**
 * Floating site-assistant widget: a labeled toggle in the bottom-right
 * corner and a non-modal dialog panel. Only the toggle exists in the
 * prerendered HTML (`v-if` panel), keeping the static output lean and
 * check:a11y-clean. Escape closes and returns focus to the toggle — the
 * same keyboard contract as the mobile menu in SiteHeader. The AI +
 * privacy disclosure is a persistent footer, always visible while chatting.
 */
import { computed, nextTick, ref, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'
import { useChat } from '~/composables/useChat'

const { open, pending, messages, toggle, close, send, goBack, reset } = useChat()

const toggleButton = ref<HTMLButtonElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)
const messageList = ref<HTMLElement | null>(null)
const draft = ref('')

/** Chips shown under the newest assistant bubble only. */
const chips = computed(() => {
  const last = messages.value[messages.value.length - 1]
  return last?.role === 'assistant' && last.suggested?.length ? last.suggested : []
})

async function closeAndRefocus(): Promise<void> {
  if (!open.value) return
  close()
  // The launcher is removed while the panel is open, so it does not exist to
  // focus until the close has rendered. Without this await the ref is still
  // null and focus is silently dropped, stranding keyboard users where the
  // panel used to be.
  await nextTick()
  toggleButton.value?.focus()
}

async function submit(text?: string): Promise<void> {
  const value = (text ?? draft.value).trim()
  if (!value || pending.value) return
  if (!text) draft.value = ''
  await send(value)
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  inputField.value?.focus()
})

// Keep the newest message in view as the conversation grows.
watch(
  () => [messages.value.length, pending.value],
  async () => {
    await nextTick()
    const reduced
      = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    messageList.value?.scrollTo({
      top: messageList.value.scrollHeight,
      behavior: reduced ? 'auto' : 'smooth'
    })
  }
)
</script>

<template>
  <div class="chat-widget" @keydown.escape="closeAndRefocus">
    <!-- Dims the page behind an open panel, so the header and content recede
         and the conversation is clearly the thing in focus. Decorative and
         hidden from assistive tech: Escape and the Close button already do
         this job for keyboard and screen-reader users. -->
    <Transition name="chat-scrim">
      <div
        v-if="open"
        class="chat-scrim"
        aria-hidden="true"
        @click="closeAndRefocus"
      />
    </Transition>

    <!-- Hidden while the panel is open: it would float over the panel with
         nothing useful to do, since the header's Close button and Escape both
         already dismiss. Reappears on close, and closeAndRefocus() awaits that
         render before returning focus to it. -->
    <Transition name="chat-launch">
      <button
        v-if="!open"
        ref="toggleButton"
        type="button"
        class="chat-toggle"
        :aria-expanded="open"
        aria-controls="chat-panel"
        aria-label="Chat about this site"
        title="Ask about Chamroeun"
        @click="toggle"
      >
        <img
          src="/images/chat-assistant.png"
          alt=""
          aria-hidden="true"
          class="chat-toggle-icon"
          width="256"
          height="256"
        >
      </button>
    </Transition>

    <Transition name="chat-pop">
      <section
        v-if="open"
        id="chat-panel"
        class="chat-panel"
        role="dialog"
        aria-label="Portfolio assistant"
      >
        <header class="chat-header">
          <img
            src="/images/chat-assistant.png"
            alt=""
            aria-hidden="true"
            class="chat-avatar"
            width="256"
            height="256"
          >
          <div class="chat-heading">
            <p class="chat-title">Portfolio assistant</p>
            <p class="chat-subtitle">Published evidence only · read-only</p>
          </div>
          <button
            type="button"
            class="chat-action"
            aria-label="Start a new conversation"
            title="Start a new conversation"
            :disabled="pending"
            @click="reset"
          >
            <span aria-hidden="true">↺</span>
          </button>
          <button
            type="button"
            class="chat-action chat-close"
            aria-label="Close chat"
            title="Close chat"
            @click="closeAndRefocus"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div ref="messageList" class="chat-messages" aria-live="polite">
          <template v-for="(message, index) in messages" :key="index">
            <ChatMessage
              :role="message.role"
              :text="message.text"
              :show-label="index === 0 || messages[index - 1]?.role !== message.role"
            />
            <p v-if="message.navigatedTo" class="chat-nav-note mono">
              <span class="chat-nav-path">
                <span aria-hidden="true">↪</span> Opened {{ message.navigatedTo }}
              </span>
              <button type="button" class="chat-back" @click="goBack(message)">
                ← Back to where you were
              </button>
            </p>
          </template>
          <div v-if="pending" class="chat-typing" role="status">
            <span class="visually-hidden">Assistant is typing</span>
            <span class="chat-typing-dot" aria-hidden="true" />
            <span class="chat-typing-dot" aria-hidden="true" />
            <span class="chat-typing-dot" aria-hidden="true" />
          </div>
        </div>

        <div v-if="chips.length > 0" class="chat-chips">
          <button
            v-for="chip in chips"
            :key="chip"
            type="button"
            class="chat-chip"
            :disabled="pending"
            @click="submit(chip)"
          >
            {{ chip }}
          </button>
        </div>

        <form class="chat-form" @submit.prevent="submit()">
          <label for="chat-input" class="visually-hidden">Ask about Chamroeun</label>
          <input
            id="chat-input"
            ref="inputField"
            v-model="draft"
            type="text"
            class="chat-input"
            placeholder="Ask about him or his work…"
            maxlength="500"
            autocomplete="off"
          >
          <button type="submit" class="chat-send" :disabled="pending || draft.trim().length === 0">
            Send
          </button>
        </form>

        <p class="chat-disclosure">
          AI assistant — replies come only from this site's content.
          Messages are processed by Anthropic.
          <RouterLink to="/colophon" class="chat-disclosure-link" @click="close">AI policy</RouterLink>
        </p>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
/* Above the sticky header (z-index 50). */
.chat-widget {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 60;
  display: grid;
  justify-items: end;
  gap: var(--space-3);
}

/* Full-viewport, but a child of .chat-widget so it sits inside that stacking
   context (z-index 60) and therefore covers the sticky header at z-index 50.
   position: fixed takes it out of the grid flow, so it does not affect the
   widget's track sizing.

   Deliberately NO body scroll lock: the assistant navigates the visitor and
   scrolls to section anchors while the panel stays open, and locking scroll
   would break that. */
.chat-scrim {
  position: fixed;
  inset: 0;
  /* Light enough that the page reads as receded rather than blacked out. */
  background: rgb(0 0 0 / 0.25);
  cursor: pointer;
}

/* On a near-black page (--color-bg is #131318) a 25% black veil is almost
   invisible, so the panel would appear to float over an undimmed page. Dark
   theme needs more of it to produce the same perceived separation. */
:root[data-theme='dark'] .chat-scrim {
  background: rgb(0 0 0 / 0.5);
}

.chat-scrim-enter-active,
.chat-scrim-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.chat-scrim-enter-from,
.chat-scrim-leave-to {
  opacity: 0;
}

/* The launcher swaps out for the panel rather than vanishing abruptly. */
.chat-launch-enter-active,
.chat-launch-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.chat-launch-enter-from,
.chat-launch-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

@media (prefers-reduced-motion: reduce) {
  .chat-scrim-enter-active,
  .chat-scrim-leave-active,
  .chat-launch-enter-active,
  .chat-launch-leave-active {
    transition: none;
  }
}

.chat-toggle {
  display: grid;
  place-items: center;
  /* Positioned so it paints above the scrim, which is itself positioned —
     a static element would render underneath it and become unclickable. */
  position: relative;
  z-index: 1;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-surface);
  cursor: pointer;
  box-shadow: var(--shadow-2);
  overflow: hidden;
  transition: transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.chat-toggle:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.chat-toggle:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Line-art logo: contained with breathing room, never cropped. */
.chat-toggle-icon {
  width: 68%;
  height: 68%;
  object-fit: contain;
  display: block;
}

/* Panel entrance: opacity/transform only, per the motion contract.
   motion.css's reduced-motion reset collapses it automatically. */
.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
  transform-origin: bottom right;
}

.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.98);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  /* Same reason as .chat-toggle — must paint above the scrim. */
  position: relative;
  z-index: 1;
  width: min(24rem, calc(100vw - 2rem));
  height: min(34rem, 75dvh);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-2);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
}

/* Rounded-square tile rather than a circle — reads as a product mark, not a
   person. The tint is derived from the site accent so it stays on-palette in
   both themes; swap --color-accent-tint for --color-positive to go mint. */
.chat-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-m);
  object-fit: contain;
  padding: 5px;
  background: var(--color-accent-tint);
  border: 1px solid var(--color-border);
  flex: 0 0 auto;
}

.chat-heading {
  display: grid;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

/* Sentence case at body size, not uppercase mono: this is the assistant's
   name, so it should read as a name rather than as a system label. */
.chat-title {
  font-size: var(--text-sm);
  font-weight: 620;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.chat-subtitle {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Shared by the reset and close controls so they stay optically identical. */
.chat-action {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius-s);
  background: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  flex: 0 0 auto;
  transition: background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.chat-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Reset is the secondary action — quieter than close until hovered. */
.chat-action:not(:disabled):hover {
  background: var(--color-surface);
  color: var(--color-text);
}

@media (pointer: coarse) {
  .chat-action {
    width: 44px;
    height: 44px;
  }
}

/* Both header controls, not just close — a reset button with no visible focus
   ring is unreachable-looking for keyboard users. */
.chat-action:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding: var(--space-4);
  overscroll-behavior: contain;
}

/* Navigation receipt + undo — the visitor is never stranded on a page the
   assistant chose for them. */
.chat-nav-note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  margin-top: calc(var(--space-2) * -1);
  padding-inline: var(--space-1);
}

.chat-nav-path {
  overflow-wrap: anywhere;
}

.chat-back {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: var(--color-accent);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.chat-back:hover {
  color: var(--color-accent-hover);
}

.chat-back:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: var(--radius-s);
}

/* Typing indicator — three softly pulsing dots. */
.chat-typing {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--color-surface-sunken);
  border-radius: var(--radius-m);
  border-start-start-radius: var(--radius-s);
  padding: var(--space-2) var(--space-3);
  justify-self: start;
  min-height: 2rem;
}

.chat-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-faint);
  animation: chat-typing-pulse 1.2s var(--ease-out) infinite;
}

.chat-typing-dot:nth-child(3) {
  animation-delay: 0.18s;
}

.chat-typing-dot:nth-child(4) {
  animation-delay: 0.36s;
}

@keyframes chat-typing-pulse {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-3);
}

.chat-chip {
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.chat-chip:hover:enabled {
  border-color: var(--color-accent);
  background: var(--color-accent-tint);
  color: var(--color-text);
}

.chat-form {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4) var(--space-2);
  border-top: 1px solid var(--color-border);
}

.chat-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-m);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.chat-input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
  border-color: var(--color-accent);
}

.chat-input::placeholder {
  color: var(--color-text-faint);
}

/* Primary action — same accent register as .btn-primary. */
.chat-send {
  border: none;
  border-radius: var(--radius-m);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font-size: var(--text-sm);
  font-weight: 560;
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.chat-send:hover:enabled {
  background: var(--color-accent-hover);
}

.chat-send:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.chat-send:disabled {
  opacity: 0.45;
  cursor: default;
}

/* Persistent AI + privacy disclosure — always visible while chatting. */
.chat-disclosure {
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
  color: var(--color-text-faint);
  padding: 0 var(--space-4) var(--space-3);
}

.chat-disclosure-link {
  color: var(--color-text-muted);
  text-underline-offset: 2px;
}

.chat-disclosure-link:hover {
  color: var(--color-accent);
}

/* Touch sizing for the panel's own controls. The header's reset/close buttons
   are already handled above; these are the ones a visitor actually drives the
   conversation with, and at 29px (chips) and 40px (field and Send) they were
   the smallest interactive targets on the site after the evidence arrows. */
@media (pointer: coarse) {
  .chat-chip {
    min-height: 44px;
    padding-inline: var(--space-4);
  }

  .chat-input,
  .chat-send {
    min-height: 44px;
  }

  /* Same rule projects/index.vue already applies to its filter controls: iOS
     Safari zooms the whole page in when a focused field is under 16px, and it
     does not zoom back out afterwards. --text-sm is 14px, so the chat field
     was the one place on the site that still triggered it. */
  .chat-input {
    font-size: var(--text-base);
  }
}

/* Narrow breakpoint (760px, per tokens.css convention): full-width sheet. */
@media (max-width: 760px) {
  .chat-widget {
    right: var(--space-3);
    bottom: var(--space-3);
    left: var(--space-3);
    /* Clear of the iPhone home indicator: at a flat 12px the launcher sat
       inside the gesture strip, where a tap can be taken as a swipe-up. */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .chat-panel {
    width: 100%;
    height: min(30rem, 80dvh);
  }
}
</style>
