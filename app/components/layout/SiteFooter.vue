<script setup lang="ts">
import { contact, profile } from '~/data/portfolio'

// Baked at prerender; recomputed identically at hydration. Advances on redeploy.
const YEAR = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-row">
      <div class="footer-brand">
        <p class="footer-name">{{ profile.name }}</p>
        <p class="footer-line">
          {{ profile.location.text }} ·
          <a :href="`mailto:${contact.email}`" class="footer-email">{{ contact.email }}</a>
        </p>
      </div>

      <ul class="footer-social" role="list" aria-label="Profiles">
        <li v-for="link in profile.links" :key="link.url">
          <SocialProfileLink :label="link.label" :url="link.url" tone="muted" icon-only />
        </li>
      </ul>
    </div>

    <div class="container footer-meta">
      <p>© {{ YEAR }} {{ profile.name }} · Every important claim on this site carries an evidence label.</p>
      <NuxtLink to="/colophon" class="colophon-link">Colophon &amp; AI policy</NuxtLink>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: var(--section-gap);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
  padding-block: var(--space-7) var(--space-5);
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.footer-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-lg);
}

.footer-line {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.footer-email {
  color: var(--color-text-muted);
  text-decoration-color: var(--color-border-strong);
}

.footer-email:hover {
  color: var(--color-accent);
}

.footer-social {
  display: flex;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-meta {
  margin-top: var(--space-6);
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

@media (pointer: coarse) {
  .colophon-link {
    min-height: 40px;
  }
}

.colophon-link:hover {
  color: var(--color-accent);
}
</style>
