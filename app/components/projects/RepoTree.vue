<script setup lang="ts">
import { computed } from 'vue'
import type { RepoStructure } from '~~/shared/schemas/index'
import MarkedText from '../ui/MarkedText.vue'

/**
 * Renders a repository's file tree as the architecture evidence itself —
 * the layout a reader can inspect, not a paragraph describing one.
 *
 * The connectors are computed, never authored: content stores depth only, so
 * a row cannot claim a shape the tree does not have.
 */
const props = defineProps<{ structure: RepoStructure }>()

const rows = computed(() => {
  const entries = props.structure.entries
  // Whether the ancestor at each depth still has siblings below it — that is
  // what decides between a "│" spine and blank space in deeper rows.
  const openAtDepth: boolean[] = []

  return entries.map((entry, i) => {
    let last = true
    for (let j = i + 1; j < entries.length; j++) {
      const depth = entries[j]!.depth
      if (depth < entry.depth) break
      if (depth === entry.depth) {
        last = false
        break
      }
    }
    openAtDepth[entry.depth] = !last

    let indent = ''
    for (let d = 0; d < entry.depth; d++) indent += openAtDepth[d] ? '│   ' : '    '

    return {
      key: `${i}-${entry.name}`,
      prefix: `${indent}${last ? '└── ' : '├── '}`,
      name: entry.name,
      note: entry.note,
      directory: entry.name.endsWith('/')
    }
  })
})
</script>

<template>
  <figure class="repo-tree">
    <figcaption>
      <p class="repo-kind">Repository structure</p>
      <p class="repo-root mono">{{ structure.root }}</p>
      <p class="repo-desc"><MarkedText :text="structure.description" /></p>
      <p class="repo-evidence mono">{{ structure.evidence }}</p>
    </figcaption>

    <!-- Scrollable regions must be reachable without a mouse, hence tabindex
         and the group label; the connectors themselves are decoration, so a
         screen reader hears "tools/ — deterministic core", not box-drawing. -->
    <div
      class="tree-scroll"
      tabindex="0"
      role="group"
      :aria-label="`File tree of ${structure.root}`"
    >
      <ul role="list">
        <li v-for="row in rows" :key="row.key" :data-dir="row.directory || undefined">
          <span class="entry mono"><span class="branch" aria-hidden="true">{{ row.prefix }}</span><span class="path">{{ row.name }}</span></span>
          <span v-if="row.note" class="note">{{ row.note }}</span>
        </li>
      </ul>
    </div>
  </figure>
</template>

<style scoped>
.repo-tree {
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

.repo-kind {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-accent-2);
}

.repo-root {
  font-size: var(--text-lg);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.repo-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: var(--prose-max);
}

.repo-evidence {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

/* The tree is long by nature — scroll it in place rather than let one file
   listing set the rhythm of the whole case study. */
.tree-scroll {
  max-height: clamp(22rem, 55vh, 34rem);
  overflow: auto;
  overscroll-behavior: contain;
  padding: var(--space-4) var(--space-5);
}

.tree-scroll:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: -2px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  /* Two aligned columns — path, then the reason it exists. */
  display: grid;
  grid-template-columns: max-content minmax(12rem, 1fr);
  column-gap: var(--space-5);
  width: max-content;
  min-width: 100%;
}

li {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-items: baseline;
  line-height: 1.7;
}

/* Connector and name share one cell — split across two grid children they
   would stack as separate rows. */
.entry {
  grid-column: 1;
  white-space: pre;
  font-size: var(--text-xs);
  color: var(--color-text);
}

.branch {
  color: var(--color-border-strong);
}

li[data-dir] .path {
  color: var(--color-accent);
  font-weight: 500;
}

.note {
  grid-column: 2;
  font-size: var(--text-xs);
  line-height: 1.7;
  color: var(--color-text-faint);
}

/* Without subgrid the notes cannot share a column; keep them legible inline
   rather than let them collide with the paths. */
@supports not (grid-template-columns: subgrid) {
  ul {
    display: block;
    width: auto;
  }

  li {
    display: block;
    white-space: nowrap;
  }

  .note {
    margin-inline-start: var(--space-4);
  }

  .note::before {
    content: '# ';
  }
}

/* Phones: one column. The note drops under its path and the tree stops
   forcing a horizontal scroll just to read the annotations. */
@media (max-width: 760px) {
  ul {
    display: block;
    width: auto;
  }

  li {
    display: block;
    padding-block: var(--space-1);
  }

  .note {
    display: block;
    padding-inline-start: var(--space-4);
  }
}
</style>
