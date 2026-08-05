<script setup lang="ts">
import { projects } from '~/data/portfolio'
import {
  PILLAR_TITLES,
  PILLARS,
  PROJECT_STATUSES,
  type PillarId
} from '~~/shared/schemas/index'
import { stripMarkers } from '~~/shared/markers'

usePageMeta({
  title: 'Projects',
  description:
    'Case studies across AI, software, business, and governance — each with honest status labels and evidence-labeled claims.'
})

const pillarFilter = ref<PillarId | 'all'>('all')
const statusFilter = ref<string>('all')
const search = ref('')

const activeStatuses = computed(() => {
  const present = new Set(projects.map((p) => p.status))
  return PROJECT_STATUSES.filter((s) => present.has(s))
})

const filtered = computed(() =>
  projects.filter((p) => {
    if (pillarFilter.value !== 'all' && !p.pillars.includes(pillarFilter.value)) return false
    if (statusFilter.value !== 'all' && p.status !== statusFilter.value) return false
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase()
      const haystack = [
        stripMarkers(p.name),
        stripMarkers(p.oneLiner),
        ...p.tags,
        ...p.pillars.map((id) => PILLAR_TITLES[id])
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
)
</script>

<template>
  <div class="projects-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="Projects"
        title="Built, tested, and labeled honestly"
        text="Every project carries two independent labels — lifecycle status and deployment reality — plus evidence-labeled claims. Prototypes are called prototypes here."
      />

      <div class="filter-bar">
        <div class="filter-group" role="group" aria-label="Filter by pillar">
          <button
            type="button"
            class="chip"
            :aria-pressed="pillarFilter === 'all'"
            @click="pillarFilter = 'all'"
          >
            All pillars
          </button>
          <button
            v-for="id in PILLARS"
            :key="id"
            type="button"
            class="chip"
            :aria-pressed="pillarFilter === id"
            @click="pillarFilter = id"
          >
            {{ PILLAR_TITLES[id] }}
          </button>
        </div>

        <div class="filter-controls">
          <label class="control">
            <span class="control-label">Status</span>
            <select v-model="statusFilter">
              <option value="all">All</option>
              <option v-for="status in activeStatuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </label>
          <label class="control">
            <span class="control-label">Search</span>
            <input
              v-model="search"
              type="search"
              placeholder="Name, tag, topic…"
              autocomplete="off"
            >
          </label>
        </div>
      </div>

      <p class="result-count" role="status" aria-live="polite">
        {{ filtered.length }} project{{ filtered.length === 1 ? '' : 's' }} shown
      </p>

      <div v-if="filtered.length" class="project-grid">
        <ProjectCard v-for="project in filtered" :key="project.slug" :project="project" heading-level="h2" />
      </div>
      <p v-else class="empty-state">
        Nothing matches those filters — try clearing the search or picking another pillar.
      </p>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: grid;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  display: inline-flex;
  align-items: center;
  font-size: var(--text-sm);
  padding: 0.45em 0.9em;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  color: var(--color-text-muted);
  /* Flex items default to min-width:auto — without this a long pillar name
     ("Governance & Commercial Rules") runs off a 320px screen. */
  max-width: 100%;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.chip:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.chip[aria-pressed='true'] {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-contrast);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.control {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  flex: 1 1 12rem;
  max-width: 22rem;
}

.control-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
}

select,
input[type='search'] {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-m);
  padding: 0.45em 0.8em;
  font-size: var(--text-sm);
  color: var(--color-text);
  width: 100%;
  min-width: 0;
}

@media (pointer: coarse) {
  .chip,
  select,
  input[type='search'] {
    min-height: 44px;
  }

  /* iOS Safari zooms the page when a focused field is under 16px. */
  select,
  input[type='search'] {
    font-size: var(--text-base);
  }
}

.result-count {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  margin-bottom: var(--space-5);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.empty-state {
  color: var(--color-text-muted);
  padding: var(--space-8) 0;
}

@media (max-width: 1040px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
