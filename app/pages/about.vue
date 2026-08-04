<script setup lang="ts">
import { education, interests, profile } from '~/data/portfolio'

usePageMeta({
  title: 'About',
  description:
    'Who Chamroeun Hongleng is: a dual-degree student connecting AI, software, business, and governance — and honest about what that means.'
})
</script>

<template>
  <div class="about-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="About"
        title="A builder who reads the rules"
        :text="profile.headline"
      />

      <div class="about-grid">
        <div class="about-main prose">
          <h2>Where I am right now</h2>
          <p v-for="(paragraph, i) in profile.intro" :key="i">{{ paragraph }}</p>
          <p><MarkedText :text="profile.identity" /></p>

          <h2>Why these interests connect</h2>
          <p><MarkedText :text="interests.connection" /></p>
          <p>
            In practice that means the same project gets three questions instead of one: does the
            model work, would anyone pay for it, and what do the contracts, terms, and policies
            allow it to do? The projects on this site are my attempts to answer all three at once,
            at student scale, with honest labels.
          </p>

          <h2>What I am — and what I am not</h2>
          <p>
            I am a student building across these areas, and this site is deliberate about that: I
            am not a lawyer, not a legal expert, not a senior engineer, and not a machine-learning
            expert. Claims here carry evidence labels precisely because a portfolio at my stage
            earns trust through receipts, not titles.
          </p>

          <h2>How I work with AI</h2>
          <p><MarkedText :text="profile.aiWorkingStyle" /></p>
          <p>
            The full policy — what AI assists with and what stays human — lives on the
            <NuxtLink to="/colophon">colophon page</NuxtLink>.
          </p>
        </div>

        <aside class="about-side">
          <section class="side-card" aria-labelledby="education-title">
            <h2 id="education-title">Education</h2>
            <p class="side-summary"><MarkedText :text="education.summary" /></p>
            <ul role="list" class="education-list">
              <li v-for="entry in education.entries" :key="entry.program" class="education-entry">
                <p class="edu-program"><MarkedText :text="entry.program" /></p>
                <p class="edu-institution"><MarkedText :text="entry.institution" /></p>
                <p class="edu-meta mono">
                  <MarkedText :text="entry.period" /> · {{ entry.status }}
                </p>
                <EvidenceLabel :evidence="entry.evidence" />
              </li>
            </ul>
          </section>

          <section class="side-card" aria-labelledby="links-title">
            <h2 id="links-title">Profiles</h2>
            <ul role="list" class="profile-links">
              <li v-for="link in profile.links" :key="link.url">
                <SocialProfileLink :label="link.label" :url="link.url" />
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-10);
  align-items: start;
}

.about-main h2 {
  margin-top: var(--space-6);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.about-main h2:first-child {
  margin-top: 0;
}

.about-side {
  display: grid;
  gap: var(--space-5);
  position: sticky;
  top: 5.5rem;
}

.side-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-5);
  display: grid;
  gap: var(--space-4);
}

.side-card h2 {
  font-size: var(--text-base);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: var(--color-text-muted);
}

.side-summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.education-list {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.education-entry {
  display: grid;
  gap: var(--space-1);
  justify-items: start;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.edu-program {
  font-weight: 620;
}

.edu-institution {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.edu-meta {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.profile-links {
  display: grid;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 1040px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .about-side {
    position: static;
  }
}
</style>
