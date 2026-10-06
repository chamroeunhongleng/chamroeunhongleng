<script setup lang="ts">
import type { PortfolioMode } from '~~/shared/schemas/index'

// The wording is fixed by the portfolio spec. Review-mode gaps show inline as
// PlaceholderTag chips instead of a banner.
defineProps<{ mode: PortfolioMode }>()
</script>

<template>
  <p v-if="mode === 'demo'" class="mode-banner" role="status">
    Demonstration portfolio — some personal information and project content are not final.
  </p>
</template>

<style scoped>
.mode-banner {
  margin: 0;
  padding: var(--space-2) var(--space-4);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--color-accent-tint);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  max-width: none;
}
</style>
