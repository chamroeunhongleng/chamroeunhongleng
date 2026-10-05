<script setup lang="ts">
import { experience } from '~/data/portfolio'

usePageMeta({
  title: 'Journey',
  description:
    'The journey so far — from high school in Kampong Cham to dual degrees, studio work, competitions, and field research, labeled with the evidence that exists.'
})

// A plaque glyph per group id in content/experience.json; unknown ids fall
// back to the book, so a new group never renders without one.
type GroupGlyph = 'briefcase' | 'medal' | 'users' | 'graduation-cap' | 'book'
const GROUP_GLYPH: Record<string, GroupGlyph> = {
  current: 'briefcase',
  competitions: 'medal',
  fieldwork: 'users',
  milestones: 'graduation-cap',
  community: 'book'
}
</script>

<template>
  <div class="journey-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="Journey"
        title="Where I started, what I do now"
        text="Current work first, then competitions, field research, and milestones — each kind in its own group."
      />

      <!-- The through-line the grouped timeline cannot show: why this shape.
           Three short steps side by side, so it reads at a glance. -->
      <section v-if="experience.story" class="story" aria-labelledby="story-title">
        <h2 id="story-title" class="story-title">{{ experience.story.title }}</h2>
        <ol class="story-steps" role="list">
          <li v-for="(step, i) in experience.story.steps" :key="step.title" class="story-step">
            <p class="num-label">{{ String(i + 1).padStart(2, '0') }}</p>
            <h3 class="story-step-title">{{ step.title }}</h3>
            <p class="story-step-text"><MarkedText :text="step.text" /></p>
          </li>
        </ol>
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
          <div class="group-head">
            <Glyph :name="GROUP_GLYPH[group.id] ?? 'book'" plaque />
            <h2 :id="`group-${group.id}`" class="group-title">{{ group.title }}</h2>
          </div>

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
/* Three ruled columns, not boxes — the page already carries many bordered
   cards and one more would read as another entry. */
.story {
  display: grid;
  gap: var(--space-5);
  margin-block-end: var(--space-8);
}

.story-title {
  font-size: var(--text-2xl);
}

.story-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  list-style: none;
  margin: 0;
  padding: 0;
}

.story-step {
  display: grid;
  gap: var(--space-2);
  align-content: start;
  padding-block-start: var(--space-4);
  border-block-start: 2px solid var(--color-border-strong);
}

.story-step .num-label {
  color: var(--color-accent);
}

.story-step-title {
  font-size: var(--text-lg);
}

.story-step-text {
  max-width: none;
  color: var(--color-text-muted);
}

@media (max-width: 1040px) {
  .story-steps {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }

  .story-step-text {
    max-width: 62ch;
  }
}

.group-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-block-end: var(--space-10);
}

.group-nav a {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.9rem;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  text-decoration: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  transition:
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.group-nav a:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* Section jump-pills are the whole navigation for a long page on a phone. */
@media (pointer: coarse) {
  .group-nav a {
    min-height: 44px;
  }
}

.groups {
  display: grid;
  gap: var(--space-12);
}

.group-head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.group-title {
  scroll-margin-block-start: var(--space-12);
  font-size: var(--text-3xl);
}

.entries {
  display: grid;
  gap: var(--space-5);
}

.entry {
  position: relative;
  display: grid;
  gap: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--space-6);
}

.entry[data-current] {
  border-color: var(--color-border-strong);
}

/* Timeline groups hang their cards from a rail, one dot per entry — filled
   for the roles that are still running. */
.entries[data-layout='timeline'] {
  position: relative;
  padding-inline-start: var(--space-7);
}

.entries[data-layout='timeline']::before {
  content: '';
  position: absolute;
  left: 0.55rem;
  top: var(--space-5);
  bottom: var(--space-5);
  width: 2px;
  background: var(--color-border);
}

.entries[data-layout='timeline'] .entry::before {
  content: '';
  position: absolute;
  left: calc(0.175rem - var(--space-7) - 1px);
  top: var(--space-7);
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: var(--color-bg);
  border: 2px solid var(--color-accent);
}

.entries[data-layout='timeline'] .entry[data-current]::before {
  background: var(--color-accent);
  box-shadow: 0 0 0 0.25rem var(--color-accent-tint);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2) var(--space-4);
  flex-wrap: wrap;
}

.entry-identity {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.entry-role {
  font-size: var(--text-xl);
}

.entry-org {
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
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
  display: inline-flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-positive);
  background: var(--color-positive-tint);
  border-radius: var(--radius-pill);
  padding: 0.15em 0.65em;
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
  font-weight: var(--weight-strong);
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
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
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
    grid-template-columns: minmax(0, 1fr);
  }

  .entry {
    padding: var(--space-5);
  }

  .group-title {
    font-size: var(--text-2xl);
  }

  .entries[data-layout='timeline'] {
    padding-inline-start: var(--space-5);
  }

  .entries[data-layout='timeline'] .entry::before {
    left: calc(0.175rem - var(--space-5) - 1px);
  }
}
</style>
