<script setup lang="ts">
import { interests, learning } from '~/data/portfolio'

usePageMeta({
  title: 'Learning',
  description:
    'A live log of what Chamroeun Hongleng is studying across AI, software, business, and governance — curiosity with progress, not claimed expertise.'
})

// Presentational time windows for the three roadmap horizons — deliberately
// loose (no fake month precision). The visual treatment (solid ink →
// terracotta → dashed) encodes the same certainty decay.
const HORIZON_WINDOWS: Record<string, string> = {
  Now: '2026 · this term',
  Next: 'toward 2027',
  Later: 'beyond'
}

const pillarNumber = (id: string) => interests.pillars.find((p) => p.id === id)?.number
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
          class="card discipline"
          :aria-labelledby="`discipline-${discipline.pillar}`"
        >
          <p v-if="pillarNumber(discipline.pillar)" class="num-label">
            Pillar {{ pillarNumber(discipline.pillar) }}
          </p>
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
        <SectionHeading
          id="experiments-title"
          eyebrow="Experiments"
          title="Questions I am testing"
          text="Each experiment is a falsifiable question carrying an honest state — some have full case studies."
        />
        <ul role="list" class="experiment-list">
          <li v-for="experiment in learning.experiments" :key="experiment.title" class="card experiment">
            <div>
              <p class="experiment-name">{{ experiment.title }}</p>
              <p class="experiment-question"><MarkedText :text="experiment.question" /></p>
            </div>
            <div class="experiment-side">
              <WorkStateBadge :state="experiment.state" />
              <NuxtLink
                v-if="experiment.projectSlug"
                :to="`/projects/${experiment.projectSlug}`"
                class="pill experiment-link"
              >
                Case study <Glyph name="arrow-right" />
              </NuxtLink>
            </div>
          </li>
        </ul>
      </section>

      <!-- Reading notes -->
      <section v-if="learning.readingNotes.length" class="block" aria-labelledby="reading-title">
        <SectionHeading
          id="reading-title"
          eyebrow="Reading"
          title="Reading notes"
          :text="learning.readingMethod"
        />
        <ul role="list" class="reading-list">
          <li v-for="(note, i) in learning.readingNotes" :key="i" class="card reading-note">
            <Glyph name="book" plaque />
            <div class="note-body">
              <p class="note-title"><MarkedText :text="note.title" /></p>
              <p class="note-source mono"><MarkedText :text="note.source" /></p>
              <p class="note-takeaway"><MarkedText :text="note.takeaway" /></p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Roadmap — a rail where the ink fades with distance -->
      <section class="block" aria-labelledby="roadmap-title">
        <SectionHeading
          id="roadmap-title"
          eyebrow="Roadmap"
          title="Now, next, and later"
          text="Three horizons, drawn honestly: the further out the plan, the fainter the ink. Every item still carries its own label."
        />
        <ol class="rm-track" role="list">
          <li
            v-for="stage in learning.roadmap"
            :key="stage.horizon"
            class="rm-zone"
            :data-horizon="stage.horizon.toLowerCase()"
          >
            <div class="rm-zonehead">
              <span class="rm-node" aria-hidden="true" />
              <h3 class="rm-label mono">{{ stage.horizon }}</h3>
              <span class="rm-window mono">{{ HORIZON_WINDOWS[stage.horizon] }}</span>
            </div>
            <ul class="rm-cards" role="list">
              <li v-for="(item, i) in stage.items" :key="i" class="rm-card">
                <p class="rm-text"><MarkedText :text="item.text" /></p>
                <span class="rm-labels">
                  <WorkStateBadge v-if="item.workState" :state="item.workState" />
                  <EvidenceLabel :evidence="item.evidence" :link="item.link" />
                </span>
              </li>
            </ul>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.discipline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

.discipline {
  display: grid;
  gap: var(--space-3);
  align-content: start;
  padding: var(--space-6);
}

.discipline-title {
  font-size: var(--text-xl);
}

.stance {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.focus-list {
  display: grid;
  gap: var(--space-2);
  list-style: none;
  margin: var(--space-2) 0 0;
  padding: 0;
}

.focus-list li {
  position: relative;
  font-size: var(--text-sm);
  padding-inline-start: var(--space-5);
}

.focus-list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-accent-2);
}

.block {
  margin-top: var(--space-14);
}

.experiment-list {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.experiment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
  padding: var(--space-5) var(--space-6);
}

.experiment-name {
  font-weight: var(--weight-strong);
}

.experiment-question {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.experiment-side {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.reading-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.reading-note {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-5);
}

.note-body {
  display: grid;
  gap: var(--space-1);
}

.note-title {
  font-weight: var(--weight-strong);
}

.note-source {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.note-takeaway {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

/* Roadmap — release-roadmap treatment: each zone owns a colored axis
   segment; every item hangs from it as a framed card on a connector stem.
   Zones cascade downward left-to-right (time flows down as well as right),
   and certainty decays with distance: solid indigo (Now) → terracotta
   (Next) → dashed, unfilled (Later). */
.rm-track {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

.rm-zone {
  --zone-color: var(--color-accent);
  --zone-style: solid;
  align-content: start;
}

.rm-zone[data-horizon='next'] {
  --zone-color: var(--color-accent-2);
}

.rm-zone[data-horizon='later'] {
  --zone-color: var(--color-border-strong);
  --zone-style: dashed;
}

/* Zone head doubles as the axis segment: label + window on a colored rule. */
.rm-zonehead {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-bottom: var(--space-2);
  border-bottom: 3px var(--zone-style) var(--zone-color);
}

.rm-node {
  flex: 0 0 auto;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: var(--zone-color);
}

.rm-zone[data-horizon='later'] .rm-node {
  background: transparent;
  border: 2px dashed var(--zone-color);
}

.rm-label {
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text);
  font-weight: var(--weight-strong);
}

.rm-window {
  margin-inline-start: auto;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* Cards hang from the axis on stems; the cascade deepens per zone. */
.rm-cards {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}

.rm-zone[data-horizon='next'] .rm-cards {
  margin-top: calc(var(--space-4) + var(--space-7));
}

.rm-zone[data-horizon='later'] .rm-cards {
  margin-top: calc(var(--space-4) + var(--space-12));
}

.rm-card {
  position: relative;
  display: grid;
  gap: var(--space-2);
  justify-items: start;
  border: 1.5px var(--zone-style) var(--zone-color);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  padding: var(--space-4);
}

.rm-zone[data-horizon='later'] .rm-card {
  background: transparent;
}

/* Connector stems: from each card up through the gap above it. */
.rm-card::before {
  content: '';
  position: absolute;
  left: var(--space-5);
  bottom: 100%;
  height: var(--space-4);
  border-inline-start: 1.5px var(--zone-style) var(--zone-color);
}

.rm-zone[data-horizon='next'] .rm-card:first-child::before {
  height: calc(var(--space-4) + var(--space-7));
}

.rm-zone[data-horizon='later'] .rm-card:first-child::before {
  height: calc(var(--space-4) + var(--space-12));
}

.rm-text {
  font-size: var(--text-sm);
}

/* The block note promises every item carries a label — so render it. The
   evidence label is icon-only site-wide (it shows only when a claim links to
   its receipt), which is why the work state is what a reader actually sees. */
.rm-labels {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 1040px) {
  .rm-track {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }

  /* Stacked: the cascade resets; stems stay uniform. */
  .rm-zone[data-horizon='next'] .rm-cards,
  .rm-zone[data-horizon='later'] .rm-cards {
    margin-top: var(--space-4);
  }

  .rm-zone[data-horizon='next'] .rm-card:first-child::before,
  .rm-zone[data-horizon='later'] .rm-card:first-child::before {
    height: var(--space-4);
  }
}

@media (max-width: 760px) {
  .discipline-grid,
  .reading-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .discipline,
  .experiment {
    padding: var(--space-5);
  }

  .block {
    margin-top: var(--space-10);
  }
}
</style>
