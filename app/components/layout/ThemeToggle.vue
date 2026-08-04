<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * Dark/light toggle. The anti-FOUC script in nuxt.config sets the initial
 * data-theme before paint; this component only reads and flips it.
 */
const theme = ref<'light' | 'dark'>('light')

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
})

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  document.documentElement.style.colorScheme = theme.value
  try {
    localStorage.setItem('theme', theme.value)
  } catch {
    /* storage unavailable (private mode) — theme still applies for the session */
  }
}
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    role="switch"
    :aria-checked="theme === 'dark'"
    aria-label="Dark theme"
    @click="toggle"
  >
    <span class="track" aria-hidden="true">
      <span class="thumb">{{ theme === 'dark' ? '☾' : '☀' }}</span>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
}

.track {
  display: inline-flex;
  align-items: center;
  width: 3rem;
  height: 1.6rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  padding: 0 0.15rem;
  background: var(--color-surface-sunken);
  transition: background var(--duration-fast) var(--ease-out);
}

.thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.7rem;
  line-height: 1;
  transition: transform var(--duration-base) var(--ease-out);
}

.theme-toggle[aria-checked='true'] .thumb {
  transform: translateX(1.35rem);
}
</style>
