<script setup lang="ts">
import { computed } from 'vue'
import type { EvidenceLabel } from '~~/shared/schemas/index'

/**
 * The archival-stamp evidence label. Every important claim renders one.
 * Mono, uppercase, color-classed by evidence strength.
 */
const props = defineProps<{ evidence: EvidenceLabel; link?: string }>()

const slug = computed(() => props.evidence.toLowerCase().replaceAll(' ', '-'))
</script>

<template>
  <a
    v-if="link"
    :href="link"
    class="evidence-label"
    :data-evidence="slug"
    target="_blank"
    rel="noopener"
  >{{ evidence }}<span aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens evidence link)</span></a>
  <span v-else class="evidence-label" :data-evidence="slug">{{ evidence }}</span>
</template>

<style scoped>
.evidence-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.15em 0.55em;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
  color: var(--color-text-muted);
  text-decoration: none;
  white-space: nowrap;
}

a.evidence-label:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.evidence-label[data-evidence='repository-evidence'],
.evidence-label[data-evidence='public-evidence'],
.evidence-label[data-evidence='document-evidence'] {
  color: var(--color-positive);
  border-color: var(--color-positive);
}

.evidence-label[data-evidence='owner-confirmed'] {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.evidence-label[data-evidence='demo-only'] {
  color: var(--color-accent-2);
  border-color: var(--color-accent-2);
  border-style: dashed;
}

.evidence-label[data-evidence='unverified'] {
  color: var(--color-warn);
  border-color: var(--color-warn);
  border-style: dashed;
}

.evidence-label[data-evidence='planned'],
.evidence-label[data-evidence='private'] {
  color: var(--color-text-faint);
  border-style: dotted;
}
</style>
