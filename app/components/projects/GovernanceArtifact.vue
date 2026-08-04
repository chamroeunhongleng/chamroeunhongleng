<script setup lang="ts">
import type { GovernanceArtifact } from '~~/shared/schemas/index'
import EvidenceLabel from '../ui/EvidenceLabel.vue'
import MarkedText from '../ui/MarkedText.vue'

/**
 * Renders a governance artifact (model card, authority matrix, policy
 * control map) as the deliverable itself — a labeled table, not a
 * description of one.
 */
defineProps<{ artifact: GovernanceArtifact }>()
</script>

<template>
  <figure class="artifact">
    <figcaption>
      <p class="artifact-kind">{{ artifact.kind.replaceAll('-', ' ') }}</p>
      <p class="artifact-title">{{ artifact.title }}</p>
      <p class="artifact-desc"><MarkedText :text="artifact.description" /></p>
    </figcaption>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Statement</th>
            <th scope="col">Evidence</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in artifact.rows" :key="row.label">
            <th scope="row">{{ row.label }}</th>
            <td><MarkedText :text="row.value" /></td>
            <td><EvidenceLabel :evidence="row.evidence" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.artifact {
  margin: 0;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  overflow: hidden;
}

figcaption {
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface-sunken);
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: var(--space-1);
}

.artifact-kind {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-accent-2);
}

.artifact-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-lg);
}

.artifact-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.table-scroll {
  overflow-x: auto;
}

table {
  font-size: var(--text-sm);
  min-width: 40rem;
}

th,
td {
  text-align: left;
  vertical-align: top;
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--color-border);
}

thead th {
  border-top: none;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  font-weight: 500;
}

tbody th {
  font-weight: 620;
  white-space: nowrap;
}

td {
  color: var(--color-text-muted);
}
</style>
