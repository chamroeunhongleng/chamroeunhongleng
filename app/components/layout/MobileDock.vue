<script setup lang="ts">
// On a phone the header scrolls away with the page, so this is the navigation that stays.
type DockGlyph = 'home' | 'grid' | 'user' | 'mail'

const ITEMS: Array<{ label: string; to: string; glyph: DockGlyph }> = [
  { label: 'Home', to: '/', glyph: 'home' },
  { label: 'Projects', to: '/projects', glyph: 'grid' },
  { label: 'About', to: '/about', glyph: 'user' },
  { label: 'Contact', to: '/contact', glyph: 'mail' }
]

const route = useRoute()

function isCurrent(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <nav class="mobile-dock" aria-label="Quick navigation">
    <ul role="list">
      <li v-for="item in ITEMS" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="dock-link"
          :aria-current="isCurrent(item.to) ? 'page' : undefined"
        >
          <Glyph :name="item.glyph" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.mobile-dock {
  display: none;
}

@media (max-width: 760px) {
  .mobile-dock {
    display: block;
    position: fixed;
    left: var(--space-3);
    /* Leaves the chat launcher its seat on the right: same height, same
       baseline, so the two read as one bar. */
    right: calc(var(--space-3) + var(--dock-h) + var(--space-2));
    bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    /* Above the page and the header (50), below the chat widget (60). */
    z-index: 55;
    height: var(--dock-h);
    background: color-mix(in srgb, var(--color-surface) 95%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-header);
  }

  ul {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    height: 100%;
    margin: 0;
    padding: 0 var(--space-1);
    list-style: none;
  }

  li {
    display: grid;
  }

  .dock-link {
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 2px;
    margin-block: var(--space-1);
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    line-height: 1;
    color: var(--color-text-muted);
    text-decoration: none;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
  }

  .dock-link .glyph {
    width: 1.25rem;
    height: 1.25rem;
  }

  .dock-link[aria-current='page'] {
    color: var(--color-accent);
    background: var(--color-accent-tint);
    font-weight: var(--weight-strong);
  }
}

@media print {
  .mobile-dock {
    display: none !important;
  }
}
</style>
