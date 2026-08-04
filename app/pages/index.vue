<script setup lang="ts">
import {
  featuredProjects,
  interests,
  learning,
  now,
  principles,
  processContent,
  profile
} from '~/data/portfolio'

usePageMeta({
  title: 'Exploring AI, Software, and Business',
  description:
    'Chamroeun Hongleng — exploring the intersection of artificial intelligence, machine learning, software, and business, with responsible governance.'
})
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero section" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <p class="eyebrow">{{ profile.name }} · {{ profile.location.text }}</p>
        <img
          class="hero-portrait"
          src="/profile-photo.png"
          width="1254"
          height="1254"
          alt="Portrait of Chamroeun Hongleng wearing a black suit and tie"
          fetchpriority="high"
          decoding="async"
        >
        <h1 id="hero-title">Exploring AI, Software, and Business</h1>
        <p class="hero-statement">{{ profile.headline }}</p>
        <div class="hero-intro">
          <p v-for="(paragraph, i) in profile.intro" :key="i" class="lede">{{ paragraph }}</p>
        </div>
        <p class="hero-identity"><MarkedText :text="profile.identity" /></p>
        <div class="hero-actions">
          <NuxtLink to="/projects" class="btn btn-primary">View projects</NuxtLink>
          <a href="#process" class="btn btn-secondary">How ideas become products</a>
        </div>
        <p class="hero-availability mono">{{ profile.availability }}</p>
      </div>
    </section>

    <!-- Four pillars, one system -->
    <section class="section">
      <div class="container">
        <SectionHeading
          eyebrow="Four pillars, one direction"
          title="The pillars are connected on purpose"
          :text="interests.connection"
        />
        <ol class="pillar-band" role="list">
          <li v-for="pillar in interests.pillars" :key="pillar.id" class="pillar">
            <p class="pillar-number mono">{{ pillar.number }}</p>
            <h3>{{ pillar.title }}</h3>
            <p class="pillar-summary"><MarkedText :text="pillar.summary" /></p>
            <p class="pillar-grounded"><MarkedText :text="pillar.groundedIn" /></p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Featured projects -->
    <section class="section">
      <div class="container">
        <SectionHeading
          eyebrow="Selected work"
          title="Featured projects"
          text="Lifecycle status and deployment reality are labeled separately — a polished prototype never reads as a shipped product here."
        />
        <div class="featured-grid">
          <ProjectCard v-for="project in featuredProjects" :key="project.slug" :project="project" />
        </div>
        <p class="see-all"><NuxtLink to="/projects">All projects →</NuxtLink></p>
      </div>
    </section>

    <!-- Now -->
    <section id="now" class="section now-section">
      <div class="container">
        <SectionHeading eyebrow="Now" title="What is in motion" :text="now.intro" />
        <ul class="now-feed" role="list">
          <li v-for="(entry, i) in now.entries" :key="i" class="now-entry">
            <span class="now-date mono">{{ entry.date }}</span>
            <p class="now-text"><MarkedText :text="entry.text" /></p>
            <EvidenceLabel :evidence="entry.evidence" />
          </li>
        </ul>
      </div>
    </section>

    <!-- Learning snapshot -->
    <section class="section">
      <div class="container">
        <SectionHeading
          eyebrow="Learning in public"
          title="Currently studying, honestly labeled"
          text="A student across every pillar — progress is tracked, not performed."
        />
        <div class="learning-grid">
          <article v-for="discipline in learning.disciplines" :key="discipline.pillar" class="learning-card">
            <h3>{{ discipline.title }}</h3>
            <p><MarkedText :text="discipline.stance" /></p>
          </article>
        </div>
        <p class="see-all"><NuxtLink to="/learning">Full learning log →</NuxtLink></p>
      </div>
    </section>

    <!-- Principles -->
    <section class="section">
      <div class="container">
        <SectionHeading eyebrow="Working principles" title="Rules I build by" />
        <div class="principles-grid">
          <article v-for="principle in principles.principles" :key="principle.title" class="principle">
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Idea-to-production process -->
    <section id="process" class="section process-section">
      <div class="container">
        <SectionHeading
          eyebrow="Idea → production"
          title="How an idea earns its way to production"
          :text="processContent.intro"
        />
        <ol class="process-list" role="list">
          <li
            v-for="(stage, i) in processContent.stages"
            :key="stage.title"
            class="process-stage"
            :data-human-gate="stage.humanGate || undefined"
          >
            <span class="stage-index mono">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <h3>
                {{ stage.title }}
                <span v-if="stage.humanGate" class="gate-chip">Human gate</span>
              </h3>
              <p>{{ stage.description }}</p>
            </div>
          </li>
        </ol>

        <aside class="human-controls">
          <h3>Always human decisions</h3>
          <p class="controls-note">{{ processContent.aiSupport }}</p>
          <ul>
            <li v-for="control in processContent.humanControls" :key="control">{{ control }}</li>
          </ul>
        </aside>
      </div>
    </section>

    <!-- Selected evidence -->
    <section class="section">
      <div class="container">
        <SectionHeading
          eyebrow="Selected evidence"
          title="Claims with receipts"
          text="Numbers only appear with their evidence labels. Self-reported figures say so."
        />
        <ClaimList :claims="profile.proofPoints" />
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="section">
      <div class="container cta-panel">
        <h2>Building something at this intersection?</h2>
        <p class="lede">
          I am looking for research opportunities, internships, and product collaborations where
          technical work meets business and governance questions.
        </p>
        <NuxtLink to="/contact" class="btn btn-primary">Start a conversation</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
  column-gap: clamp(var(--space-8), 7vw, var(--space-12));
  row-gap: var(--space-5);
  align-items: start;
  justify-items: start;
  padding-block: var(--space-8);
}

.hero-grid > :not(.hero-portrait) {
  grid-column: 1;
}

.hero-portrait {
  grid-column: 2;
  grid-row: 1 / span 7;
  align-self: center;
  justify-self: end;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  background: var(--color-surface-sunken);
  box-shadow: var(--shadow-2);
}

.hero-statement {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--text-xl);
  color: var(--color-accent-2);
  max-width: 40ch;
  line-height: var(--leading-snug);
}

.hero-intro {
  display: grid;
  gap: var(--space-4);
}

.hero-identity {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  border-inline-start: 2px solid var(--color-accent);
  padding-inline-start: var(--space-3);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hero-availability {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

/* Pillars — a connected numbered band, not four floating cards */
.pillar-band {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 2px solid var(--color-text);
}

.pillar {
  display: grid;
  gap: var(--space-3);
  align-content: start;
  padding: var(--space-5) var(--space-5) var(--space-5) 0;
}

.pillar + .pillar {
  border-inline-start: 1px solid var(--color-border);
  padding-inline-start: var(--space-5);
}

.pillar-number {
  color: var(--color-accent);
  font-size: var(--text-sm);
}

.pillar h3 {
  font-size: var(--text-lg);
}

.pillar-summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.pillar-grounded {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  border-top: 1px dashed var(--color-border);
  padding-top: var(--space-3);
}

/* Featured */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.see-all {
  margin-top: var(--space-5);
}

.see-all a {
  font-weight: 560;
  text-decoration: none;
}

/* Now */
.now-section {
  background: var(--color-surface);
  border-block: 1px solid var(--color-border);
}

.now-feed {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.now-entry {
  display: grid;
  grid-template-columns: 5.5rem 1fr auto;
  gap: var(--space-4);
  align-items: baseline;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.now-date {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

.now-text {
  max-width: var(--prose-max);
}

/* Learning */
.learning-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.learning-card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  background: var(--color-surface);
}

.learning-card h3 {
  font-size: var(--text-lg);
}

.learning-card p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Principles */
.principles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.principle {
  display: grid;
  gap: var(--space-2);
  border-top: 2px solid var(--color-text);
  padding-top: var(--space-3);
}

.principle h3 {
  font-size: var(--text-base);
}

.principle p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Process */
.process-section {
  background: var(--color-surface);
  border-block: 1px solid var(--color-border);
}

.process-list {
  display: grid;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 46rem;
}

.process-stage {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}

.stage-index {
  color: var(--color-text-faint);
  font-size: var(--text-sm);
}

.process-stage[data-human-gate] .stage-index {
  color: var(--color-accent);
  font-weight: 600;
}

.process-stage h3 {
  font-size: var(--text-base);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.gate-chip {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 999px;
  padding: 0.1em 0.6em;
}

.process-stage p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.human-controls {
  margin-top: var(--space-7);
  border: 1px solid var(--color-accent);
  background: var(--color-accent-tint);
  border-radius: var(--radius-l);
  padding: var(--space-5);
  max-width: 46rem;
  display: grid;
  gap: var(--space-3);
}

.human-controls h3 {
  font-family: var(--font-mono);
  font-size: var(--text-base);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.controls-note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.human-controls ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2) var(--space-6);
  margin: 0;
}

.human-controls li {
  font-size: var(--text-sm);
}

/* CTA */
.cta-panel {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-8);
}

@media (max-width: 1040px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
    column-gap: var(--space-6);
  }

  .pillar-band {
    grid-template-columns: 1fr 1fr;
  }

  .pillar:nth-child(3) {
    border-inline-start: none;
    padding-inline-start: 0;
  }

  .featured-grid,
  .principles-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-portrait {
    grid-column: 1;
    grid-row: auto;
    justify-self: start;
    width: min(100%, 20rem);
  }

  .pillar-band,
  .featured-grid,
  .learning-grid,
  .principles-grid {
    grid-template-columns: 1fr;
  }

  .pillar + .pillar {
    border-inline-start: none;
    padding-inline-start: 0;
    border-top: 1px solid var(--color-border);
  }

  .now-entry {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .human-controls ul {
    grid-template-columns: 1fr;
  }
}
</style>
