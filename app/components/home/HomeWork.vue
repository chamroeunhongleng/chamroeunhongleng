<script setup lang="ts">
import { ref } from 'vue'
import { featuredProjects, tagItemsFor } from '~/data/portfolio'

// The flagship (flagship: true in the project JSON) leads; the rest keep the
// loader's status-ranked order.
const flagship = featuredProjects.find((p) => p.flagship)
const workProjects = flagship
  ? [flagship, ...featuredProjects.filter((p) => p !== flagship)]
  : featuredProjects

const row = ref<HTMLUListElement | null>(null)

function scrollRow(direction: 1 | -1) {
  const el = row.value
  if (!el) return
  const first = el.querySelector('li')
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  const step = (first?.getBoundingClientRect().width ?? el.clientWidth) + gap
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * step, behavior: reduced ? 'auto' : 'smooth' })
}
</script>

<template>
  <section id="work" class="section" aria-labelledby="work-title">
    <div class="container">
      <SectionHeading
        id="work-title"
        eyebrow="Projects"
        title="What I've been building"
        mark="building"
        text="Every card carries two labels: how far along the project is, and whether it really runs somewhere."
      >
        <template #aside>
          <div class="row-controls">
            <button type="button" class="icon-btn row-arrow" aria-label="Previous project" @click="scrollRow(-1)">
              <Glyph name="arrow-left" />
            </button>
            <button type="button" class="icon-btn row-arrow" aria-label="Next project" @click="scrollRow(1)">
              <Glyph name="arrow-right" />
            </button>
            <NuxtLink to="/projects" class="pill">See all projects <Glyph name="arrow-right" /></NuxtLink>
          </div>
        </template>
      </SectionHeading>

      <ul ref="row" class="work-row bleed" role="list">
        <li v-for="project in workProjects" :key="project.slug" data-reveal>
          <WorkCard :project="project" :tags="tagItemsFor(project)" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.row-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.work-row {
  display: flex;
  gap: var(--space-5);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--container-pad);
  padding-block: var(--space-2) var(--space-5);
  margin-block: 0;
  list-style: none;
  scrollbar-width: thin;
}

.work-row > li {
  flex: 0 0 min(26rem, 82vw);
  scroll-snap-align: start;
}

@media (max-width: 760px) {
  .row-arrow {
    display: none;
  }

  .work-row {
    gap: var(--space-3);
    scrollbar-width: none;
  }

  .work-row::-webkit-scrollbar {
    display: none;
  }
}
</style>
