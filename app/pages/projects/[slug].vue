<script setup lang="ts">
import { getProject, profile, projects } from '~/data/portfolio'
import { PILLAR_TITLES } from '~~/shared/schemas/index'
import { stripMarkers } from '~~/shared/markers'

const route = useRoute()
const project = getProject(route.params.slug as string)

if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const nextCycle = projects.filter((p) => !p.demo)
const nextProject = computed(() => {
  const index = nextCycle.findIndex((p) => p.slug === project.slug)
  return nextCycle[(index + 1) % nextCycle.length] ?? project
})

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'role', label: 'Role' },
  { id: 'research', label: 'Research' },
  { id: 'solution', label: 'Solution' },
  { id: 'governance', label: 'Governance' },
  { id: 'execution', label: 'Execution' },
  { id: 'reflection', label: 'Reflection' }
]

usePageMeta({
  title: stripMarkers(project.name),
  description: project.seoDescription ?? stripMarkers(project.oneLiner)
})

// Per-project structured data: projects with a public repository are
// SoftwareSourceCode, the rest CreativeWork. The payload comes from
// zod-validated content JSON, so inline serialization is safe.
const repo = project.publicLinks.find((l) => l.kind === 'repository')
const { siteUrl } = useRuntimeConfig().public
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': repo ? 'SoftwareSourceCode' : 'CreativeWork',
        'name': stripMarkers(project.name),
        'description': project.seoDescription ?? stripMarkers(project.oneLiner),
        'url': new URL(`/projects/${project.slug}`, siteUrl).href,
        ...(repo ? { codeRepository: repo.url } : {}),
        'author': { '@type': 'Person', 'name': profile.name, 'url': siteUrl }
      })
    }
  ]
})
</script>

<template>
  <article v-if="project" class="case-study">
    <header class="case-header">
      <div class="container">
        <NuxtLink to="/projects" class="back-link">← All projects</NuxtLink>

        <!-- Two columns when a portrait exists: the argument on one side, the
             photograph on the other — the homepage hero's arrangement. -->
        <div class="case-lead" :data-portrait="project.portrait ? '' : undefined">
          <div class="case-lead-text">
            <p class="eyebrow">
              {{ project.pillars.map((p) => PILLAR_TITLES[p]).join(' · ') }}
            </p>
            <h1><MarkedText :text="project.name" /></h1>
            <p class="lede"><MarkedText :text="project.oneLiner" /></p>
            <p v-if="project.question" class="case-question">
              <MarkedText :text="project.question" />
            </p>

            <aside v-if="project.results.length" class="header-outcomes" aria-label="Key results">
              <p class="outcomes-label mono">Results</p>
              <ClaimList :claims="project.results.slice(0, 2)" />
            </aside>
          </div>

          <figure v-if="project.portrait" class="case-portrait">
            <span class="portrait-backplate" aria-hidden="true" />
            <img
              :src="project.portrait.src"
              :alt="project.portrait.alt"
              :width="project.portrait.width"
              :height="project.portrait.height"
              class="portrait-img"
              fetchpriority="high"
            >
            <figcaption v-if="project.portrait.caption" class="portrait-plate mono">
              <span class="plate-tick" aria-hidden="true" />
              <span>{{ project.portrait.caption }}</span>
            </figcaption>
          </figure>
        </div>

        <figure v-if="project.cover" class="case-cover">
          <img :src="project.cover.src" :alt="project.cover.alt" loading="lazy">
          <figcaption v-if="project.cover.caption">{{ project.cover.caption }}</figcaption>
        </figure>

        <dl class="case-meta">
          <div>
            <dt>Status</dt>
            <dd><StatusBadge :status="project.status" /></dd>
          </div>
          <div>
            <dt>Deployment</dt>
            <dd><DeploymentBadge :deployment="project.deployment" /></dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd class="mono">{{ project.timeline.label }}</dd>
          </div>
        </dl>

        <div class="header-links">
          <a
            v-for="live in project.publicLinks.filter((l) => l.kind === 'demo' || l.kind === 'website')"
            :key="live.url"
            :href="live.url"
            target="_blank"
            rel="noopener"
            class="btn btn-primary"
          >{{ live.label }}<span aria-hidden="true"> ↗</span></a>
          <LinkStrip :links="project.publicLinks.filter((l) => l.kind !== 'demo' && l.kind !== 'website')" />
        </div>
      </div>
    </header>

    <nav class="case-nav" aria-label="Case study sections">
      <div class="container">
        <ul role="list">
          <li v-for="section in NAV_SECTIONS" :key="section.id">
            <a :href="`#${section.id}`">{{ section.label }}</a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container case-body">
      <section :id="'overview'" class="case-section">
        <h2>What problem this attacks</h2>
        <div class="prose">
          <MarkedText tag="p" :text="project.problem" />
          <h3>Who it serves</h3>
          <MarkedText tag="p" :text="project.targetUsers" />
          <h3>Why it matters</h3>
          <MarkedText tag="p" :text="project.whyItMatters" />
        </div>
      </section>

      <section :id="'role'" class="case-section">
        <h2>What I actually did</h2>
        <div class="prose">
          <h3>My exact role</h3>
          <MarkedText tag="p" :text="project.exactRole" />
          <h3>Team contributions</h3>
          <MarkedText tag="p" :text="project.teamContributions" />
        </div>
      </section>

      <section :id="'research'" class="case-section">
        <h2>What was researched and validated</h2>
        <div class="prose">
          <h3>Research</h3>
          <MarkedText tag="p" :text="project.research" />
          <h3>Validation so far</h3>
          <MarkedText tag="p" :text="project.validation" />
        </div>
      </section>

      <section :id="'solution'" class="case-section">
        <h2>How the solution works</h2>
        <div class="prose">
          <MarkedText tag="p" :text="project.proposedSolution" />
          <h3>User workflow</h3>
          <ol class="workflow">
            <li v-for="(step, i) in project.userWorkflow" :key="i">
              <MarkedText :text="step" />
            </li>
          </ol>
          <h3>System architecture</h3>
          <MarkedText tag="p" :text="project.systemArchitecture" />
          <h3>Methods</h3>
          <MarkedText tag="p" :text="project.methods" />
        </div>

        <RepoTree v-if="project.repoStructure" :structure="project.repoStructure" class="repo-block" />
      </section>

      <section :id="'governance'" class="case-section">
        <h2>Business, rules, and risk</h2>
        <div class="prose">
          <h3>Business value</h3>
          <MarkedText tag="p" :text="project.businessValue" />
          <h3>Contracts &amp; policy considerations</h3>
          <MarkedText tag="p" :text="project.contractsPolicy" />
          <h3>Data &amp; privacy</h3>
          <MarkedText tag="p" :text="project.dataPrivacy" />
          <h3>Risks</h3>
          <ul>
            <li v-for="(risk, i) in project.risks" :key="i"><MarkedText :text="risk" /></li>
          </ul>
        </div>

        <aside class="approval-panel">
          <h3>Where humans approve</h3>
          <ul>
            <li v-for="(point, i) in project.humanApprovalPoints" :key="i">
              <MarkedText :text="point" />
            </li>
          </ul>
        </aside>

        <GovernanceArtifact v-if="project.artifact" :artifact="project.artifact" class="artifact-block" />
      </section>

      <section :id="'execution'" class="case-section">
        <h2>What exists and what the evidence shows</h2>
        <div class="prose">
          <h3>Technical decisions</h3>
          <ol>
            <li v-for="(decision, i) in project.technicalDecisions" :key="i">
              <MarkedText :text="decision" />
            </li>
          </ol>
        </div>
        <h3 class="sub">Completed work</h3>
        <ClaimList :claims="project.completedWork" />
        <h3 class="sub">The receipts</h3>
        <ClaimList :claims="project.evidence" />
        <template v-if="project.gallery?.length">
          <h3 class="sub">Photographs</h3>
          <div class="case-gallery">
            <figure v-for="image in project.gallery" :key="image.src">
              <img
                :src="image.src"
                :alt="image.alt"
                :width="image.width"
                :height="image.height"
                loading="lazy"
              >
              <figcaption v-if="image.caption">{{ image.caption }}</figcaption>
            </figure>
          </div>
        </template>
        <h3 class="sub">Results</h3>
        <ClaimList :claims="project.results" />
      </section>

      <section :id="'reflection'" class="case-section">
        <h2>What limits it, and what I learned</h2>
        <div class="limitations-grid">
          <div>
            <h3>Constraints <span class="hint">(imposed)</span></h3>
            <ul>
              <li v-for="(item, i) in project.limitations.constraints" :key="i">
                <MarkedText :text="item" />
              </li>
            </ul>
          </div>
          <div>
            <h3>Tradeoffs <span class="hint">(chosen)</span></h3>
            <ul>
              <li v-for="(item, i) in project.limitations.tradeoffs" :key="i">
                <MarkedText :text="item" />
              </li>
            </ul>
          </div>
        </div>
        <div class="prose">
          <h3>Lessons learned</h3>
          <ul>
            <li v-for="(lesson, i) in project.lessonsLearned" :key="i">
              <MarkedText :text="lesson" />
            </li>
          </ul>
          <h3>What gets validated next</h3>
          <ul>
            <li v-for="(step, i) in project.nextValidation" :key="i">
              <MarkedText :text="step" />
            </li>
          </ul>
        </div>

        <aside v-if="project.aiAssistance" class="ai-panel">
          <h3>AI assistance on this project</h3>
          <p><MarkedText :text="project.aiAssistance.scope" /></p>
          <p><strong>Human-owned:</strong> <MarkedText :text="project.aiAssistance.humanOwned" /></p>
          <p class="ai-more"><NuxtLink to="/colophon">Full AI policy →</NuxtLink></p>
        </aside>
      </section>

      <footer class="case-footer">
        <div class="next-project">
          <p class="eyebrow">Next case study</p>
          <NuxtLink :to="`/projects/${nextProject.slug}`" class="next-link">
            <MarkedText :text="nextProject.name" /> →
          </NuxtLink>
        </div>
        <div class="case-cta">
          <p>Working on something in this space?</p>
          <NuxtLink to="/contact" class="btn btn-primary">Get in touch</NuxtLink>
        </div>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.case-header {
  padding-block: var(--space-8) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.case-header .container {
  display: grid;
  /* minmax(0, 1fr), not the implicit auto track: an auto track grows to its
     items' min-content width, so one unbreakable token could drag the whole
     header wider than the viewport. Items stay content-width via
     justify-items: start, so this changes nothing visually. */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  justify-items: start;
}

.case-header h1 {
  /* A project title can be a bare domain ("chamroeunhongleng.me") with no
     space to wrap at. `anywhere` — not `break-word` — because only `anywhere`
     also shrinks the element's min-content width, which is what stops the
     grid track from overflowing a 393px phone. */
  overflow-wrap: anywhere;
}

.back-link {
  display: inline-flex;
  align-items: center;
  font-size: var(--text-sm);
  text-decoration: none;
  color: var(--color-text-muted);
}

@media (pointer: coarse) {
  .back-link,
  .next-link {
    min-height: 44px;
  }
}

.back-link:hover {
  color: var(--color-accent);
}

.case-question {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--text-lg);
  color: var(--color-accent-2);
  max-width: var(--prose-max);
}

.header-outcomes {
  display: grid;
  gap: var(--space-3);
  max-width: var(--prose-max);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  background: var(--color-surface-sunken);
}

.outcomes-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
}

/* Lead block — one column normally, two when a portrait is present. */
.case-lead {
  width: 100%;
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.case-lead[data-portrait] {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-9);
  align-items: center;
}

.case-lead-text {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  max-width: 52rem;
}

/* Same archival plate as the homepage portrait: offset accent backplate,
   hairline frame, mono caption plate with a terracotta tick. */
.case-portrait {
  position: relative;
  margin: 0;
  width: clamp(13rem, 21vw, 17rem);
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

.case-portrait .portrait-img {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-2);
}

.portrait-plate {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-top: var(--space-4);
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--color-text-faint);
}

.plate-tick {
  flex: none;
  width: 1.25rem;
  height: 2px;
  margin-top: 0.5em;
  background: var(--color-accent-2);
}

.case-cover {
  margin: 0;
  max-width: 52rem;
}

.case-cover img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
}

.case-cover figcaption {
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.case-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 20rem));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.case-gallery figure {
  margin: 0;
}

.case-gallery img {
  width: 100%;
  height: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
}

.case-gallery figcaption {
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--color-text-faint);
}

.case-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
  margin: 0;
}

.case-meta dt {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
  margin-bottom: var(--space-1);
}

.case-meta dd {
  margin: 0;
}

.header-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.case-nav {
  position: sticky;
  top: 4rem;
  z-index: 40;
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}

.case-nav ul {
  display: flex;
  gap: var(--space-5);
  list-style: none;
  margin: 0;
  padding: var(--space-1) 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.case-nav ul::-webkit-scrollbar {
  display: none;
}

.case-nav a {
  display: flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.case-nav a:hover {
  color: var(--color-accent);
}

.case-body {
  display: grid;
  gap: var(--space-10);
  padding-block: var(--space-8);
}

.case-section {
  display: grid;
  gap: var(--space-5);
  max-width: 52rem;
  /* Clear both sticky bars (header + section nav) when jumping to an anchor. */
  scroll-margin-top: 8.5rem;
}

.case-section > h2 {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.case-section h3 {
  font-size: var(--text-lg);
  margin-top: var(--space-2);
}

.sub {
  font-family: var(--font-display);
}

.hint {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-faint);
  font-style: italic;
}

.workflow {
  display: grid;
  gap: var(--space-2);
  counter-reset: step;
}

.approval-panel,
.ai-panel {
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-l);
  padding: var(--space-5);
  background: var(--color-accent-tint);
  display: grid;
  gap: var(--space-3);
}

.approval-panel h3,
.ai-panel h3 {
  margin: 0;
  font-size: var(--text-base);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.approval-panel ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}

.ai-panel p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.ai-more a {
  font-weight: 560;
}

/* Alone on its own line, so it can take the full target height without
   disturbing anything around it. */
@media (pointer: coarse) {
  .ai-more a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
}

.artifact-block,
.repo-block {
  margin-top: var(--space-2);
}

.limitations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.limitations-grid ul {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.case-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-8);
}

.next-link {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  text-decoration: none;
}

.case-cta {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}

.case-cta p {
  color: var(--color-text-muted);
}

@media (max-width: 1040px) {
  .case-lead[data-portrait] {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }

  .case-portrait {
    width: clamp(11rem, 40vw, 14rem);
  }
}

@media (max-width: 760px) {
  .limitations-grid {
    grid-template-columns: 1fr;
  }

  .case-header {
    padding-block: var(--space-6) var(--space-5);
  }

  .approval-panel,
  .ai-panel {
    padding: var(--space-4);
  }
}
</style>
