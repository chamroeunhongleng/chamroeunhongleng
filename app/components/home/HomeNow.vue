<script setup lang="ts">
import { now, profile } from '~/data/portfolio'

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <!-- id="now" is a header link and a chat-assistant destination. -->
  <section id="now" class="section" aria-labelledby="now-title">
    <div class="container">
      <SectionHeading
        id="now-title"
        eyebrow="Now"
        title="What I'm up to these days"
        mark="these days"
        :text="now.intro"
      >
        <template #aside>
          <p class="pill pill-live now-availability">
            <span class="dot" aria-hidden="true" />
            {{ profile.availability }}
          </p>
        </template>
      </SectionHeading>

      <ol class="card-row" data-cols="2">
        <li v-for="(entry, i) in now.entries" :key="i" class="card now-card" data-reveal>
          <p class="num-label">{{ pad(i + 1) }} · {{ entry.date }}</p>
          <p class="now-text"><MarkedText :text="entry.text" /></p>
          <p class="now-evidence mono">{{ entry.evidence }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.now-availability {
  white-space: normal;
  border-radius: var(--radius-card);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
}

.now-card {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
}

.now-text {
  font-weight: var(--weight-medium);
}

.now-evidence {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

@media (max-width: 760px) {
  .now-card {
    padding: var(--space-5);
  }
}
</style>
