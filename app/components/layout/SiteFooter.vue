<script setup lang="ts">
import { contact, profile } from '~/data/portfolio'

// Baked at prerender; recomputed identically at hydration. Advances on redeploy.
const YEAR = new Date().getFullYear()

// The header holds six items; the footer carries every page, Learning included.
const FOOTER_NAV = [
  { label: 'Projects', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Journey', to: '/journey' },
  { label: 'Learning', to: '/learning' },
  { label: 'CV', to: '/cv' },
  { label: 'Contact', to: '/contact' }
]
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-thanks">
      <p class="hand thanks-note">thanks for reading this far</p>
      <a :href="`mailto:${contact.email}`" class="thanks-link">
        Say hello <Glyph name="arrow-up-right" />
      </a>
    </div>

    <div class="container footer-row">
      <div class="footer-brand">
        <NuxtLink to="/" class="footer-name">
          <span class="footer-monogram" aria-hidden="true">{{ profile.monogram }}</span>
          <span>{{ profile.name }}</span>
        </NuxtLink>
        <p class="footer-line">
          {{ profile.location.text }} ·
          <a :href="`mailto:${contact.email}`" class="footer-email">{{ contact.email }}</a>
        </p>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <ul role="list">
          <li v-for="item in FOOTER_NAV" :key="item.to">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <ul class="footer-social" role="list" aria-label="Profiles">
        <li v-for="link in profile.links" :key="link.url">
          <SocialProfileLink :label="link.label" :url="link.url" tone="muted" icon-only round />
        </li>
      </ul>
    </div>

    <div class="container footer-meta">
      <p>© {{ YEAR }} {{ profile.name }} · Every important claim on this site carries an evidence label.</p>
      <NuxtLink to="/colophon" class="colophon-link">Colophon &amp; AI policy</NuxtLink>
    </div>

    <!-- The name once more, very large and very faint — a signature, not a
         heading. Decorative: hidden from assistive technology. -->
    <p class="footer-wordmark" aria-hidden="true">{{ profile.preferredName }}</p>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  margin-top: var(--section-gap);
  border-top: 1px solid var(--color-border);
  padding-block: var(--space-8) 0;
  overflow: hidden;
}

/* A handwritten sign-off and one last way to get in touch. */
.footer-thanks {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  margin-bottom: var(--space-8);
}

.thanks-note {
  font-size: var(--text-3xl);
  transform: rotate(-2deg);
  transform-origin: left center;
}

.thanks-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-heading);
  letter-spacing: var(--tracking-heading);
  color: var(--color-text);
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.25em;
}

.thanks-link:hover {
  color: var(--color-accent);
}

.thanks-link .glyph {
  width: 1.1em;
  height: 1.1em;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5) var(--space-8);
  flex-wrap: wrap;
}

.footer-brand {
  display: grid;
  gap: var(--space-2);
}

.footer-name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  width: fit-content;
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-heading);
  color: var(--color-text);
  text-decoration: none;
}

.footer-monogram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: var(--radius-m);
  background: var(--color-text);
  color: var(--color-bg);
  font-weight: var(--weight-display);
  font-size: var(--text-xs);
}

.footer-line {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.footer-email {
  color: var(--color-text-muted);
  text-decoration-color: var(--color-border-strong);
}

.footer-email:hover {
  color: var(--color-accent);
}

/* Tappable height for the site's contact address. Padding on an inline element
   grows the hit box without adding to the line box. */
@media (pointer: coarse) {
  .footer-email {
    padding-block: 0.85rem;
  }

  .thanks-link {
    min-height: 44px;
  }
}

.footer-nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-nav a {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  text-decoration: none;
}

.footer-nav a:hover {
  color: var(--color-accent);
}

@media (pointer: coarse) {
  .footer-nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
}

.footer-social {
  display: flex;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-meta {
  margin-top: var(--space-7);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.footer-meta p {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  max-width: none;
}

.colophon-link {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  text-decoration: none;
}

.colophon-link:hover {
  color: var(--color-accent);
}

@media (pointer: coarse) {
  .colophon-link {
    min-height: 40px;
  }
}

/* Sized to the screen, centred even when it is wider than the screen, and
   cut off by the footer's bottom edge. */
.footer-wordmark {
  display: flex;
  justify-content: center;
  /* The baseline sits on the footer's edge: whole letters, clipped descenders. */
  margin: var(--space-6) 0 -0.04em;
  max-width: none;
  font-family: var(--font-display);
  font-size: clamp(4rem, 18.5vw, 19rem);
  font-weight: var(--weight-display);
  line-height: 0.8;
  letter-spacing: var(--tracking-display);
  white-space: nowrap;
  color: var(--color-surface-sunken);
  user-select: none;
  pointer-events: none;
}

@media (max-width: 760px) {
  .footer-thanks {
    margin-bottom: var(--space-6);
  }

  .thanks-note {
    font-size: var(--text-2xl);
  }

  .thanks-link {
    font-size: var(--text-xl);
  }
}
</style>
