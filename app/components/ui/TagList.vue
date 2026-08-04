<script setup lang="ts">
import { computed } from 'vue'

/** Tech/topic chips with an overflow counter instead of endless wrapping. */
const props = withDefaults(defineProps<{ tags: readonly string[]; max?: number }>(), { max: 5 })

const visible = computed(() => props.tags.slice(0, props.max))
const overflow = computed(() => props.tags.length - props.max)
</script>

<template>
  <ul class="tag-list" role="list">
    <li v-for="tag in visible" :key="tag" class="tag">{{ tag }}</li>
    <li v-if="overflow > 0" class="tag tag-more">+{{ overflow }}</li>
  </ul>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.15em 0.7em;
  white-space: nowrap;
}

.tag-more {
  border-style: dashed;
  color: var(--color-text-faint);
}
</style>
