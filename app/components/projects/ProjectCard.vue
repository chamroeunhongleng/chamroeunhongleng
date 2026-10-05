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
  defineProps<{
    project: Project
    headingLevel?: 'h2' | 'h3'
    /** Position label ("01") shown in the card's corner. */
    index?: string
    /** Tags with technology marks (tagItemsFor); falls back to plain tags. */
    tagItems?: ReadonlyArray<{ name: string; icon?: string }>
  }>(),
  { headingLevel: 'h3', index: undefined, tagItems: undefined }
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
    <div v-if="project.cover" class="card-media">
      <img
        :src="project.cover.src"
        :alt="project.cover.alt"
        :width="project.cover.width"
        :height="project.cover.height"
        class="card-cover"
        loading="lazy"
        decoding="async"
      >
    </div>

    <div class="card-body">
      <div class="card-top">
        <span v-if="index" class="card-index" aria-hidden="true">{{ index }}</span>
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
        <TagList :tags="project.tags" :items="tagItems" :max="4" />
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
    </div>
  </article>
</template>

<style scoped>
.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.project-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-raised);
  transform: translateY(-2px);
}

.project-card[data-demo] {
  border-style: dashed;
}

.card-media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-sunken);
  border-bottom: 1px solid var(--color-border);
}

.card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform var(--duration-base) var(--ease-out);
}

.project-card:hover .card-cover {
  transform: scale(1.02);
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6) var(--space-6);
}

.card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.card-index {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-strong);
  color: var(--color-text-faint);
  margin-inline-end: var(--space-1);
}

.year {
  margin-inline-start: auto;
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

.card-title {
  font-size: var(--text-2xl);
}

.card-title a {
  color: var(--color-text);
  text-decoration: none;
}

/* The stretched card link.
 *
 * .project-card carries the `position: relative` this needs, .live-link lifts
 * itself to z-index 2 "above the stretched card link", and "Case study →" is an
 * aria-hidden span rather than a link — the card itself is the target. The <a>
 * keeps the accessible name and stays the single tab stop; the overlay only
 * extends where a pointer counts as hitting it.
 */
.card-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

/* Anything genuinely separate must sit above the overlay or it stops being
   clickable. .live-link handles itself; these two are covered by it. */
.proof-link,
.card-proof .evidence-link {
  position: relative;
  z-index: 2;
}

.project-card:hover .card-title a {
  color: var(--color-accent);
}

.card-pillars {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
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
  transition:
    color var(--duration-fast) var(--ease-out),
    text-decoration-color var(--duration-fast) var(--ease-out);
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
  font-weight: var(--weight-strong);
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
  font-weight: var(--weight-strong);
  white-space: nowrap;
  text-decoration: none;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-pill);
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

@media (max-width: 480px) {
  .card-body {
    padding: var(--space-4) var(--space-5) var(--space-5);
  }
}
</style>
