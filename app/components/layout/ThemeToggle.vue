<script setup lang="ts">
import { onMounted, ref } from 'vue'

// The anti-FOUC script in nuxt.config sets the initial data-theme; this only reads and flips it.
const theme = ref<'light' | 'dark'>('light')

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
})

// Keeps the phone browser chrome in step with the page; values track --color-bg in tokens.css.
function paintBrowserChrome(next: 'light' | 'dark') {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = next === 'dark' ? '#131318' : '#FAF7F2'
}

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  document.documentElement.style.colorScheme = theme.value
  paintBrowserChrome(theme.value)
  try {
    localStorage.setItem('theme', theme.value)
  } catch {
    /* storage unavailable (private mode) — theme still applies for the session */
  }
}
</script>

<template>
  <!-- The icon shows the theme you are in; the switch state says the same. -->
  <button
    class="theme-toggle icon-btn"
    type="button"
    role="switch"
    :aria-checked="theme === 'dark'"
    aria-label="Dark theme"
    @click="toggle"
  >
    <svg
      v-if="theme === 'dark'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  </button>
</template>
