<script setup lang="ts">
import { experience } from '~/data/portfolio'

/**
 * A preview of /journey: current roles first, then the competition, then the
 * finished community work. The school-year results and the field research stay
 * on the Journey page. Group ids are the ids in content/experience.json; if the
 * preview would come out empty, it falls back to the first entries of every
 * group rather than rendering nothing.
 */
function pick(groupId: string, current: boolean) {
  const group = experience.groups.find((g) => g.id === groupId)
  if (!group) return []
  return group.entries
    .filter((entry) => entry.current === current)
    .map((entry) => ({ entry, category: group.title, groupId: group.id }))
}

const preferred = [
  ...pick('current', true),
  ...pick('community', true),
  ...pick('competitions', false),
  ...pick('community', false)
]

const items
  = preferred.length > 0
    ? preferred
    : experience.groups.map((g) => ({ entry: g.entries[0]!, category: g.title, groupId: g.id }))

// The first contribution that carries a public receipt, for the verify arrow.
function receiptFor(entry: (typeof items)[number]['entry']) {
  return entry.contributions.find((c) => c.link)
}
</script>

<template>
  <section id="journey" class="section" aria-labelledby="journey-title">
    <div class="container">
      <SectionHeading
        id="journey-title"
        eyebrow="Journey"
        title="How I got here"
        mark="got here"
        text="The short version, newest first. The long one — every step, with its evidence — is on the Journey page."
      />

      <ol class="timeline" role="list">
        <li
          v-for="item in items"
          :key="`${item.groupId}-${item.entry.organization}-${item.entry.role}`"
          class="tl-item"
          :data-current="item.entry.current || undefined"
        >
          <span class="tl-dot" aria-hidden="true" />
          <article class="card tl-card" data-reveal>
            <div class="tl-head">
              <div class="tl-title">
                <h3><MarkedText :text="item.entry.role" /></h3>
                <p class="tl-org"><MarkedText :text="item.entry.organization" /></p>
              </div>
              <p class="tl-period mono">{{ item.entry.period }}</p>
            </div>
            <p class="tl-summary"><MarkedText :text="item.entry.summary" /></p>
            <div class="tl-foot">
              <span class="tl-category">{{ item.category }}</span>
              <span v-if="item.entry.current" class="pill pill-live tl-current">
                <span class="dot" aria-hidden="true" />Current
              </span>
              <EvidenceLabel
                v-if="receiptFor(item.entry)"
                :evidence="receiptFor(item.entry)!.evidence"
                :link="receiptFor(item.entry)!.link"
              />
            </div>
          </article>
        </li>
      </ol>

      <NuxtLink to="/journey" class="btn btn-secondary journey-more">
        Read the full journey <Glyph name="arrow-right" />
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0 0 0 var(--space-7);
}

/* The rail. */
.timeline::before {
  content: '';
  position: absolute;
  left: 0.55rem;
  top: var(--space-5);
  bottom: var(--space-5);
  width: 2px;
  background: var(--color-border);
}

.tl-item {
  position: relative;
}

.tl-dot {
  position: absolute;
  left: calc(0.175rem - var(--space-7));
  top: var(--space-6);
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: var(--color-bg);
  border: 2px solid var(--color-accent);
}

.tl-item[data-current] .tl-dot {
  background: var(--color-accent);
  box-shadow: 0 0 0 0.25rem var(--color-accent-tint);
}

.tl-card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
}

.tl-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.tl-title {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.tl-title h3 {
  font-size: var(--text-lg);
}

.tl-org {
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
  color: var(--color-accent);
}

.tl-period {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  white-space: nowrap;
}

.tl-summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: 76ch;
}

.tl-foot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
}

.tl-category {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-faint);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 0.2em 0.7em;
}

.tl-current {
  font-size: var(--text-xs);
  padding: 0.2em 0.7em;
}

.journey-more {
  margin-top: var(--space-6);
  margin-inline-start: var(--space-7);
}

.journey-more .glyph {
  width: 1rem;
  height: 1rem;
}

/* Phones: this is a preview, so each summary shows its first lines only —
   the whole text is one tap away on the Journey page (and still in the page
   for screen readers). */
@media (max-width: 760px) {
  .tl-summary {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
  }

  .journey-more {
    display: flex;
    margin-inline-start: 0;
  }
}

@media (max-width: 480px) {
  .timeline {
    padding-left: var(--space-5);
  }

  .tl-dot {
    left: calc(0.175rem - var(--space-5));
  }

  .tl-card {
    padding: var(--space-4);
  }
}
</style>
