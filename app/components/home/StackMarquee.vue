<script setup lang="ts">
import type { Stack } from '~~/shared/schemas/index'
import { useMotionAllowed } from '../../composables/useMotionAllowed'
import ChipMarquee from './ChipMarquee.vue'

defineProps<{ groups: Stack['groups'] }>()

// Slightly different loop lengths so the rows never lock into step.
const SPEEDS = [52, 60, 56, 64]

const motion = useMotionAllowed()
</script>

<template>
  <div class="stack">
    <div class="card stack-panel">
      <ChipMarquee
        v-for="(group, i) in groups"
        :key="group.id"
        :label="group.title"
        :items="group.items"
        :direction="i % 2 === 0 ? 'left' : 'right'"
        :speed="SPEEDS[i % SPEEDS.length]"
      />
    </div>
    <p v-if="motion === 'allowed'" class="hand stack-hint" aria-hidden="true">hover to pause</p>
  </div>
</template>

<style scoped>
.stack-panel {
  padding: var(--space-2) var(--space-8);
  border-radius: var(--radius-hero);
  box-shadow: var(--shadow-raised);
  overflow: hidden;
}

.stack-hint {
  width: fit-content;
  margin: var(--space-5) auto 0;
  transform: rotate(-2deg);
}

@media (hover: none) {
  .stack-hint {
    display: none;
  }
}

@media (min-width: 1300px) {
  .stack-panel {
    margin-inline: calc(var(--space-12) * -1);
  }
}

@media (max-width: 760px) {
  .stack-panel {
    padding: var(--space-1) var(--space-5);
    border-radius: var(--radius-card);
  }
}
</style>
