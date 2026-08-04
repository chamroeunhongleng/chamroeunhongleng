<script setup lang="ts">
import { computed } from 'vue'
import type { DeploymentReality } from '~~/shared/schemas/index'

/**
 * Deployment-reality badge — deliberately separate from lifecycle status
 * so a polished prototype can never read as a shipped product.
 */
const props = defineProps<{ deployment: DeploymentReality }>()

const slug = computed(() => props.deployment.toLowerCase().replaceAll(' ', '-'))
</script>

<template>
  <span class="deploy-badge" :data-deployment="slug">{{ deployment }}</span>
</template>

<style scoped>
.deploy-badge {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.deploy-badge[data-deployment='deployed'] {
  border-color: var(--color-positive);
  color: var(--color-positive);
}

.deploy-badge[data-deployment='public-demo'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.deploy-badge[data-deployment='planned'],
.deploy-badge[data-deployment='not-deployed'],
.deploy-badge[data-deployment='local-only'] {
  border-style: dashed;
}
</style>
