<script setup lang="ts">
/**
 * Section heading with eyebrow. Pass as="h1" for the page-level heading so
 * every page has exactly one h1 with no skipped levels below it.
 */
withDefaults(defineProps<{ eyebrow: string; title: string; text?: string; as?: 'h1' | 'h2' }>(), {
  text: undefined,
  as: 'h2'
})
</script>

<template>
  <header class="section-heading">
    <p class="eyebrow">{{ eyebrow }}</p>
    <component :is="as" class="heading-title"><MarkedText :text="title" /></component>
    <p v-if="text" class="lede"><MarkedText :text="text" /></p>
  </header>
</template>

<style scoped>
.section-heading {
  display: grid;
  gap: var(--space-3);
  margin-bottom: var(--space-7);
}

/* Same visual size regardless of semantic level. */
.heading-title {
  font-size: var(--text-2xl);
}
</style>
