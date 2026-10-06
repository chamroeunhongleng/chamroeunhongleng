<script setup lang="ts">
import { contact, profile } from '~/data/portfolio'

// The space between the spans keeps the heading's accessible name intact.
const nameWords = profile.name.split(' ')
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">CHNAI LAB · Software · Applied ML</p>

        <div class="hero-title-row">
          <h1 id="hero-title" class="display hero-name">
            <template v-for="(word, i) in nameWords" :key="i">
              <span class="hero-name-word">{{ word }}</span>{{ i < nameWords.length - 1 ? ' ' : '' }}
            </template>
          </h1>
          <HeroMascot />
        </div>

        <p class="hero-role">Software &amp; <span class="nowrap">applied-ML</span> student</p>

        <p class="hero-statement">{{ profile.headline }}</p>

        <div class="hero-ctas">
          <a href="#work" class="btn btn-primary">See what I've built <Glyph name="arrow-down" /></a>
          <NuxtLink to="/cv" class="btn btn-secondary"><Glyph name="file" /> Read my CV</NuxtLink>
          <a :href="`mailto:${contact.email}`" class="btn btn-secondary"><Glyph name="mail" /> Email me</a>
        </div>

        <!-- Phones only: on wider screens the header and footer carry these links. -->
        <ul class="hero-links" role="list" aria-label="Profiles">
          <li v-for="link in profile.links" :key="link.url">
            <a :href="link.url" target="_blank" rel="noopener">
              {{ link.label }} <span class="ext" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>

      <HeroPortrait
        v-if="profile.photo"
        class="hero-portrait"
        :photo="profile.photo"
        :location="profile.location.text"
      />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  padding-block: var(--space-10) var(--space-8);
}

/* Dotted paper behind the hero, fading out toward the text. */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: radial-gradient(var(--color-border-strong) 1px, transparent 1.5px);
  background-size: 1.375rem 1.375rem;
  -webkit-mask-image: radial-gradient(ellipse 55% 75% at 78% 42%, black 10%, transparent 72%);
  mask-image: radial-gradient(ellipse 55% 75% at 78% 42%, black 10%, transparent 72%);
  opacity: 0.7;
  pointer-events: none;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: var(--space-10);
  align-items: center;
}

/* Above the portrait: on narrower desktops the mascot's bubble reaches into
   the photo's backplate, and it should sit on top of it, not under it. */
.hero-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: var(--space-5);
  justify-items: start;
  min-width: 0;
}

/* The mascot hangs just right of the name's first line, outside the flow, so
   the longest word never pushes it onto a line of its own. */
.hero-title-row {
  position: relative;
  width: fit-content;
}

.hero-title-row .mascot {
  position: absolute;
  top: var(--space-1);
  left: calc(100% + var(--space-5));
  margin-top: var(--space-6);
}

.hero-name-word {
  display: block;
}

.nowrap {
  white-space: nowrap;
}

.hero-role {
  margin-top: calc(var(--space-3) * -1);
  font-family: var(--font-display);
  font-size: var(--text-display-sm);
  font-weight: var(--weight-display);
  line-height: var(--leading-heading);
  letter-spacing: var(--tracking-display);
  color: var(--color-accent-2);
  text-wrap: balance;
}

.hero-statement {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 58ch;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hero-links {
  display: none;
}

.hero-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
  text-decoration: none;
  white-space: nowrap;
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

@media (max-width: 1040px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }
}

/* Phones: .hero-copy dissolves (display: contents) so the portrait can lead and
   the rest follows in the order set below. */
@media (max-width: 760px) {
  .hero {
    padding-block: var(--space-5) var(--space-6);
  }

  .hero::before {
    -webkit-mask-image: linear-gradient(to bottom, black, transparent 60%);
    mask-image: linear-gradient(to bottom, black, transparent 60%);
    opacity: 0.5;
  }

  .hero-grid {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .hero-copy {
    display: contents;
  }

  .hero-portrait {
    order: 1;
  }

  .hero-eyebrow {
    order: 2;
    margin-top: var(--space-2);
  }

  .hero-title-row {
    order: 3;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-2) var(--space-4);
    width: auto;
  }

  .hero-title-row .mascot {
    position: relative;
    top: auto;
    left: auto;
  }

  .hero-role {
    order: 4;
    margin-top: calc(var(--space-2) * -1);
  }

  .hero-statement {
    order: 5;
  }

  .hero-ctas {
    order: 6;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }

  .hero-ctas .btn-primary {
    grid-column: 1 / -1;
  }

  .hero-links {
    order: 7;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-4);
    list-style: none;
    margin: 0;
    padding: 0;
  }
}
</style>
