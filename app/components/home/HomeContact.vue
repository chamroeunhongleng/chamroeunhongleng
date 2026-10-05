<script setup lang="ts">
import { computed } from 'vue'
import { contact } from '~/data/portfolio'
import { hasMarker } from '~~/shared/markers'

const emailReady = computed(() => !hasMarker(contact.email))
</script>

<template>
  <section id="contact" class="section" aria-labelledby="contact-title">
    <div class="container contact-grid">
      <div class="contact-copy">
        <p class="eyebrow">Contact</p>
        <h2 id="contact-title" class="contact-title">
          Say <span class="contact-mark">hello<Scribble variant="underline" /></span>
        </h2>
        <p class="contact-line">
          I enjoy talking about research, product ideas, and work where the technical side meets
          business and governance questions. If that sounds useful, I would be glad to hear from
          you.
        </p>

        <div class="card steps">
          <p class="num-label">What happens next</p>
          <ol class="steps-list" role="list">
            <li>
              <span class="step-num mono" aria-hidden="true">01</span>
              <span>You write a few lines about the project or the question.</span>
            </li>
            <li>
              <span class="step-num mono" aria-hidden="true">02</span>
              <MarkedText :text="contact.responseExpectation" />
            </li>
            <li>
              <span class="step-num mono" aria-hidden="true">03</span>
              <span>If it is a fit, I suggest a next step. If it is not, I tell you honestly.</span>
            </li>
          </ol>
        </div>

        <p v-if="emailReady" class="prefer">
          Prefer plain email?
          <a :href="`mailto:${contact.email}`" class="prefer-email">{{ contact.email }}</a>
        </p>
      </div>

      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: var(--space-10);
  align-items: start;
}

.contact-copy {
  display: grid;
  gap: var(--space-5);
  align-content: start;
}

.contact-title {
  font-size: var(--text-h1);
}

.contact-mark {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  isolation: isolate;
}

.contact-mark .scribble {
  position: absolute;
  left: -2%;
  bottom: -0.16em;
  z-index: -1;
  width: 104%;
  height: 0.3em;
  color: var(--color-accent-2);
  --scribble-width: 3.5px;
}

.contact-line {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
}

.steps {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
}

.steps-list {
  display: grid;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.steps-list li {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.step-num {
  font-size: var(--text-xs);
  font-weight: var(--weight-strong);
  color: var(--color-accent);
  padding-top: 0.15em;
}

.prefer {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.prefer-email {
  font-weight: var(--weight-strong);
  overflow-wrap: anywhere;
}

@media (pointer: coarse) {
  .prefer-email {
    display: inline-block;
    padding-block: var(--space-2);
  }
}

@media (max-width: 1040px) {
  .contact-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }
}

@media (max-width: 760px) {
  .contact-grid {
    gap: var(--space-6);
  }

  .steps {
    padding: var(--space-5);
  }
}
</style>
