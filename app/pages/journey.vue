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

      <!-- The through-line the grouped timeline cannot show: why this shape. -->
      <section v-if="experience.story" class="story" aria-labelledby="story-title">
        <h2 id="story-title" class="story-title">{{ experience.story.title }}</h2>
        <div class="story-body prose">
          <p v-for="(paragraph, i) in experience.story.paragraphs" :key="i">
            <MarkedText :text="paragraph" />
          </p>
        </div>
      </section>

      <nav class="group-nav" aria-label="Journey sections">
        <a v-for="group in experience.groups" :key="group.id" :href="`#group-${group.id}`">
          {{ group.title }}
        </a>
      </nav>

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
              :data-figure="entry.image ? '' : undefined"
            >
              <header class="entry-header">
                <div class="entry-identity">
                  <h3 class="entry-role"><MarkedText :text="entry.role" /></h3>
                  <p class="entry-org"><MarkedText :text="entry.organization" /></p>
                </div>
                <p class="entry-period mono">
                  <MarkedText :text="entry.period" />
                  <span v-if="entry.current" class="current-chip">Current</span>
                </p>
              </header>

              <div class="entry-body">
                <div class="entry-main">
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
                </div>

                <figure v-if="entry.image" class="entry-figure">
                  <img
                    :src="entry.image.src"
                    :alt="entry.image.alt"
                    loading="lazy"
                    decoding="async"
                    :width="entry.image.width"
                    :height="entry.image.height"
                  >
                  <figcaption v-if="entry.image.caption" class="mono">
                    {{ entry.image.caption }}
                  </figcaption>
                </figure>
              </div>

              <LinkStrip
                v-if="entry.links?.length"
                class="entry-links"
                :links="entry.links"
                :variant="group.layout === 'cards' ? 'grid' : 'inline'"
              />
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Set off from the entry cards below by a rule, not a box — the page already
   carries five bordered groups and a sixth would read as another entry. */
.story {
  display: grid;
  gap: var(--space-4);
  margin-block-end: var(--space-8);
  padding-inline-start: var(--space-5);
  border-inline-start: 2px solid var(--color-accent);
}

.story-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent-2);
  font-weight: 500;
}

.story-body p {
  max-width: 68ch;
  color: var(--color-text-muted);
}

/* The opening line carries the answer; give it the weight of a lead. */
.story-body p:first-child {
  font-size: var(--text-lg);
  line-height: var(--leading-snug);
  color: var(--color-text);
}

@media (max-width: 760px) {
  .story {
    padding-inline-start: var(--space-4);
  }
}

.group-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  margin-block-end: var(--space-8);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.group-nav a {
  color: var(--color-text-muted);
  text-decoration: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.35em 0.9em;
}

/* Section jump-pills: 30px tall from the em padding alone, and they are the
   whole navigation for a long page on a phone. */
@media (pointer: coarse) {
  .group-nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
}

.group-nav a:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.groups {
  display: grid;
  gap: var(--space-10);
}

.group-title {
  scroll-margin-block-start: var(--space-8);
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

/* Every group is a single column of full-width entries. Cards used to sit
   two-up, which cut each entry to ~30rem — long roles wrapped, claims went
   thin and tall, and the two cards ended at wildly different heights. */
.entries {
  display: grid;
  gap: var(--space-5);
}

.entry {
  display: grid;
  gap: var(--space-5);
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
  align-items: baseline;
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
  max-width: none;
}

.entry-period {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
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

.entry-body {
  display: grid;
  gap: var(--space-5);
}

.entry-main {
  display: grid;
  gap: var(--space-4);
  align-content: start;
}

/* Cards carry the photographic entries: prose on the left, the photograph
   held in a rail on the right, so neither has to squeeze past the other. */
.entries[data-layout='cards'] .entry[data-figure] .entry-body {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: var(--space-6);
  align-items: start;
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
  align-content: start;
}

.entry-figure img {
  max-width: min(28rem, 100%);
  height: auto;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-1);
}

/* In the rail the photograph owns its column outright. */
.entries[data-layout='cards'] .entry-figure img {
  max-width: 100%;
}

.entry-figure figcaption {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  max-width: 60ch;
  line-height: var(--leading-snug);
}

/* The receipt grid closes the card, ruled off from the story above it. */
.entries[data-layout='cards'] .entry-links {
  padding-block-start: var(--space-4);
  border-block-start: 1px solid var(--color-border);
}

@media (max-width: 1040px) {
  .entries[data-layout='cards'] .entry[data-figure] .entry-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .entries[data-layout='cards'] .entry-figure img {
    max-width: min(28rem, 100%);
  }
}

@media (max-width: 760px) {
  .results {
    grid-template-columns: 1fr;
  }
}
</style>
