<script setup lang="ts">
import { computed } from 'vue'
import type { Marker } from '~~/shared/markers'

const props = defineProps<{ marker: Marker }>()

const LABELS: Record<Marker['type'], string> = {
  DEMO: 'Demo',
  PLACEHOLDER: 'Placeholder',
  OWNER_INPUT_REQUIRED: 'Owner input required',
  REPLACE_BEFORE_PRODUCTION: 'Replace before production'
}

const label = computed(() => LABELS[props.marker.type])
</script>

<template>
  <span class="placeholder-tag" :data-marker="marker.type.toLowerCase()">
    <span class="tag-chip">{{ label }}</span>
    <span v-if="marker.note" class="tag-note">{{ marker.note }}</span>
  </span>
</template>

<style scoped>
.placeholder-tag {
  display: inline;
}

.tag-chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.1em 0.5em;
  border-radius: var(--radius-s);
  border: 1px dashed var(--color-border-strong);
  color: var(--color-warn);
  background: var(--color-surface-sunken);
  vertical-align: baseline;
}

.placeholder-tag[data-marker='demo'] .tag-chip {
  color: var(--color-accent-2);
}

.tag-note {
  font-style: italic;
  color: var(--color-text-muted);
  margin-inline-start: 0.35em;
}
</style>
