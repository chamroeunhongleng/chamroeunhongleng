<script setup lang="ts">
import { education } from '~/data/portfolio'
</script>

<template>
  <section id="education" class="section" aria-labelledby="education-title">
    <div class="container">
      <SectionHeading
        id="education-title"
        eyebrow="Education"
        title="Where I'm studying"
        mark="studying"
        :text="education.summary"
      />

      <ul class="card-row" data-cols="3" data-mid="2">
        <li v-for="entry in education.entries" :key="entry.institution" class="card edu-card" data-reveal>
          <div class="edu-head">
            <InstitutionMark :institution="entry.institution" class="edu-mark" />
            <p class="edu-period mono">{{ entry.period }}</p>
          </div>
          <h3 class="edu-program"><MarkedText :text="`${entry.credential} in ${entry.program}`" /></h3>
          <p class="edu-institution"><MarkedText :text="entry.institution" /></p>
          <p v-if="entry.specialization" class="edu-spec"><MarkedText :text="entry.specialization" /></p>
          <p v-if="entry.scholarship" class="edu-scholarship">
            <Glyph name="medal" />
            <MarkedText :text="entry.scholarship" />
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.edu-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
}

.edu-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.edu-mark {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-tint);
}

.edu-period {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 0.25em 0.75em;
  white-space: nowrap;
}

.edu-program {
  font-size: var(--text-lg);
}

.edu-institution {
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
  color: var(--color-accent);
}

.edu-spec {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.edu-scholarship {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-top: auto;
  padding: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-accent-2);
  background: var(--color-accent-2-tint);
  border-radius: var(--radius-m);
}

.edu-scholarship .glyph {
  margin-top: 0.1em;
}

@media (max-width: 760px) {
  .edu-card {
    padding: var(--space-5);
  }
}
</style>
