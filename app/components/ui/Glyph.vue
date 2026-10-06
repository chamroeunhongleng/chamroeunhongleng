<script setup lang="ts">
import { computed } from 'vue'

// Inline rather than from an icon CDN (the CSP allows img-src 'self' only), and
// decorative: every glyph sits next to text that carries the meaning.
type GlyphName =
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-down'
  | 'arrow-up-right'
  | 'mail'
  | 'check'
  | 'graduation-cap'
  | 'briefcase'
  | 'medal'
  | 'users'
  | 'book'
  | 'file'
  | 'pin'
  | 'home'
  | 'grid'
  | 'user'

const PATHS: Record<GlyphName, string> = {
  'home': 'M4 11.5 12 4l8 7.5M6.5 10v9.5h4V14h3v5.5h4V10',
  'grid': 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  'user': 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  'arrow-up-right': 'M7 17 17 7M8 7h9v9',
  'mail': 'M4 6h16v12H4zM4 7l8 6 8-6',
  'check': 'M5 12.5l4.5 4.5L19 7',
  'graduation-cap': 'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  'briefcase': 'M3 8h18v11H3zM8 8V5h8v3M3 13h18',
  'medal': 'M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8 3l3 7M16 3l-3 7M9 3h6',
  'users': 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M17 12a3 3 0 1 0 0-6M21.5 20a5 5 0 0 0-5-5',
  'book': 'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z',
  'file': 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  'pin': 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'
}

const props = withDefaults(defineProps<{ name: GlyphName; plaque?: boolean }>(), { plaque: false })

const d = computed(() => PATHS[props.name])
</script>

<template>
  <span v-if="plaque" class="glyph-plaque" aria-hidden="true">
    <svg
      class="glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <path :d="d" />
    </svg>
  </span>
  <svg
    v-else
    class="glyph"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>

<style scoped>
.glyph {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: 0 0 auto;
}

/* The tinted tile that heads a card — same footprint as InstitutionMark. */
.glyph-plaque {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-m);
  background: var(--color-accent-tint);
  color: var(--color-accent);
}

.glyph-plaque .glyph {
  width: 1.3rem;
  height: 1.3rem;
}
</style>
