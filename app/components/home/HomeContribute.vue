<script setup lang="ts">
import { contributions } from '~/data/portfolio'

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <section id="contribute" class="section" aria-labelledby="contribute-title">
    <div class="container">
      <SectionHeading
        id="contribute-title"
        eyebrow="Working together"
        title="How I can help"
        mark="help"
        :text="contributions.intro"
      >
        <template #aside>
          <a href="#contact" class="btn btn-primary">Say hello <Glyph name="arrow-down" /></a>
        </template>
      </SectionHeading>

      <ol class="card-row" data-cols="3" data-mid="2">
        <li
          v-for="(item, i) in contributions.items"
          :key="item.title"
          class="card card-lift contribute-card"
          data-reveal
        >
          <p class="contribute-num" aria-hidden="true">{{ pad(i + 1) }}</p>
          <h3>{{ item.title }}</h3>
          <p class="contribute-text">
            <MarkedText :text="item.text" />
            <EvidenceLabel :evidence="item.evidence" :link="item.link" />
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* Each card takes one colour of the palette in turn. */
.contribute-card {
  --card-accent: var(--color-accent);
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 3px solid var(--card-accent);
}

.contribute-card:nth-child(3n + 2) {
  --card-accent: var(--color-accent-2);
}

.contribute-card:nth-child(3n) {
  --card-accent: var(--color-positive);
}

.contribute-num {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
  color: var(--card-accent);
}

.contribute-card h3 {
  font-size: var(--text-lg);
}

.contribute-text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

@media (max-width: 760px) {
  .contribute-card {
    padding: var(--space-5);
  }
}
</style>
