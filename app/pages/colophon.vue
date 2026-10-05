<script setup lang="ts">
import { colophon } from '~/data/portfolio'

usePageMeta({
  title: 'Colophon & AI policy',
  description:
    'How this site was built and exactly where AI was involved — the disclosure itself is a governance artifact.'
})
</script>

<template>
  <div class="colophon-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="Colophon"
        title="How this site was built — and where AI was involved"
        :text="colophon.intro"
      />

      <div class="colophon-grid">
        <section class="card panel panel-wide" aria-labelledby="policy-title">
          <h2 id="policy-title">The rule</h2>
          <p class="policy-rule"><MarkedText :text="colophon.aiPolicy.rule" /></p>

          <div class="policy-columns">
            <div class="policy-column">
              <h3>Human-owned</h3>
              <ul role="list">
                <li v-for="item in colophon.aiPolicy.humanOwned" :key="item">
                  <MarkedText :text="item" />
                </li>
              </ul>
            </div>
            <div class="policy-column">
              <h3>AI-assisted</h3>
              <ul role="list">
                <li v-for="item in colophon.aiPolicy.aiAssisted" :key="item">
                  <MarkedText :text="item" />
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="card panel" aria-labelledby="build-title">
          <h2 id="build-title">How it is built</h2>
          <ul role="list" class="dash-list">
            <li v-for="(item, i) in colophon.howBuilt" :key="i">
              <MarkedText :text="item" />
            </li>
          </ul>
        </section>

        <section class="card panel" aria-labelledby="provenance-title">
          <h2 id="provenance-title">Provenance</h2>
          <ClaimList :claims="colophon.provenance" />
        </section>

        <section class="card panel panel-wide" aria-labelledby="agents-title">
          <h2 id="agents-title">A note for AI agents</h2>
          <p class="agents-note mono"><MarkedText :text="colophon.noteForAgents" /></p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.colophon-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
  align-items: start;
}

.panel {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-7);
}

.panel-wide {
  grid-column: 1 / -1;
}

.panel h2 {
  font-size: var(--text-2xl);
}

.policy-rule {
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-snug);
  max-width: 60ch;
}

.policy-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.policy-column {
  padding: var(--space-5);
  background: var(--color-surface-sunken);
  border-radius: var(--radius-m);
}

.policy-column h3 {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-strong);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: var(--space-3);
}

.policy-column ul,
.dash-list {
  display: grid;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.policy-column li,
.dash-list li {
  position: relative;
  padding-inline-start: var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.policy-column li::before,
.dash-list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-accent-2);
}

.agents-note {
  background: var(--color-surface-sunken);
  border-radius: var(--radius-m);
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: none;
}

@media (max-width: 1040px) {
  .colophon-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 760px) {
  .panel {
    padding: var(--space-5);
  }

  .policy-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
