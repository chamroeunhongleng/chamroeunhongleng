<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectStatus } from '~~/shared/schemas/index'

/** Lifecycle status badge — one of two independent honesty axes. */
const props = defineProps<{ status: ProjectStatus }>()

const slug = computed(() => props.status.toLowerCase().replaceAll(' ', '-'))
</script>

<template>
  <span class="status-badge" :data-status="slug">
    <span class="dot" aria-hidden="true" />
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: var(--color-text-faint);
}

.status-badge[data-status='production'] .dot,
.status-badge[data-status='pilot'] .dot {
  background: var(--color-positive);
}

.status-badge[data-status='public-demo'] .dot,
.status-badge[data-status='pre-pilot'] .dot,
.status-badge[data-status='prototype'] .dot {
  background: var(--color-accent);
}

.status-badge[data-status='experiment'] .dot,
.status-badge[data-status='research'] .dot,
.status-badge[data-status='idea'] .dot {
  background: var(--color-accent-2);
}

.status-badge[data-status='paused'] .dot,
.status-badge[data-status='archived'] .dot {
  background: var(--color-border-strong);
}
</style>
