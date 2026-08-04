<script setup lang="ts">
import { computed } from 'vue'
import type { WorkState } from '~~/shared/schemas/index'

/** State label for individual work items inside a case study. */
const props = defineProps<{ state: WorkState }>()

const slug = computed(() => props.state.toLowerCase())
</script>

<template>
  <span class="work-state" :data-state="slug">{{ state }}</span>
</template>

<style scoped>
.work-state {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  white-space: nowrap;
}

.work-state[data-state='completed'],
.work-state[data-state='tested'] {
  color: var(--color-positive);
}

.work-state[data-state='demonstrated'] {
  color: var(--color-accent);
}

.work-state[data-state='unverified'] {
  color: var(--color-warn);
}
</style>
