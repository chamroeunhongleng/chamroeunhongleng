<script setup lang="ts">
import { computed } from 'vue'
import { useMotionAllowed } from '../../composables/useMotionAllowed'
import TechIcon from '../ui/TechIcon.vue'

// A still, wrapped list until mount allows motion; the animated clone is aria-hidden
// and inert so nothing is read or focused twice.
const props = withDefaults(
  defineProps<{
    label: string
    items: ReadonlyArray<{ name: string; icon?: string }>
    direction?: 'left' | 'right'
    speed?: number
  }>(),
  { direction: 'left', speed: 46 }
)

const motion = useMotionAllowed()
const animated = computed(() => motion.value === 'allowed')
const style = computed(() => ({ '--marquee-duration': `${props.speed}s` }))
</script>

<template>
  <div
    class="marquee-row"
    :data-direction="direction"
    :data-animate="animated ? '' : undefined"
    :style="style"
  >
    <h3 class="marquee-label">{{ label }}</h3>
    <div class="marquee">
      <div class="marquee-track">
        <ul class="marquee-list" role="list">
          <li v-for="item in items" :key="item.name" class="chip">
            <TechIcon v-if="item.icon" :icon="item.icon" brand />{{ item.name }}
          </li>
        </ul>
        <ul v-if="animated" class="marquee-list marquee-clone" role="list" aria-hidden="true" inert>
          <li v-for="item in items" :key="item.name" class="chip">
            <TechIcon v-if="item.icon" :icon="item.icon" brand />{{ item.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-row {
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr);
  align-items: center;
  gap: var(--space-6);
  padding-block: var(--space-6);
}

.marquee-row + .marquee-row {
  border-top: 1px solid var(--color-border);
}

.marquee-label {
  font-size: var(--text-lg);
  font-weight: var(--weight-heading);
  letter-spacing: var(--tracking-snug);
}

.marquee {
  min-width: 0;
}

.marquee-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.marquee-list .chip {
  gap: 0.65em;
  padding: 0.85em 1.35em;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  background: var(--color-surface);
  border-color: var(--color-border);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.marquee-list .chip:hover {
  border-color: var(--color-border-strong);
}

.marquee-list .chip .tech-icon {
  width: 1.35em;
  height: 1.35em;
}

/* The edge fade is an alpha mask: the keyword colours below only carry opacity. */
.marquee-row[data-animate] .marquee {
  overflow: hidden;
  padding-block: 2px;
  -webkit-mask-image: linear-gradient(to right, transparent, black var(--space-10), black calc(100% - var(--space-10)), transparent);
  mask-image: linear-gradient(to right, transparent, black var(--space-10), black calc(100% - var(--space-10)), transparent);
}

.marquee-row[data-animate] .marquee-track {
  display: flex;
  width: max-content;
  animation: marquee var(--marquee-duration, var(--duration-marquee)) linear infinite;
}

.marquee-row[data-animate] .marquee-list {
  flex-wrap: nowrap;
  flex: 0 0 auto;
  /* Trailing space instead of a track gap: the track is then exactly two
     lists wide, so translateX(-50%) loops without a jump. */
  padding-inline-end: var(--space-3);
}

.marquee-row[data-animate][data-direction='right'] .marquee-track {
  animation-direction: reverse;
}

.marquee-row[data-animate]:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-row[data-animate] .marquee-track {
    animation: none;
  }
}

@media (max-width: 760px) {
  .marquee-row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-3);
    padding-block: var(--space-4);
  }

  .marquee-label {
    font-size: var(--text-base);
  }

  .marquee-list {
    gap: var(--space-2);
  }

  .marquee-list .chip {
    padding: 0.6em 1em;
    font-size: var(--text-sm);
  }
}
</style>
