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

// The homepage keeps only the two rules a recruiter needs to read; the full
// list stays in principles.json and on the colophon-linked process story.
const heroPrinciples = principles.principles.slice(0, 2)

// The flagship (an explicit owner decision: flagship: true in the project
// JSON) leads the grid; the rest keep the loader's status-ranked order.
const flagship = featuredProjects.find((p) => p.flagship)
const workProjects = flagship
  ? [flagship, ...featuredProjects.filter((p) => p !== flagship)]
  : featuredProjects

// One calm sentence naming the four pillars; the full story lives on /about.
const pillarLine = interests.pillars
  .map((p, i, all) => (i === all.length - 1 ? `and ${p.title.toLowerCase()}` : p.title.toLowerCase()))
  .join(', ')

// Below-fold sections fade in as they enter the viewport (no-op for no-JS,
// reduced-motion, and automated runs — see useReveal).
useReveal()
</script>

<template>
  <div class="home">
    <!-- Hero — name-first, one calm column. The h1 is the person, not a
         slogan: the reference-portfolio pattern that reads most professional. -->
    <section class="hero section" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <header class="hero-head">
          <img
            v-if="profile.photo"
            :src="profile.photo.src"
            :alt="profile.photo.alt"
            class="hero-avatar"
            width="640"
            height="640"
            fetchpriority="high"
          >
          <div class="hero-id">
            <h1 id="hero-title" class="hero-name">{{ profile.name }}</h1>
            <p class="hero-role">Software engineering &amp; applied-ML student · {{ profile.location.text }}</p>
          </div>
          <ul class="hero-links" role="list" aria-label="Profiles and documents">
            <li v-for="link in profile.links" :key="link.url">
              <a :href="link.url" target="_blank" rel="noopener">
                {{ link.label }} <span class="ext" aria-hidden="true">↗</span>
              </a>
            </li>
            <li v-if="profile.cv">
              <a :href="profile.cv.url" target="_blank" rel="noopener">{{ profile.cv.label }}</a>
            </li>
            <li><a :href="`mailto:${contact.email}`">Email</a></li>
          </ul>
        </header>

        <div class="hero-prose">
          <p class="hero-statement">{{ profile.headline }}</p>
          <p v-for="(paragraph, i) in profile.intro" :key="i" class="hero-intro-p">{{ paragraph }}</p>
          <p class="hero-identity"><MarkedText :text="profile.identity" /></p>
        </div>

        <p class="hero-availability">
          <span class="availability-dot" aria-hidden="true" />
          {{ profile.availability }}
        </p>

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
    </section>

    <!-- Selected work — screenshot-led grid, whole card clickable. -->
    <section class="section" aria-labelledby="work-label">
      <div class="container">
        <h2 id="work-label" class="quiet-label">Selected work</h2>
        <ul class="work-grid" role="list">
          <li v-for="project in workProjects" :key="project.slug" data-reveal>
            <article class="work-card">
              <!-- alt is empty on purpose: the project name sits right below,
                   so a description here would only pad the link's accessible
                   name. The full alt rides the same image on the case study. -->
              <img
                v-if="project.cover"
                :src="project.cover.src"
                alt=""
                :width="project.cover.width"
                :height="project.cover.height"
                class="work-cover"
                loading="lazy"
              >
              <div class="work-title-row">
                <h3 class="work-name">
                  <NuxtLink :to="`/projects/${project.slug}`" class="card-link work-link">
                    <MarkedText :text="project.name" />
                  </NuxtLink>
                </h3>
                <StatusBadge :status="project.status" />
              </div>
              <p class="work-oneliner"><MarkedText :text="project.oneLiner" /></p>
            </article>
          </li>
        </ul>
        <p class="band-more"><NuxtLink to="/projects">All projects →</NuxtLink></p>
      </div>
    </section>

    <!-- Now -->
    <section id="now" class="section" aria-labelledby="now-label">
      <div class="container">
        <h2 id="now-label" class="quiet-label">Now</h2>
        <ul class="now-feed" role="list">
          <li v-for="(entry, i) in now.entries" :key="i" class="now-entry" data-reveal>
            <span class="now-date mono">{{ entry.date }}</span>
            <p class="now-text"><MarkedText :text="entry.text" /></p>
            <EvidenceLabel :evidence="entry.evidence" />
          </li>
        </ul>
      </div>
    </section>

    <!-- How I work — two principles, then the four-pillar line. -->
    <section id="process" class="section" aria-labelledby="process-label">
      <div class="container">
        <h2 id="process-label" class="quiet-label">How I work</h2>
        <div class="principles-row">
          <article v-for="principle in heroPrinciples" :key="principle.title" class="principle" data-reveal>
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.text }}</p>
          </article>
        </div>
        <p class="process-legend">
          I work across {{ pillarLine }} —
          <NuxtLink to="/about">why these connect</NuxtLink>. The full process and AI policy
          live on the <NuxtLink to="/colophon">colophon</NuxtLink>.
        </p>
      </div>
    </section>

    <!-- Contact -->
    <section class="section" aria-labelledby="contact-label">
      <div class="container contact-block" data-reveal>
        <h2 id="contact-label" class="quiet-label">Contact</h2>
        <p class="contact-line">
          I am a student looking for internships, research opportunities, and product work where
          the technical side meets business and governance questions. If that sounds useful, I
          would be glad to hear from you.
        </p>
        <div class="contact-actions">
          <a :href="`mailto:${contact.email}`" class="btn btn-primary">Email me</a>
          <NuxtLink to="/contact" class="btn btn-secondary">Contact page</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* The homepage reads as one narrow, calm column — quieter than the site
   frame. Flat background throughout: hairlines inside lists, no bands. */
.home .container {
  max-width: 46rem;
}

/* Hero */
.hero-grid {
  display: grid;
  gap: var(--space-6);
  padding-block: var(--space-6) 0;
}

.hero-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-5);
}

.hero-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
  flex: 0 0 auto;
}

.hero-id {
  display: grid;
  gap: var(--space-1);
  margin-inline-end: auto;
}

.hero-name {
  font-size: var(--text-2xl);
}

.hero-role {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

/* The link strip renders ONLY at phone widths — the owner's decision
   (2026-08-13): on desktop the header (CV) and footer (socials, email)
   already carry these, and the hero stays clean. */
.hero-links {
  display: none;
}

.hero-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-size: var(--text-sm);
  font-weight: 560;
  text-decoration: none;
  color: var(--color-accent);
  white-space: nowrap;
}

.hero-links a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.ext {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
}

@media (pointer: coarse) {
  .hero-links a {
    min-height: 44px;
  }
}

.hero-prose {
  display: grid;
  gap: var(--space-3);
}

/* The owner-approved statement leads as plain confident prose — no italics,
   no display color. Restraint is the register. */
.hero-statement {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  max-width: var(--prose-max);
}

.hero-intro-p {
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  max-width: var(--prose-max);
}

.hero-identity {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  border-inline-start: 2px solid var(--color-accent);
  padding-inline-start: var(--space-3);
}

/* The internship signal — a fact, so it keeps the mono audit-trail register. */
.hero-availability {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: 60ch;
}

.availability-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-positive);
  flex: 0 0 auto;
  align-self: center;
}

/* Hero metrics — hairline-separated so the row reads as one strip. */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
  list-style: none;
  margin: 0;
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

/* Quiet section label — the h2 itself is the small stamp, so the heading
   outline stays honest while the page stays calm. */
.quiet-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin-bottom: var(--space-5);
}

/* Selected work — unboxed cards: screenshot, name, one line. */
.work-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-7) var(--space-6);
  list-style: none;
  margin: 0;
  padding: 0;
}

.work-card {
  position: relative;
  display: grid;
  gap: var(--space-2);
  align-content: start;
  height: 100%;
}

.work-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  background: var(--color-surface);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.work-card:hover .work-cover {
  border-color: var(--color-border-strong);
}

/* start-aligned so a two-line project name keeps the badge on its first
   line instead of floating it at half height. */
.work-title-row {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.work-title-row .status-badge {
  margin-top: 0.15em;
}

.work-name {
  font-size: var(--text-base);
  min-width: 0;
  overflow-wrap: anywhere;
}

.work-name a {
  color: var(--color-text);
  text-decoration: none;
}

.work-card:hover .work-name a {
  color: var(--color-accent);
}

.work-oneliner {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.band-more {
  margin-top: var(--space-6);
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

/* Principles — compact row on hairlines. */
.principles-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4) var(--space-6);
}

.principle {
  display: grid;
  gap: var(--space-1);
  border-top: 1px solid var(--color-border);
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

/* Contact — plain, no panel. */
.contact-block {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.contact-block .quiet-label {
  margin-bottom: 0;
}

.contact-line {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: var(--prose-max);
}

.contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

@media (max-width: 760px) {
  /* The strip the owner likes on phones: full row under the name. */
  .hero-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .work-grid,
  .principles-row {
    grid-template-columns: 1fr;
  }

  .now-entry {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  /* Narrow screens wrap the strip; hairline separators come off entirely. */
  .hero-stats {
    flex-direction: column;
    gap: var(--space-3);
  }

  .hero-stat + .hero-stat {
    border-inline-start: none;
    padding-inline-start: 0;
  }
}
</style>
