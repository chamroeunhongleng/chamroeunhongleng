<script setup lang="ts">
import type { Claim } from '~~/shared/schemas/index'
import EvidenceLabel from './EvidenceLabel.vue'
import MarkedText from './MarkedText.vue'
import WorkStateBadge from './WorkStateBadge.vue'

/** Evidence-labeled claims — the only way important statements render. */
defineProps<{ claims: readonly Claim[] }>()
</script>

<template>
  <ul class="claim-list" role="list">
    <li v-for="(claim, i) in claims" :key="i" class="claim">
      <p class="claim-text"><MarkedText :text="claim.text" /></p>
      <span class="claim-labels">
        <WorkStateBadge v-if="claim.workState" :state="claim.workState" />
        <EvidenceLabel :evidence="claim.evidence" :link="claim.link" />
      </span>
    </li>
  </ul>
</template>

<style scoped>
.claim-list {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  padding: 0;
  margin: 0;
}

.claim {
  display: grid;
  gap: var(--space-2);
  padding-inline-start: var(--space-4);
  border-inline-start: 2px solid var(--color-border);
}

.claim-text {
  max-width: var(--prose-max);
}

.claim-labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}
</style>
