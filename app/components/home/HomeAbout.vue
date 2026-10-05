<script setup lang="ts">
import { experience, interests, principles, profile } from '~/data/portfolio'

// The first three working principles; all five live in principles.json and
// the full process is on the colophon.
const principleCards = principles.principles.slice(0, 3)

// The opening of his own account on /journey — quoted, not rewritten.
const storyOpening = experience.story?.steps[0]?.text

// One sentence naming the four pillars; the full story lives on /about.
const pillarLine = interests.pillars
  .map((p, i, all) => (i === all.length - 1 ? `and ${p.title.toLowerCase()}` : p.title.toLowerCase()))
  .join(', ')

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <section id="about" class="section" aria-labelledby="about-title">
    <div class="container">
      <SectionHeading id="about-title" eyebrow="About" title="A bit about me" mark="about me">
        <template v-if="storyOpening" #below>
          <figure class="story card">
            <span class="story-quote" aria-hidden="true">“</span>
            <blockquote class="story-text">
              <p><MarkedText :text="storyOpening" /></p>
            </blockquote>
            <figcaption class="story-by">
              <span class="hand">— {{ profile.preferredName }}</span>
              <NuxtLink to="/journey#story-title" class="story-link">
                Read the whole story <Glyph name="arrow-right" />
              </NuxtLink>
            </figcaption>
          </figure>
        </template>
        <template #aside>
          <p v-for="(paragraph, i) in profile.intro" :key="i">{{ paragraph }}</p>
          <p class="about-identity"><MarkedText :text="profile.identity" /></p>
          <NuxtLink to="/about" class="pill">More about me <Glyph name="arrow-right" /></NuxtLink>
        </template>
      </SectionHeading>

      <p class="hand rules-note" aria-hidden="true">
        three rules I work by <Scribble variant="arrow" class="rules-arrow" />
      </p>

      <!-- id="process" is a chat-assistant destination (shared/chat/navigation.ts). -->
      <ol id="process" class="card-row principles" data-cols="3" aria-label="Three rules I work by">
        <li
          v-for="(principle, i) in principleCards"
          :key="principle.title"
          class="card card-lift principle"
          data-reveal
        >
          <p class="principle-num" aria-hidden="true">{{ pad(i + 1) }}</p>
          <h3>{{ principle.title }}</h3>
          <p class="principle-text">{{ principle.text }}</p>
        </li>
      </ol>

      <p class="about-pillars">
        I work across {{ pillarLine }} —
        <NuxtLink to="/about">why these connect</NuxtLink>. The full process and AI policy live on
        the <NuxtLink to="/colophon">colophon</NuxtLink>.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* The pull-quote: his own words, set a little askew like a note pinned up. */
.story {
  position: relative;
  display: grid;
  gap: var(--space-4);
  margin: var(--space-6) 0 0;
  padding: var(--space-7) var(--space-6) var(--space-5);
  transform: rotate(-0.8deg);
}

.story-quote {
  position: absolute;
  top: var(--space-2);
  left: var(--space-5);
  font-family: var(--font-display);
  font-size: var(--text-display-sm);
  font-weight: var(--weight-display);
  line-height: 1;
  color: var(--color-accent-2);
}

.story-text {
  margin: 0;
}

.story-text p {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-snug);
}

.story-by {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.story-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
  text-decoration: none;
}

.story-link .glyph {
  width: 1rem;
  height: 1rem;
}

@media (pointer: coarse) {
  .story-link {
    min-height: 44px;
  }
}

.about-identity {
  font-size: var(--text-base);
  border-inline-start: 2px solid var(--color-accent);
  padding-inline-start: var(--space-3);
}

.rules-note {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  width: fit-content;
  margin: 0 0 var(--space-2) var(--space-4);
  transform: rotate(-2deg);
}

/* The stock arrow points up-left; turned, it curls down toward the cards. */
.rules-arrow {
  transform: rotate(-100deg) translateX(-0.5rem);
}

/* Each card takes one colour of the palette in turn. */
.principle {
  --card-accent: var(--color-accent);
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding: var(--space-6);
}

.principle:nth-child(3n + 2) {
  --card-accent: var(--color-accent-2);
}

.principle:nth-child(3n) {
  --card-accent: var(--color-positive);
}

.principle-num {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-display);
  line-height: 1;
  letter-spacing: var(--tracking-display);
  color: var(--card-accent);
}

/* Outlined numerals where the browser can draw them; solid colour otherwise. */
@supports (-webkit-text-stroke: 1px black) {
  .principle-num {
    color: transparent;
    -webkit-text-stroke: 1.5px var(--card-accent);
  }
}

.principle h3 {
  font-size: var(--text-xl);
}

.principle-text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* The short rule under each card, in the card's colour. */
.principle::after {
  content: '';
  width: 2rem;
  height: 3px;
  margin-top: var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--card-accent);
}

/* On wide screens the cards sit slightly out of line, like index cards laid
   on a desk; hovering one straightens it. */
@media (min-width: 761px) {
  .principle:nth-child(3n + 1) {
    rotate: -0.7deg;
  }

  .principle:nth-child(3n + 2) {
    rotate: 0.5deg;
    translate: 0 var(--space-2);
  }

  .principle:nth-child(3n) {
    rotate: -0.4deg;
  }

  .principle:hover {
    rotate: 0deg;
  }
}

.about-pillars {
  margin-top: var(--space-7);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

@media (max-width: 760px) {
  .story {
    margin-top: var(--space-4);
    padding: var(--space-7) var(--space-5) var(--space-4);
    transform: none;
  }

  .principle {
    padding: var(--space-5);
  }

  .about-pillars {
    margin-top: var(--space-5);
  }
}
</style>
