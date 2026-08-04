<script setup lang="ts">
import type { Link } from '~~/shared/schemas/index'

/** Artifact receipts: a uniform row of public links (repo, demo, docs…). */
defineProps<{ links: readonly Link[] }>()
</script>

<template>
  <ul v-if="links.length" class="link-strip" role="list">
    <li v-for="link in links" :key="link.url">
      <a :href="link.url" target="_blank" rel="noopener" class="receipt">
        <span class="kind">{{ link.kind }}</span>
        {{ link.label }}
        <span aria-hidden="true">↗</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.link-strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: 0;
}

.receipt {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: var(--text-sm);
  font-weight: 560;
  text-decoration: none;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-m);
  padding: 0.45em 0.9em;
  color: var(--color-text);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.receipt:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.kind {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
}
</style>
