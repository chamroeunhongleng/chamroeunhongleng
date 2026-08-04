<script setup lang="ts">
import { learning } from '~/data/portfolio'

usePageMeta({
  title: 'Learning',
  description:
    'A live log of what Chamroeun Hongleng is studying across AI, software, business, and governance — curiosity with progress, not claimed expertise.'
})
</script>

<template>
  <div class="learning-page section">
    <div class="container">
      <SectionHeading as="h1" eyebrow="Learning" title="Studying in public" :text="learning.intro" />

      <!-- Disciplines -->
      <div class="discipline-grid">
        <article
          v-for="discipline in learning.disciplines"
          :key="discipline.pillar"
          class="discipline"
          :aria-labelledby="`discipline-${discipline.pillar}`"
        >
          <h2 :id="`discipline-${discipline.pillar}`" class="discipline-title">{{ discipline.title }}</h2>
          <p class="stance"><MarkedText :text="discipline.stance" /></p>
          <ul role="list" class="focus-list">
            <li v-for="(item, i) in discipline.currentFocus" :key="i">
              <MarkedText :text="item" />
            </li>
          </ul>
        </article>
      </div>

      <!-- Experiments -->
      <section class="block" aria-labelledby="experiments-title">
        <h2 id="experiments-title" class="block-title">Experiments</h2>
        <p class="block-note">
          Each experiment is a falsifiable question. Some have case studies; all have honest states.
        </p>
        <ul role="list" class="experiment-list">
          <li v-for="experiment in learning.experiments" :key="experiment.title" class="experiment">
            <div>
              <p class="experiment-name">{{ experiment.title }}</p>
              <p class="experiment-question"><MarkedText :text="experiment.question" /></p>
            </div>
            <div class="experiment-side">
              <WorkStateBadge :state="experiment.state" />
              <NuxtLink
                v-if="experiment.projectSlug"
                :to="`/projects/${experiment.projectSlug}`"
                class="experiment-link"
              >
                Case study →
              </NuxtLink>
            </div>
          </li>
        </ul>
      </section>

      <!-- Reading notes -->
      <section class="block" aria-labelledby="reading-title">
        <h2 id="reading-title" class="block-title">Reading notes</h2>
        <ul role="list" class="reading-list">
          <li v-for="(note, i) in learning.readingNotes" :key="i" class="reading-note">
            <p class="note-title"><MarkedText :text="note.title" /></p>
            <p class="note-source mono"><MarkedText :text="note.source" /></p>
            <p class="note-takeaway"><MarkedText :text="note.takeaway" /></p>
          </li>
        </ul>
      </section>

      <!-- Roadmap -->
      <section class="block" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" class="block-title">Roadmap</h2>
        <p class="block-note">All roadmap items are plans, and labeled that way.</p>
        <div class="roadmap-grid">
          <div v-for="stage in learning.roadmap" :key="stage.horizon" class="roadmap-column">
            <h3 class="mono">{{ stage.horizon }}</h3>
            <ClaimList :claims="stage.items" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.discipline-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.discipline {
  display: grid;
  gap: var(--space-3);
  align-content: start;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-5);
}

.discipline-title {
  font-size: var(--text-lg);
}

.stance {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.focus-list {
  display: grid;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.focus-list li {
  font-size: var(--text-sm);
  padding-inline-start: var(--space-4);
  border-inline-start: 2px solid var(--color-border);
}

.block {
  margin-top: var(--space-10);
}

.block-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent-2);
  font-weight: 500;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.block-note {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.experiment-list {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: var(--space-5) 0 0;
  padding: 0;
}

.experiment {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: var(--space-5);
  flex-wrap: wrap;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  background: var(--color-surface);
  padding: var(--space-4) var(--space-5);
}

.experiment-name {
  font-weight: 620;
}

.experiment-question {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-style: italic;
  margin-top: var(--space-1);
}

.experiment-side {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.experiment-link {
  font-size: var(--text-sm);
  font-weight: 560;
  text-decoration: none;
  white-space: nowrap;
}

.reading-list {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: var(--space-5) 0 0;
  padding: 0;
}

.reading-note {
  display: grid;
  gap: var(--space-1);
  border-inline-start: 2px solid var(--color-border);
  padding-inline-start: var(--space-4);
}

.note-title {
  font-weight: 620;
}

.note-source {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.note-takeaway {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  margin-top: var(--space-5);
}

.roadmap-column h3 {
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-faint);
  margin-bottom: var(--space-4);
}

@media (max-width: 1040px) {
  .roadmap-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .discipline-grid {
    grid-template-columns: 1fr;
  }
}
</style>
