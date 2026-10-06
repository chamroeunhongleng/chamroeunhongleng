<script setup lang="ts">
import { computed } from 'vue'
import { institutionAbbreviation } from '../../utils/institution'

// Deliberately a typographic plaque, never the institution's trademarked logo.
// aria-hidden: the full institution name is real text beside it in the markup.
const props = defineProps<{ institution: string }>()

const abbreviation = computed(() => institutionAbbreviation(props.institution))
</script>

<template>
  <span class="institution-mark" aria-hidden="true">{{ abbreviation }}</span>
</template>

<style scoped>
.institution-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.9rem;
  height: 2.9rem;
  padding-inline: var(--space-2);
  border: 1.5px solid var(--color-text);
  border-radius: var(--radius-s);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  line-height: 1;
  white-space: nowrap;
}
</style>
