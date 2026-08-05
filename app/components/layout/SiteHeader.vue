<script setup lang="ts">
import { ref, watch } from 'vue'
import { profile } from '~/data/portfolio'

const route = useRoute()
const menuOpen = ref(false)
const menuToggle = ref<HTMLButtonElement | null>(null)

// Escape closes the mobile menu and hands focus back to the toggle, so
// keyboard users are not stranded inside a panel that just disappeared.
function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuToggle.value?.focus()
}

const NAV = [
  { label: 'Projects', to: '/projects' },
  { label: 'Journey', to: '/journey' },
  { label: 'Learning', to: '/learning' },
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
  <header class="site-header" @keydown.escape="closeMenu">
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
        <a v-if="profile.cv" :href="profile.cv.url" class="cv-link mono" target="_blank" rel="noopener">
          {{ profile.cv.label }}
        </a>
        <ThemeToggle />
        <button
          ref="menuToggle"
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
  gap: var(--space-2) var(--space-4);
  min-height: 4rem;
  /* At a large OS font scale or high browser zoom the row reflows onto two
     lines instead of the brand and the controls colliding. */
  flex-wrap: wrap;
  padding-block: var(--space-2);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
  min-width: 0;
}

.monogram,
.menu-toggle,
.theme-toggle {
  flex: 0 0 auto;
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
  /* Never break across two lines (it doubles the header height) and never
     paint over the controls: when the row runs out of room the name clips. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.desktop-nav ul {
  display: flex;
  gap: var(--space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
}

.nav-link:hover {
  color: var(--color-accent);
}

@media (pointer: coarse) {
  .brand,
  .desktop-nav .nav-link {
    min-height: 44px;
  }
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

/* CV pill — renders only when profile.cv is set (see shared/schemas/site.ts). */
.cv-link {
  display: inline-flex;
  align-items: center;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  text-decoration: none;
  border: 1px solid var(--color-accent);
  border-radius: 999px;
  padding: 0.35em 0.9em;
  white-space: nowrap;
}

.cv-link:hover {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

@media (pointer: coarse) {
  .cv-link {
    min-height: 44px;
  }
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  padding: var(--space-2) var(--space-3);
  min-height: 44px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
}

.mobile-nav {
  display: none;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  /* A long menu stays reachable on short landscape viewports. */
  max-height: calc(100dvh - 4rem);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.mobile-nav ul {
  display: grid;
  gap: var(--space-1);
  list-style: none;
  padding-block: var(--space-3);
  margin: 0;
}

.mobile-nav .nav-link {
  display: flex;
  align-items: center;
  min-height: 44px;
  font-size: var(--text-base);
}

/* 820px, not 760px: measured, the desktop header (brand + five nav links + CV
   pill + theme toggle) only fits on one line from ~815px up. Switching to the
   desktop nav at 760px meant every width from 761–815px — including iPad
   portrait at 810px — rendered a wrapped, double-height header with the CV
   pill and theme toggle pushed onto a second row. The breakpoint now sits
   where the layout actually fits. Guarded by the header-height assertion in
   responsive.spec.ts; keep MOBILE_BREAKPOINT there in sync. */
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

  /* Tighten the row so brand + controls stay on one line down to 360px — the
     most common Android width, where the default spacing overshot by 2px and
     tipped the row onto a second line. space-between still holds them apart
     whenever there is room; this only lowers the minimum. */
  .header-row {
    gap: var(--space-2);
  }

  .header-tools {
    gap: var(--space-3);
  }

  .menu-toggle {
    padding-inline: var(--space-2);
  }

  .brand {
    gap: var(--space-2);
    min-width: 0;
  }

  .brand-name {
    font-size: var(--text-sm);
  }
}

/* Below 450px the full name cannot share the row with both controls, so the
   monogram carries the brand on its own.

   Measured, not guessed: sweeping the viewport 320–520px, the header row is
   64px tall (one line) up to 448px and 102px (two lines) from 360–448px with
   the name shown — it only fits again at 450px. The previous 22.4em (358px)
   threshold therefore left every common phone width (360, 375, 390, 393, 412,
   428) rendering a double-height header, which is exactly what it was meant to
   prevent. Covered by the header-height assertion in responsive.spec.ts.

   Deliberately in em, not px: media-query em tracks the browser's default font
   size, so raising the Android/Chrome font-scale setting retires the name at
   the point it stops fitting — the same trigger, expressed in the user's own
   units. 28.125em = 450px at the default 16px. */
@media (max-width: 28.125em) {
  .brand-name {
    display: none;
  }
}
</style>
