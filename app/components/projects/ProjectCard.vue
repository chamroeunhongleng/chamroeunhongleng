<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '~~/shared/schemas/index'
import { PILLAR_TITLES } from '~~/shared/schemas/index'
import DeploymentBadge from '../ui/DeploymentBadge.vue'
import EvidenceLabel from '../ui/EvidenceLabel.vue'
import MarkedText from '../ui/MarkedText.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import TagList from '../ui/TagList.vue'

const props = withDefaults(
  defineProps<{ project: Project; headingLevel?: 'h2' | 'h3' }>(),
  { headingLevel: 'h3' }
)

const pillarNames = computed(() =>
  props.project.pillars.map((p) => PILLAR_TITLES[p]).join(' · ')
)
const proof = computed(() => props.project.evidence[0])
// A clickable live product/demo link, surfaced so recruiters reach the real
// thing in one click (sits above the stretched card link).
const liveLink = computed(() =>
  props.project.publicLinks.find((l) => l.kind === 'demo' || l.kind === 'website')
)
</script>

<template>
  <article class="project-card" :data-demo="project.demo || undefined">
    <img
      v-if="project.cover"
      :src="project.cover.src"
      :alt="project.cover.alt"
      class="card-cover"
      loading="lazy"
    >
    <div class="card-top">
      <StatusBadge :status="project.status" />
      <DeploymentBadge :deployment="project.deployment" />
      <span class="year mono">{{ project.timeline.label }}</span>
    </div>

    <component :is="headingLevel" class="card-title">
      <NuxtLink :to="`/projects/${project.slug}`" class="card-link">
        <MarkedText :text="project.name" />
      </NuxtLink>
    </component>

    <p class="card-pillars">{{ pillarNames }}</p>
    <p class="card-summary"><MarkedText :text="project.oneLiner" /></p>

    <div v-if="proof" class="card-proof">
      <p class="proof-label">Proof</p>
      <p v-if="proof.link" class="proof-text">
        <a :href="proof.link" target="_blank" rel="noopener" class="proof-link">
          <MarkedText :text="proof.text" />
          <span aria-hidden="true">↗</span>
        </a>
      </p>
      <p v-else class="proof-text"><MarkedText :text="proof.text" /></p>
      <EvidenceLabel :evidence="proof.evidence" :link="proof.link" />
    </div>

    <div class="card-bottom">
      <TagList :tags="project.tags" :max="4" />
      <span class="card-actions">
        <a
          v-if="liveLink"
          :href="liveLink.url"
          target="_blank"
          rel="noopener"
          class="live-link"
        >Visit site<span aria-hidden="true"> ↗</span></a>
        <span class="card-action" aria-hidden="true">Case study →</span>
      </span>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.project-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-2);
  transform: translateY(-2px);
}

.project-card[data-demo] {
  border-style: dashed;
}

.card-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
}

.card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.year {
  margin-inline-start: auto;
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

.card-title {
  font-size: var(--text-xl);
}

.card-title a {
  color: var(--color-text);
  text-decoration: none;
}

.project-card:hover .card-title a {
  color: var(--color-accent);
}

.card-pillars {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-accent-2);
}

.card-summary {
  color: var(--color-text-muted);
  max-width: 70ch;
}

.card-proof {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-sunken);
  border-radius: var(--radius-m);
  justify-items: start;
}

.proof-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.proof-text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.proof-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 0.15em;
  text-decoration-thickness: 1px;
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  transition: all 0.2s ease;
}

.proof-link:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.proof-link span[aria-hidden] {
  opacity: 0.6;
  font-size: 0.85em;
}

.card-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  padding-top: var(--space-3);
}

.card-actions {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
}

.card-action {
  font-size: var(--text-sm);
  font-weight: 560;
  color: var(--color-accent);
  white-space: nowrap;
}

/* Sits above the stretched card link so it is independently clickable. */
.live-link {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: 560;
  white-space: nowrap;
  text-decoration: none;
  border: 1px solid var(--color-accent);
  border-radius: 999px;
  padding: 0.45em 0.95em;
  color: var(--color-accent);
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.live-link:hover {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

@media (pointer: coarse) {
  .live-link {
    min-height: 44px;
  }
}
</style>
