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

// One flagship project carries the homepage; the rest are one-line rows.
// Prefer a flagship with a clickable live site — recruiters reach the real
// product in one click.
const flagship
  = featuredProjects.find((p) =>
    p.publicLinks.some((l) => l.kind === 'demo' || l.kind === 'website')
  ) ?? featuredProjects[0]
const moreProjects = featuredProjects.filter((p) => p !== flagship)
const topEvidence = profile.proofPoints.slice(0, 3)
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero section" aria-labelledby="hero-title">
      <div class="container hero-layout">
        <div class="hero-grid">
          <p class="eyebrow">{{ profile.name }} · {{ profile.location.text }}</p>
          <h1 id="hero-title">Exploring AI, Software, and Business</h1>
          <p class="hero-statement">{{ profile.headline }}</p>
          <div class="hero-intro">
            <p v-for="(paragraph, i) in profile.intro" :key="i" class="lede">{{ paragraph }}</p>
          </div>
          <p class="hero-identity"><MarkedText :text="profile.identity" /></p>
          <div class="hero-actions">
            <NuxtLink to="/projects" class="btn btn-primary">View projects</NuxtLink>
            <NuxtLink to="/about" class="btn btn-secondary">About me</NuxtLink>
          </div>
        </div>

        <figure v-if="profile.photo" class="hero-portrait">
          <span class="portrait-backplate" aria-hidden="true" />
          <img
            :src="profile.photo.src"
            :alt="profile.photo.alt"
            class="portrait-img"
            width="640"
            height="640"
            fetchpriority="high"
          >
          <figcaption class="portrait-plate mono">
            <span class="plate-tick" aria-hidden="true" />
            {{ profile.name }} · {{ profile.location.text }}
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Four pillars — slim band -->
    <section class="section">
      <div class="container">
        <SectionHeading eyebrow="Four pillars, one direction" title="What I work across" />
        <ol class="pillar-band" role="list">
          <li v-for="pillar in interests.pillars" :key="pillar.id" class="pillar">
            <p class="pillar-number mono">{{ pillar.number }}</p>
            <h3>{{ pillar.title }}</h3>
            <p class="pillar-summary"><MarkedText :text="pillar.summary" /></p>
          </li>
        </ol>
        <p class="band-more">
          <NuxtLink to="/about">Why these connect →</NuxtLink>
        </p>
      </div>
    </section>

    <!-- Now -->
    <section id="now" class="section now-section">
      <div class="container">
        <SectionHeading eyebrow="Now" title="What is in motion" />
        <ul class="now-feed" role="list">
          <li v-for="(entry, i) in now.entries" :key="i" class="now-entry">
            <span class="now-date mono">{{ entry.date }}</span>
            <p class="now-text"><MarkedText :text="entry.text" /></p>
            <EvidenceLabel :evidence="entry.evidence" />
          </li>
        </ul>
      </div>
    </section>

    <!-- Flagship project + compact list -->
    <section class="section">
      <div class="container">
        <SectionHeading
          eyebrow="Selected work"
          title="One project in depth, the rest one line each"
        />
        <ProjectCard v-if="flagship" :project="flagship" />
        <ul class="project-rows" role="list">
          <li v-for="project in moreProjects" :key="project.slug">
            <NuxtLink :to="`/projects/${project.slug}`" class="project-row">
              <span class="row-name"><MarkedText :text="project.name" /></span>
              <span class="row-oneliner"><MarkedText :text="project.oneLiner" /></span>
              <StatusBadge :status="project.status" />
              <span class="row-arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </li>
        </ul>
        <p class="band-more"><NuxtLink to="/projects">All projects →</NuxtLink></p>
      </div>
    </section>

    <!-- Learning snapshot -->
    <section class="section learning-section">
      <div class="container">
        <SectionHeading eyebrow="Learning in public" title="Currently studying" />
        <div class="learning-grid">
          <article v-for="discipline in learning.disciplines" :key="discipline.pillar" class="learning-card">
            <h3>{{ discipline.title }}</h3>
            <p><MarkedText :text="discipline.stance" /></p>
          </article>
        </div>
        <p class="band-more"><NuxtLink to="/learning">Full learning log →</NuxtLink></p>
      </div>
    </section>

    <!-- Principles + process, compact -->
    <section id="process" class="section">
      <div class="container">
        <SectionHeading eyebrow="How I work" title="Rules and the road to production" />

        <div class="principles-row">
          <article v-for="principle in principles.principles" :key="principle.title" class="principle">
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.text }}</p>
          </article>
        </div>

        <div class="process-compact">
          <ol class="process-flow" role="list">
            <li
              v-for="(stage, i) in processContent.stages"
              :key="stage.title"
              class="process-chip"
              :data-human-gate="stage.humanGate || undefined"
            >
              <span class="chip-index mono">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ stage.title }}
            </li>
          </ol>
          <p class="process-legend">
            <span class="gate-dot" aria-hidden="true" /> marked stages are always human
            decisions — {{ processContent.humanControls.slice(0, 4).join(', ').toLowerCase() }},
            and every final public claim. {{ processContent.aiSupport }}
          </p>
        </div>
      </div>
    </section>

    <!-- Selected evidence — top three -->
    <section class="section evidence-section">
      <div class="container">
        <SectionHeading eyebrow="Selected evidence" title="Claims with receipts" />
        <ClaimList :claims="topEvidence" />
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

.hero-layout {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-10);
  align-items: center;
  padding-block: var(--space-7);
}

.hero-grid {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

/* Portrait — archival plate treatment: offset indigo backplate, hairline
   frame, mono caption plate with a terracotta tick */
.hero-portrait {
  position: relative;
  margin: 0;
  width: clamp(15rem, 24vw, 20rem);
}

.portrait-backplate {
  position: absolute;
  inset: 0;
  transform: translate(var(--space-3), var(--space-3));
  border-radius: var(--radius-l);
  background: var(--color-accent-tint);
  border: 1px solid var(--color-accent);
  z-index: 0;
}

.hero-portrait .portrait-img {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-2);
}

.portrait-plate {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.plate-tick {
  display: inline-block;
  width: 1.25rem;
  height: 2px;
  background: var(--color-accent-2);
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
  gap: var(--space-3);
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
  margin-top: var(--space-2);
}

/* Pillar band — slim */
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
  gap: var(--space-2);
  align-content: start;
  padding: var(--space-4) var(--space-4) var(--space-4) 0;
}

.pillar + .pillar {
  border-inline-start: 1px solid var(--color-border);
  padding-inline-start: var(--space-4);
}

.pillar-number {
  color: var(--color-accent);
  font-size: var(--text-sm);
}

.pillar h3 {
  font-size: var(--text-base);
}

.pillar-summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.band-more {
  margin-top: var(--space-5);
}

.band-more a {
  font-weight: 560;
  text-decoration: none;
  font-size: var(--text-sm);
}

/* Now */
.now-section {
  background: var(--color-surface);
  border-block: 1px solid var(--color-border);
}

.now-feed {
  display: grid;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.now-entry {
  display: grid;
  grid-template-columns: 5.5rem 1fr auto;
  gap: var(--space-4);
  align-items: baseline;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.now-date {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

.now-text {
  max-width: var(--prose-max);
}

/* Compact project rows under the flagship */
.project-rows {
  list-style: none;
  margin: var(--space-5) 0 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
}

.project-row {
  display: grid;
  grid-template-columns: 14rem 1fr auto auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: var(--color-text);
}

.row-name {
  font-family: var(--font-display);
  font-weight: 600;
}

.row-oneliner {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-arrow {
  color: var(--color-accent);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.project-row:hover .row-name {
  color: var(--color-accent);
}

.project-row:hover .row-arrow {
  opacity: 1;
}

/* Learning */
.learning-section {
  background: var(--color-surface);
  border-block: 1px solid var(--color-border);
}

.learning-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.learning-card {
  display: grid;
  gap: var(--space-1);
  border-top: 2px solid var(--color-text);
  padding-top: var(--space-3);
}

.learning-card h3 {
  font-size: var(--text-base);
}

.learning-card p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Principles — compact row */
.principles-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4) var(--space-6);
}

.principle {
  display: grid;
  gap: var(--space-1);
  border-top: 2px solid var(--color-text);
  padding-top: var(--space-3);
}

.principle h3 {
  font-size: var(--text-sm);
}

.principle p {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Process — chip flow */
.process-compact {
  margin-top: var(--space-7);
}

.process-flow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.process-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: var(--text-sm);
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  padding: 0.3em 0.9em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.chip-index {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.process-chip[data-human-gate] {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.process-chip[data-human-gate] .chip-index {
  color: var(--color-accent);
  font-weight: 600;
}

.process-legend {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: var(--prose-max);
}

.gate-dot {
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  border: 2px solid var(--color-accent);
  vertical-align: baseline;
}

/* Evidence */
.evidence-section {
  background: var(--color-surface);
  border-block: 1px solid var(--color-border);
}

/* CTA */
.cta-panel {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-7);
}

@media (max-width: 1040px) {
  .pillar-band {
    grid-template-columns: 1fr 1fr;
  }

  .pillar:nth-child(3) {
    border-inline-start: none;
    padding-inline-start: 0;
  }

  .principles-row {
    grid-template-columns: 1fr 1fr;
  }

  .project-row {
    grid-template-columns: 1fr auto;
  }

  .row-oneliner {
    display: none;
  }
}

@media (max-width: 1040px) {
  .hero-layout {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .hero-portrait {
    order: -1;
    width: clamp(11rem, 40vw, 14rem);
  }
}

@media (max-width: 760px) {
  .pillar-band,
  .learning-grid,
  .principles-row {
    grid-template-columns: 1fr;
  }

  .pillar + .pillar {
    border-inline-start: none;
    padding-inline-start: 0;
    border-top: 1px solid var(--color-border);
  }

  .now-entry {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }
}
</style>
