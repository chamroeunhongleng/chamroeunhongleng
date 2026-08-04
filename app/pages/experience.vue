<script setup lang="ts">
import { experience } from '~/data/portfolio'

usePageMeta({
  title: 'Experience',
  description:
    'Roles, competitions, field research, and community work — current work first, everything labeled with the evidence that exists.'
})
</script>

<template>
  <div class="experience-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="Experience"
        title="Current work first, history honestly weighted"
        text="Roles, competitions, and fieldwork are grouped by kind — not flattened into one list where a weekend hackathon looks like a year of work."
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
              <ClaimList v-if="entry.contributions.length" :claims="entry.contributions" />
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

@media (max-width: 1040px) {
  .entries[data-layout='cards'] {
    grid-template-columns: 1fr;
  }
}
</style>
