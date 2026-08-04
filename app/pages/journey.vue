<script setup lang="ts">
import { experience } from '~/data/portfolio'

usePageMeta({
  title: 'Journey',
  description:
    'The journey so far — from high school in Kampong Cham to dual degrees, studio work, competitions, and field research, labeled with the evidence that exists.'
})
</script>

<template>
  <div class="journey-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="Journey"
        title="Where I started, what I do now"
        text="Current work first, then competitions, field research, and the milestones that led here — grouped by kind, never flattened into one list where a weekend hackathon looks like a year of work."
      />

      <div class="groups">
        <section
          v-for="group in experience.groups"
          :key="group.id"
          class="group"
          :aria-labelledby="`group-${group.id}`"
        >
          <h2 :id="`group-${group.id}`" class="group-title">{{ group.title }}</h2>

          <div class="entries" :data-layout="group.layout">
            <article
              v-for="entry in group.entries"
              :key="`${entry.organization}-${entry.role}`"
              class="entry"
              :data-current="entry.current || undefined"
            >
              <header class="entry-header">
                <div>
                  <h3 class="entry-role"><MarkedText :text="entry.role" /></h3>
                  <p class="entry-org"><MarkedText :text="entry.organization" /></p>
                </div>
                <p class="entry-period mono">
                  <MarkedText :text="entry.period" />
                  <span v-if="entry.current" class="current-chip">Current</span>
                </p>
              </header>
              <p class="entry-summary"><MarkedText :text="entry.summary" /></p>
              <ul v-if="entry.results?.length" class="results" role="list">
                <li v-for="(result, i) in entry.results" :key="i" class="result">
                  <span class="result-award">{{ result.award }}</span>
                  <span class="result-event">
                    <MarkedText :text="result.event" />
                    <EvidenceLabel
                      v-if="result.link"
                      class="result-evidence"
                      :evidence="result.evidence"
                      :link="result.link"
                    />
                  </span>
                </li>
              </ul>
              <ClaimList v-if="entry.contributions.length" :claims="entry.contributions" />
              <figure v-if="entry.image" class="entry-figure">
                <img
                  :src="entry.image.src"
                  :alt="entry.image.alt"
                  loading="lazy"
                  width="1000"
                  height="1333"
                >
                <figcaption v-if="entry.image.caption" class="mono">
                  {{ entry.image.caption }}
                </figcaption>
              </figure>
              <LinkStrip v-if="entry.links?.length" :links="entry.links" />
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups {
  display: grid;
  gap: var(--space-10);
}

.group-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent-2);
  font-weight: 500;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.entries {
  display: grid;
  gap: var(--space-5);
}

.entries[data-layout='cards'] {
  grid-template-columns: repeat(2, 1fr);
}

.entry {
  display: grid;
  gap: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-5);
}

.entry[data-current] {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.entry-role {
  font-size: var(--text-lg);
}

.entry-org {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.entry-period {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.current-chip {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-positive);
  border: 1px solid var(--color-positive);
  border-radius: 999px;
  padding: 0.05em 0.5em;
}

.entry-summary {
  color: var(--color-text-muted);
}

.results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-6);
}

.result {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding-block: var(--space-2);
  border-block-end: 1px solid var(--color-border);
}

.result-award {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent-2);
  white-space: nowrap;
}

.result-award::after {
  content: '—';
  margin-inline-start: var(--space-2);
  color: var(--color-text-faint);
}

.result-event {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.result-evidence {
  margin-inline-start: var(--space-2);
}

.entry-figure {
  margin: 0;
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}

.entry-figure img {
  max-width: min(28rem, 100%);
  height: auto;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-1);
}

.entry-figure figcaption {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  max-width: 60ch;
}

@media (max-width: 1040px) {
  .entries[data-layout='cards'] {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .results {
    grid-template-columns: 1fr;
  }
}
</style>
