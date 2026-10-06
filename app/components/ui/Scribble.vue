<script setup lang="ts">
import { computed } from 'vue'

// Hand-drawn pen strokes: always decorative (aria-hidden) and drawn in currentColor.
type Variant = 'underline' | 'arrow' | 'loop'

const SHAPES: Record<Variant, { box: string; d: string; stretch: boolean }> = {
  underline: {
    box: '0 0 200 16',
    d: 'M3 7C34 2 62 11 96 6s58-5 101 1M22 13c40-4 92-3 150 0',
    stretch: true
  },
  arrow: {
    box: '0 0 64 48',
    d: 'M58 44C52 24 36 11 11 8M23 2 10 8l8 13',
    stretch: false
  },
  loop: {
    box: '0 0 200 60',
    d: 'M104 6C40 2 6 18 8 33c3 20 70 24 122 21 46-3 66-16 61-30C186 9 128 3 86 9',
    stretch: true
  }
}

const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'underline' })

const shape = computed(() => SHAPES[props.variant])
</script>

<template>
  <svg
    class="scribble"
    :data-variant="variant"
    :viewBox="shape.box"
    :preserveAspectRatio="shape.stretch ? 'none' : 'xMidYMid meet'"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="shape.d" vector-effect="non-scaling-stroke" />
  </svg>
</template>

<style scoped>
.scribble {
  display: inline-block;
  overflow: visible;
  stroke-width: var(--scribble-width, 2.5px);
}

.scribble[data-variant='arrow'] {
  width: 2.25rem;
  height: 1.7rem;
}
</style>
