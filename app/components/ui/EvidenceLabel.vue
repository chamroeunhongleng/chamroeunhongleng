<script setup lang="ts">
import type { EvidenceLabel } from '~~/shared/schemas/index'

defineProps<{ evidence: EvidenceLabel; link?: string }>()
</script>

<template>
  <a
    v-if="link"
    :href="link"
    class="evidence-link"
    target="_blank"
    rel="noopener"
    :title="`${evidence} · click to verify`"
  ><span aria-hidden="true">↗</span><span class="visually-hidden">{{ evidence }}: opens link</span></a>
</template>

<style scoped>
.evidence-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2em;
  height: 1.2em;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.85em;
}

.evidence-link:hover {
  color: var(--color-accent);
}
</style>
