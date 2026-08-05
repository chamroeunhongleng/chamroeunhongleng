<script setup lang="ts">
import { computed } from 'vue'
import type { Link } from '~~/shared/schemas/index'

/** Artifact receipts: a uniform row of public links (repo, demo, docs…). */
const props = withDefaults(
  defineProps<{
    links: readonly Link[]
    /** 'grid' lays receipts out in equal-width columns — for sets of three or more. */
    variant?: 'inline' | 'grid'
  }>(),
  { variant: 'inline' }
)

/**
 * A kind badge earns its place only when it tells one receipt from another.
 * Six "docs" chips down a list say nothing, so a uniform set drops the badge;
 * a lone receipt keeps it, because one label is information, not repetition.
 */
const showKind = computed(
  () => props.links.length === 1 || new Set(props.links.map((l) => l.kind)).size > 1
)
</script>

<template>
  <ul v-if="links.length" class="link-strip" :data-variant="variant" role="list">
    <li v-for="link in links" :key="link.url">
      <a :href="link.url" target="_blank" rel="noopener" class="receipt">
        <span v-if="showKind" class="kind">{{ link.kind }}</span>
        <span class="label">{{ link.label }}</span>
        <span class="arrow" aria-hidden="true">↗</span>
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

@media (pointer: coarse) {
  .receipt {
    min-height: 44px;
  }
}

.kind {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
}

/* Grid: equal columns so a set of sibling documents reads as one block
   instead of a ragged wrap. auto-fill (not auto-fit) keeps a short set at
   its natural column width rather than stretching one chip across the row. */
.link-strip[data-variant='grid'] {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--space-2) var(--space-3);
}

.link-strip[data-variant='grid'] .receipt {
  display: flex;
  width: 100%;
}

.link-strip[data-variant='grid'] .label {
  flex: 1;
}

.link-strip[data-variant='grid'] .arrow {
  color: var(--color-text-faint);
}

.link-strip[data-variant='grid'] .receipt:hover .arrow {
  color: inherit;
}
</style>
