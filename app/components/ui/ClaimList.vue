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
      <div class="claim-content">
        <p v-if="claim.link" class="claim-text">
          <a :href="claim.link" target="_blank" rel="noopener" class="claim-link">
            <MarkedText :text="claim.text" />
            <span aria-hidden="true">↗</span>
          </a>
        </p>
        <p v-else class="claim-text"><MarkedText :text="claim.text" /></p>
        <span class="claim-labels">
          <WorkStateBadge v-if="claim.workState" :state="claim.workState" />
          <EvidenceLabel :evidence="claim.evidence" :link="claim.link" />
        </span>
      </div>
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

.claim-content {
  display: grid;
  gap: var(--space-1);
}

.claim-text {
  max-width: var(--prose-max);
  margin: 0;
}

.claim-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 0.15em;
  text-decoration-thickness: 1px;
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  transition: all 0.2s ease;
}

.claim-link:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.claim-link span[aria-hidden] {
  opacity: 0.6;
  font-size: 0.85em;
}

.claim-labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}
</style>
