<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { profile } from '~/data/portfolio'

const route = useRoute()
const menuOpen = ref(false)
const menuToggle = ref<HTMLButtonElement | null>(null)

// Hands focus back to the toggle so keyboard users are not stranded after Escape.
function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuToggle.value?.focus()
}

// Six items is what one line holds in the 821–1040px band.
const NAV = [
  { label: 'Projects', to: '/projects' },
  { label: 'Now', to: '/#now' },
  { label: 'About', to: '/about' },
  { label: 'Journey', to: '/journey' },
  { label: 'CV', to: '/cv' },
  { label: 'Contact', to: '/contact' }
]

// The one profile surfaced as a header button — found by host, not label.
const github = computed(() =>
  profile.links.find((link) => {
    try {
      return new URL(link.url).hostname.replace(/^www\./, '') === 'github.com'
    } catch {
      return false
    }
  })
)

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
  <header class="site-header" @keydown.escape="closeMenu">
    <div class="container header-shell">
      <div class="header-row">
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
          <SocialProfileLink
            v-if="github"
            :label="github.label"
            :url="github.url"
            tone="muted"
            icon-only
            round
          />
          <ThemeToggle />
          <button
            ref="menuToggle"
            type="button"
            class="menu-toggle icon-btn"
            :aria-expanded="menuOpen"
            aria-controls="mobile-nav"
            @click="menuOpen = !menuOpen"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            >
              <path v-if="menuOpen" d="M6 6l12 12M18 6 6 18" />
              <path v-else d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span class="visually-hidden">{{ menuOpen ? 'Close' : 'Menu' }}</span>
          </button>
        </div>
      </div>

      <nav v-show="menuOpen" id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">
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
    </div>
  </header>
</template>

<style scoped>
/* A floating pill: the header itself is transparent and lets clicks through
   its gutters; only the bar and the open menu take pointer events. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding-top: var(--header-offset);
  pointer-events: none;
}

.header-row,
.mobile-nav {
  pointer-events: auto;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  min-height: var(--header-h);
  /* At a large OS font scale or high browser zoom the row reflows onto two
     lines instead of the brand and the controls colliding. */
  flex-wrap: wrap;
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-header);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
  min-width: 0;
}

.monogram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: var(--radius-m);
  background: var(--color-text);
  color: var(--color-bg);
  font-family: var(--font-display);
  font-weight: var(--weight-display);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-heading);
}

.brand-name {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: var(--text-base);
  letter-spacing: var(--tracking-heading);
  /* Never break across two lines (it doubles the header height) and never
     paint over the controls: when the row runs out of room the name clips. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.desktop-nav ul {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-pill);
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  transition:
    color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-sunken);
}

.nav-link[aria-current='page'] {
  color: var(--color-text);
  background: var(--color-surface-sunken);
  font-weight: var(--weight-strong);
}

@media (pointer: coarse) {
  .brand,
  .desktop-nav .nav-link {
    min-height: 44px;
  }
}

.header-tools {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.menu-toggle {
  display: none;
}

.mobile-nav {
  display: none;
  margin-top: var(--space-2);
  padding: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-header);
  /* A long menu stays reachable on short landscape viewports. */
  max-height: calc(100dvh - 6rem);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.mobile-nav ul {
  display: grid;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav .nav-link {
  display: flex;
  min-height: 44px;
  padding-inline: var(--space-4);
  border-radius: var(--radius-m);
  font-size: var(--text-base);
}

/* Tighter spacing so six links, the brand and two icon buttons still fit one line
   (~676px of a ~755px row at 821px). Guarded by the header-height assertion in responsive.spec.ts. */
@media (min-width: 821px) and (max-width: 1040px) {
  .header-row {
    gap: var(--space-3);
  }

  .desktop-nav ul {
    gap: 0;
  }

  .nav-link {
    padding-inline: var(--space-2);
  }

  .brand-name {
    font-size: var(--text-sm);
  }
}

/* 820px so iPad portrait (810px) gets the menu and no width wraps the header.
   Keep MOBILE_BREAKPOINT in responsive.spec.ts in sync. */
@media (max-width: 820px) {
  .desktop-nav {
    display: none;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .mobile-nav {
    display: block;
  }

  .header-row {
    gap: var(--space-2);
    padding-inline-start: var(--space-3);
  }

  .brand {
    gap: var(--space-2);
  }

  .brand-name {
    font-size: var(--text-sm);
  }
}

/* Phones: the header scrolls away; MobileDock is the navigation that stays, and
   a phone has no room for two fixed bars. */
@media (max-width: 760px) {
  .site-header {
    position: relative;
  }
}

/* em (450px at 16px), not px, so the name retires when it stops fitting at any font scale.
   Visually hidden, not display:none: the monogram is aria-hidden, so the link needs this name. */
@media (max-width: 28.125em) {
  .brand-name {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
