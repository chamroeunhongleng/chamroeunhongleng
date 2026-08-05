<script setup lang="ts">
import {
  contact,
  featuredProjects,
  interests,
  now,
  principles,
  profile
} from '~/data/portfolio'

usePageMeta({
  title: 'Software Engineering & Applied ML',
  description:
    'Chamroeun Hongleng — software engineering student in Phnom Penh building web and data systems, with applied-ML work in Khmer speech. Open to internships.'
})

// One flagship project carries the homepage; the rest are one-line rows.
// The flagship is an explicit owner decision (flagship: true in the project
// JSON); the clickable-site heuristic is only a fallback.
const flagship
  = featuredProjects.find((p) => p.flagship)
  ?? featuredProjects.find((p) =>
    p.publicLinks.some((l) => l.kind === 'demo' || l.kind === 'website')
  )
  ?? featuredProjects[0]
const moreProjects = featuredProjects.filter((p) => p !== flagship)

// The homepage keeps only the two rules a recruiter needs to read; the full
// list stays in principles.json and on the colophon-linked process story.
const heroPrinciples = principles.principles.slice(0, 2)
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero section" aria-labelledby="hero-title">
      <div class="container hero-layout">
        <div class="hero-grid">
          <p class="eyebrow">{{ profile.name }} · {{ profile.location.text }}</p>
          <h1 id="hero-title">Software engineering, and the machine learning underneath it</h1>
          <p class="hero-statement">{{ profile.headline }}</p>
          <p class="hero-availability">{{ profile.availability }}</p>
          <div class="hero-intro">
            <p v-for="(paragraph, i) in profile.intro" :key="i" class="lede">{{ paragraph }}</p>
          </div>
          <p class="hero-identity"><MarkedText :text="profile.identity" /></p>
          <div class="hero-actions">
            <NuxtLink to="/projects" class="btn btn-primary">View projects</NuxtLink>
            <a :href="`mailto:${contact.email}`" class="btn btn-secondary">Email me</a>
          </div>

          <!-- Three numbers a recruiter can scan in seconds. Values restate
               claims that exist elsewhere with the same evidence labels. -->
          <ul v-if="profile.metrics?.length" class="hero-stats" role="list">
            <li v-for="metric in profile.metrics" :key="metric.award" class="hero-stat">
              <span class="stat-value mono">{{ metric.award }}</span>
              <span class="stat-label">
                <a
                  v-if="metric.link"
                  :href="metric.link"
                  target="_blank"
                  rel="noopener"
                >{{ metric.event }} <span aria-hidden="true">↗</span></a>
                <template v-else>{{ metric.event }}</template>
              </span>
            </li>
          </ul>
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
          title="What I have built so far"
        />
        <ProjectCard v-if="flagship" :project="flagship" />
        <ul class="project-rows" role="list">
          <li v-for="project in moreProjects" :key="project.slug">
            <NuxtLink :to="`/projects/${project.slug}`" class="project-row">
              <!-- Thumbnail where a project has one; an empty cell otherwise, so
                   the rows stay aligned whether or not every project ships art.
                   alt is empty on purpose: the project name sits right beside it,
                   so a description here would only pad the link's accessible name.
                   The full alt text still rides the same image on the case study. -->
              <img
                v-if="project.cover"
                :src="project.cover.src"
                alt=""
                :width="project.cover.width"
                :height="project.cover.height"
                class="row-thumb"
                loading="lazy"
              >
              <span v-else class="row-thumb row-thumb-empty" aria-hidden="true" />
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

    <!-- Principles, compact -->
    <section id="process" class="section">
      <div class="container">
        <SectionHeading eyebrow="How I work" title="Rules I work by" />

        <div class="principles-row">
          <article v-for="principle in heroPrinciples" :key="principle.title" class="principle">
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.text }}</p>
          </article>
        </div>

        <p class="process-legend">
          The full process and AI policy live on the
          <NuxtLink to="/colophon">colophon</NuxtLink>.
        </p>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="section">
      <div class="container cta-panel">
        <h2>Open to internships and collaborations</h2>
        <p class="lede">
          I am a student looking for internships, research opportunities, and product work where
          the technical side meets business and governance questions. If that sounds useful, I
          would be glad to hear from you.
        </p>
        <div class="hero-actions">
          <a :href="`mailto:${contact.email}`" class="btn btn-primary">Email me</a>
          <NuxtLink to="/contact" class="btn btn-secondary">Contact page</NuxtLink>
        </div>
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

/* The internship signal, above the fold — a fact, so it takes the mono
   audit-trail register rather than display prose. */
.hero-availability {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: 52ch;
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

/* Hero metrics — the numeric register (mono, like the availability line),
   hairline-separated so the row reads as one strip, not three cards. */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
  list-style: none;
  margin: var(--space-3) 0 0;
  padding: 0;
}

.hero-stat {
  display: grid;
  gap: var(--space-1);
  align-content: start;
}

.hero-stat + .hero-stat {
  border-inline-start: 1px solid var(--color-border);
  padding-inline-start: var(--space-5);
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-accent-2);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  max-width: 22ch;
}

.stat-label a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--color-border-strong);
  text-underline-offset: 2px;
}

.stat-label a:hover {
  color: var(--color-accent);
  text-decoration-color: currentColor;
}

@media (pointer: coarse) {
  .stat-label a {
    display: inline-block;
    padding-block: var(--space-1);
  }
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
  display: inline-flex;
  align-items: center;
  font-weight: 560;
  text-decoration: none;
  font-size: var(--text-sm);
}

@media (pointer: coarse) {
  .band-more a {
    min-height: 40px;
  }
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
  grid-template-columns: 6rem 14rem 1fr auto auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: var(--color-text);
}

/* Same plated treatment as .card-cover, at row scale. */
.row-thumb {
  width: 6rem;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-s);
}

/* Reserves the column so names stay aligned, but draws nothing — a visible
   empty plate reads as a broken image rather than as "no screenshot yet". */
.row-thumb-empty {
  border-color: transparent;
}

.row-name {
  font-family: var(--font-display);
  font-weight: 600;
  /* Needed for the minmax(0, 1fr) track to actually take effect: a grid item
     will not shrink past its own min-content unless allowed to. A bare domain
     name has no break opportunity, hence anywhere rather than break-word. */
  min-width: 0;
  overflow-wrap: anywhere;
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

/* Principles — compact row */
.principles-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.process-legend {
  margin-top: var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: var(--prose-max);
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

  /* The one-liner column drops out; thumb, name, status, and arrow keep one row.
     minmax(0, 1fr) for the name column: a bare 1fr keeps an auto floor, so a
     long project name ("chamroeunhongleng.me") set its own min-content as the
     track minimum and pushed the status badge and arrow off a 320px screen. */
  .project-row {
    grid-template-columns: 4.5rem minmax(0, 1fr) auto auto;
    gap: var(--space-3);
  }

  .row-thumb {
    width: 4.5rem;
  }

  .row-oneliner {
    display: none;
  }
}

@media (max-width: 1040px) {
  .hero-layout {
    /* minmax(0, …) so a long token can never widen the track past the page. */
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }

  .hero-portrait {
    order: -1;
    width: clamp(11rem, 40vw, 14rem);
  }

  /* The portrait plate and the eyebrow render the same string — name ·
     location. Side by side in two columns that reads as a caption; stacked,
     the portrait moves above the text (order: -1) and the line repeats itself
     immediately. Keep the plate only where the columns are side by side.
     The photo keeps its alt text, so nothing is lost for assistive tech. */
  .portrait-plate {
    display: none;
  }
}

@media (max-width: 760px) {
  .pillar-band,
  .principles-row {
    grid-template-columns: 1fr;
  }

  /* Narrow screens wrap the strip; a sibling-combinator border would leave a
     dangling hairline on wrapped rows, so the separators come off entirely. */
  .hero-stats {
    flex-direction: column;
    gap: var(--space-3);
  }

  .hero-stat + .hero-stat {
    border-inline-start: none;
    padding-inline-start: 0;
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

  .cta-panel {
    padding: var(--space-5);
  }
}
</style>
