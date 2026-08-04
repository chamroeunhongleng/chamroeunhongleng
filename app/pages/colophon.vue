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
        <section class="policy-panel" aria-labelledby="policy-title">
          <h2 id="policy-title">The rule</h2>
          <p class="policy-rule"><MarkedText :text="colophon.aiPolicy.rule" /></p>

          <div class="policy-columns">
            <div>
              <h3>Human-owned</h3>
              <ul role="list">
                <li v-for="item in colophon.aiPolicy.humanOwned" :key="item">
                  <MarkedText :text="item" />
                </li>
              </ul>
            </div>
            <div>
              <h3>AI-assisted</h3>
              <ul role="list">
                <li v-for="item in colophon.aiPolicy.aiAssisted" :key="item">
                  <MarkedText :text="item" />
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="build-panel" aria-labelledby="build-title">
          <h2 id="build-title">How it is built</h2>
          <ul role="list" class="build-list">
            <li v-for="(item, i) in colophon.howBuilt" :key="i">
              <MarkedText :text="item" />
            </li>
          </ul>
        </section>

        <section class="provenance-panel" aria-labelledby="provenance-title">
          <h2 id="provenance-title">Provenance</h2>
          <ClaimList :claims="colophon.provenance" />
        </section>

        <section class="agents-panel" aria-labelledby="agents-title">
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
  gap: var(--space-8);
  max-width: 52rem;
}

.colophon-grid h2 {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent-2);
  font-weight: 500;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-4);
}

.policy-rule {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  line-height: var(--leading-snug);
  max-width: var(--prose-max);
}

.policy-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  margin-top: var(--space-5);
}

.policy-columns h3 {
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
  font-family: var(--font-mono);
  font-weight: 500;
  margin-bottom: var(--space-3);
}

.policy-columns ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}

.policy-columns li {
  font-size: var(--text-sm);
}

.build-list {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}

.build-list li {
  max-width: var(--prose-max);
}

.agents-note {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  padding: var(--space-4);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: none;
}

@media (max-width: 760px) {
  .policy-columns {
    grid-template-columns: 1fr;
  }
}
</style>
