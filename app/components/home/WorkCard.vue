<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '~~/shared/schemas/index'
import DeploymentBadge from '../ui/DeploymentBadge.vue'
import Glyph from '../ui/Glyph.vue'
import MarkedText from '../ui/MarkedText.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import TagList from '../ui/TagList.vue'

/**
 * A homepage project card: screenshot, both honesty labels, one line, stack
 * chips. The whole card opens the case study (one real link, stretched); the
 * square button opens the live product or repository on its own.
 */
const props = defineProps<{
  project: Project
  tags: ReadonlyArray<{ name: string; icon?: string }>
}>()

const external = computed(
  () =>
    props.project.publicLinks.find((l) => l.kind === 'demo' || l.kind === 'website')
    ?? props.project.publicLinks.find((l) => l.kind === 'repository')
)
</script>

<template>
  <article class="work-card card card-lift">
    <div class="work-cover">
      <!-- alt is empty on purpose: the project name sits right below, so a
           description here would only pad the link's accessible name. The full
           alt rides the same image on the case study. -->
      <img
        v-if="project.cover"
        :src="project.cover.src"
        alt=""
        :width="project.cover.width"
        :height="project.cover.height"
        loading="lazy"
        decoding="async"
      >
    </div>
    <div class="work-body">
      <div class="work-badges">
        <StatusBadge :status="project.status" />
        <DeploymentBadge :deployment="project.deployment" />
      </div>
      <h3 class="work-name">
        <NuxtLink :to="`/projects/${project.slug}`" class="card-link">
          <MarkedText :text="project.name" />
        </NuxtLink>
      </h3>
      <p class="work-oneliner"><MarkedText :text="project.oneLiner" /></p>
      <TagList :items="tags" :max="4" />
      <div class="work-foot">
        <span class="pill work-more" aria-hidden="true">Case study <Glyph name="arrow-right" /></span>
        <a
          v-if="external"
          :href="external.url"
          target="_blank"
          rel="noopener"
          class="icon-btn icon-btn-square work-external"
          :aria-label="`${project.name}: ${external.label} (opens in a new tab)`"
        >
          <Glyph name="arrow-up-right" />
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.work-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.work-cover {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-sunken);
  border-bottom: 1px solid var(--color-border);
}

.work-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform var(--duration-base) var(--ease-out);
}

.work-card:hover .work-cover img {
  transform: scale(1.02);
}

.work-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
}

.work-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.work-name {
  font-size: var(--text-xl);
}

.work-name a {
  color: var(--color-text);
  text-decoration: none;
}

.work-card:hover .work-name a {
  color: var(--color-accent);
}

/* The stretched link's overlay keeps the card's rounded corners. */
.work-name .card-link::after {
  border-radius: inherit;
}

.work-oneliner {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.work-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-2);
}

.work-more .glyph {
  width: 1rem;
  height: 1rem;
}

/* Sits above the stretched card link so it stays independently clickable. */
.work-external {
  position: relative;
  z-index: 2;
}
</style>
