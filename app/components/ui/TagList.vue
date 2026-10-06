<script setup lang="ts">
import { computed } from 'vue'
import TechIcon from './TechIcon.vue'

const props = withDefaults(
  defineProps<{
    tags?: readonly string[]
    items?: ReadonlyArray<{ name: string; icon?: string }>
    max?: number
  }>(),
  { tags: () => [], items: undefined, max: 5 }
)

const all = computed(() =>
  props.items && props.items.length > 0 ? props.items : props.tags.map((name) => ({ name, icon: undefined }))
)
const visible = computed(() => all.value.slice(0, props.max))
const overflow = computed(() => all.value.length - props.max)
</script>

<template>
  <ul class="tag-list" role="list">
    <li v-for="item in visible" :key="item.name" class="tag">
      <TechIcon v-if="item.icon" :icon="item.icon" brand />{{ item.name }}
    </li>
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
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 0.3em 0.75em;
  white-space: nowrap;
}

.tag-more {
  border-style: dashed;
  color: var(--color-text-faint);
}
</style>
