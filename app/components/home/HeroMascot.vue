<script setup lang="ts">
import { useChat } from '../../composables/useChat'
import { useMotionAllowed } from '../../composables/useMotionAllowed'
import Scribble from '../ui/Scribble.vue'

/**
 * The small greeter beside the hero name: the site assistant's mark on a
 * tilted tile, saying hello in Khmer and English. It is also the friendliest
 * way into the assistant — one tap opens the chat panel, the same panel the
 * launcher in the corner opens.
 *
 * Still unless ambient motion is allowed (reduced motion and automated runs
 * get a static tile).
 *
 * The art is the chat assistant's logo until the owner supplies a mascot:
 * drop a square, transparent PNG (≥256px, ≤40 KB) at public/images/mascot.png
 * and pass src="/images/mascot.png".
 */
withDefaults(defineProps<{ src?: string }>(), { src: '/images/chat-assistant.png' })

const motion = useMotionAllowed()
const { open } = useChat()

function openAssistant() {
  open.value = true
}
</script>

<template>
  <button
    type="button"
    class="mascot"
    :data-animate="motion === 'allowed' ? '' : undefined"
    aria-label="Open the site assistant"
    aria-haspopup="dialog"
    @click="openAssistant"
  >
    <span class="mascot-bubble" aria-hidden="true">
      <span lang="km" class="mascot-km">សួស្តី</span> hello!
    </span>
    <span class="mascot-card" aria-hidden="true">
      <img :src="src" alt="" width="256" height="256" decoding="async" class="mascot-img">
    </span>
    <span class="mascot-note hand" aria-hidden="true">
      <Scribble variant="arrow" class="mascot-arrow" />
      <span>ask me<span class="mascot-note-more"> about him</span></span>
    </span>
  </button>
</template>

<style scoped>
.mascot {
  position: relative;
  display: inline-grid;
  flex: 0 0 auto;
  width: 5.5rem;
  margin-top: var(--space-7);
  border-radius: var(--radius-card);
}

.mascot-card {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  padding: 16%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transform: rotate(-6deg);
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.mascot:hover .mascot-card,
.mascot:focus-visible .mascot-card {
  transform: rotate(0deg) translateY(-3px);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-raised);
  animation-play-state: paused;
}

.mascot-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mascot-bubble {
  position: absolute;
  bottom: calc(100% - var(--space-2));
  left: 45%;
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.3em 0.75em;
  font-size: var(--text-xs);
  font-weight: var(--weight-strong);
  line-height: var(--leading-snug);
  white-space: nowrap;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card);
  transform: rotate(4deg);
}

.mascot-km {
  font-family: var(--font-khmer);
  font-weight: var(--weight-medium);
}

/* The handwritten nudge under the tile, with a pen arrow pointing up at it. */
.mascot-note {
  position: absolute;
  top: calc(100% + var(--space-1));
  /* A little left of centre: the portrait's backplate begins just to the right. */
  left: 32%;
  display: grid;
  justify-items: center;
  width: max-content;
  max-width: 7rem;
  text-align: center;
  transform: translateX(-50%) rotate(-4deg);
}

.mascot-arrow {
  /* The stock arrow points up-left; mirrored, it points up at the tile. */
  transform: scaleX(-1) rotate(38deg);
  margin-bottom: calc(var(--space-1) * -1);
}

@media (prefers-reduced-motion: no-preference) {
  .mascot[data-animate] .mascot-card {
    animation: mascot-float var(--duration-float) ease-in-out infinite;
  }
}

@keyframes mascot-float {
  0%,
  100% {
    transform: rotate(-6deg) translateY(0);
  }

  50% {
    transform: rotate(-3deg) translateY(-8%);
  }
}

@media (max-width: 760px) {
  .mascot {
    width: 4.25rem;
    margin-top: var(--space-6);
  }

  /* On a phone the mascot can sit against the right edge of the screen, so
     the bubble grows leftward from the mascot's right edge instead of
     hanging past it (it pushed a 390px page 12px sideways). */
  .mascot-bubble {
    left: auto;
    right: 0;
    transform: rotate(3deg);
  }

  .mascot-note {
    left: 50%;
  }

  .mascot-note-more {
    display: none;
  }
}
</style>
