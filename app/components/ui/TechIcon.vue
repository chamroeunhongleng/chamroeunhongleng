<script setup lang="ts">
import { computed } from 'vue'
import { isDarkMark, techIcon } from '../../data/tech-icons'

/**
 * A technology mark. Decorative: the tool's name always sits next to it.
 *
 * By default it is drawn in currentColor. With `brand`, it takes the tool's own
 * colour (owner request, 2026-09-14) through a custom property rather than a
 * fill attribute; near-black marks switch back to the text colour in the dark
 * theme so they never disappear. An unknown slug renders nothing visible — a
 * stale content file never breaks a page, and check:content fails the build
 * for unknown slugs.
 */
const props = withDefaults(defineProps<{ icon?: string; brand?: boolean }>(), {
  icon: undefined,
  brand: false
})

const mark = computed(() => techIcon(props.icon))
const style = computed(() =>
  props.brand && mark.value ? { '--tech-brand': `#${mark.value.hex}` } : undefined
)
const darkMark = computed(() => props.brand && !!mark.value && isDarkMark(mark.value.hex))
</script>

<template>
  <svg
    v-if="mark"
    class="tech-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    :style="style"
    :data-brand="brand || undefined"
    :data-dark-mark="darkMark || undefined"
  >
    <path :d="mark.path" />
  </svg>
  <span v-else class="tech-icon tech-icon-fallback" aria-hidden="true" />
</template>

<style scoped>
.tech-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  fill: currentColor;
}

.tech-icon[data-brand] {
  fill: var(--tech-brand, currentColor);
}

/* No :global() wrapper: Vue drops everything after it, which left near-black
   marks invisible on the dark panel. The scope attribute lands on .tech-icon. */
:root[data-theme='dark'] .tech-icon[data-dark-mark] {
  fill: currentColor;
}

.tech-icon-fallback {
  width: 0.4em;
  height: 0.4em;
  margin-inline: 0.3em;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
}
</style>
