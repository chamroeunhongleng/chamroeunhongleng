<script setup lang="ts">
import { ref, watch } from 'vue'
import { profile } from '~/data/portfolio'

const route = useRoute()
const menuOpen = ref(false)

const NAV = [
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Learning', to: '/learning' },
  { label: 'Now', to: '/#now' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]

function isCurrent(to: string): boolean {
  if (to.includes('#')) return false
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  }
)
</script>

<template>
  <header class="site-header">
    <div class="container header-row">
      <NuxtLink to="/" class="brand">
        <span class="monogram" aria-hidden="true">{{ profile.monogram }}</span>
        <span class="brand-name">{{ profile.name }}</span>
      </NuxtLink>

      <nav class="desktop-nav" aria-label="Main navigation">
        <ul role="list">
          <li v-for="item in NAV" :key="item.to">
            <NuxtLink
              :to="item.to"
              :aria-current="isCurrent(item.to) ? 'page' : undefined"
              class="nav-link"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="header-tools">
        <ThemeToggle />
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? 'Close' : 'Menu' }}
        </button>
      </div>
    </div>

    <nav v-show="menuOpen" id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">
      <ul role="list" class="container">
        <li v-for="item in NAV" :key="item.to">
          <NuxtLink
            :to="item.to"
            :aria-current="isCurrent(item.to) ? 'page' : undefined"
            class="nav-link"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 4rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
}

.monogram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border: 1.5px solid var(--color-text);
  border-radius: var(--radius-s);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-sm);
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 560;
  font-size: var(--text-base);
  letter-spacing: -0.01em;
}

.desktop-nav ul {
  display: flex;
  gap: var(--space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
}

.nav-link:hover {
  color: var(--color-accent);
}

.nav-link[aria-current='page'] {
  color: var(--color-text);
  font-weight: 620;
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.4em;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.menu-toggle {
  display: none;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
}

.mobile-nav {
  display: none;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.mobile-nav ul {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  padding-block: var(--space-5);
  margin: 0;
}

@media (max-width: 760px) {
  .desktop-nav {
    display: none;
  }

  .menu-toggle {
    display: inline-block;
  }

  .mobile-nav {
    display: block;
  }
}
</style>
