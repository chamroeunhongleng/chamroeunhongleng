<script setup lang="ts">
import { profile } from '~/data/portfolio'

const YEAR = 2026
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <p class="footer-name">{{ profile.name }}</p>
        <p class="footer-line">{{ profile.headline }}</p>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <ul role="list">
          <li><NuxtLink to="/projects">Projects</NuxtLink></li>
          <li><NuxtLink to="/experience">Experience</NuxtLink></li>
          <li><NuxtLink to="/learning">Learning</NuxtLink></li>
          <li><NuxtLink to="/about">About</NuxtLink></li>
          <li><NuxtLink to="/contact">Contact</NuxtLink></li>
          <li><NuxtLink to="/colophon">Colophon &amp; AI policy</NuxtLink></li>
        </ul>
      </nav>

      <ul class="footer-social" role="list" aria-label="Profiles">
        <li v-for="link in profile.links" :key="link.url">
          <SocialProfileLink :label="link.label" :url="link.url" tone="muted" />
        </li>
      </ul>
    </div>

    <div class="container footer-meta">
      <p>© {{ YEAR }} {{ profile.name }}. Every important claim on this site carries an evidence label.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: var(--section-gap);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
  padding-block: var(--space-8) var(--space-6);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-8);
}

.footer-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-lg);
}

.footer-line {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-2);
}

.footer-nav ul,
.footer-social {
  display: grid;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-nav a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--text-sm);
}

.footer-nav a:hover {
  color: var(--color-accent);
}

.footer-meta {
  margin-top: var(--space-8);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.footer-meta p {
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  max-width: none;
}

@media (max-width: 760px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
</style>
