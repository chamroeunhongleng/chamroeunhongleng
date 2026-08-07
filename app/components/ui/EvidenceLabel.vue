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

/* The glyph measures ~16px square — a thumb-hostile target, and it sits inline
   beside a badge on 30-odd spots sitewide, so it cannot simply grow to 44px
   without pushing those lines apart. Instead the visual size is left alone and
   an invisible pad extends the hit area outward from the centre. It is a
   pseudo-element, so it takes no layout space and shifts nothing.

   The pad is not applied on mouse pointers: overlapping pads on adjacent
   claims would swallow clicks meant for the text around them. */
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
