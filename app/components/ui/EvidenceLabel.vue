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
  /* Positioning context for the touch pad below. */
  position: relative;
}

.evidence-link:hover {
  color: var(--color-accent);
}

/* A 44px hit pad as a pseudo-element, so it takes no layout space. Not on mouse
   pointers: overlapping pads on adjacent claims would swallow clicks on the text. */
@media (pointer: coarse) {
  .evidence-link::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 44px;
    height: 44px;
    transform: translate(-50%, -50%);
  }
}
</style>
