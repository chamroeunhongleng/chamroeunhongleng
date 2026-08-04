<script setup lang="ts">
import { computed } from 'vue'
import { segmentText } from '~~/shared/markers'
import PlaceholderTag from './PlaceholderTag.vue'

/**
 * Renders a content string, replacing placeholder markers with visible
 * chips. All prose from content JSON should render through this component
 * so unfinished fields are impossible to miss during review.
 */
const props = withDefaults(defineProps<{ text: string; tag?: string }>(), { tag: 'span' })

const segments = computed(() => segmentText(props.text))
</script>

<template>
  <component :is="tag">
    <template v-for="(segment, i) in segments" :key="i">
      <template v-if="segment.kind === 'text'">{{ segment.text }}</template>
      <PlaceholderTag v-else :marker="segment.marker" />
    </template>
  </component>
</template>
