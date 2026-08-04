<script setup lang="ts">
import { contact, profile } from '~/data/portfolio'
import { hasMarker } from '~~/shared/markers'

usePageMeta({
  title: 'Contact',
  description:
    'How to reach Chamroeun Hongleng for research, internships, product collaborations, and governance practice opportunities.'
})

// Privacy-safe contact: the email publishes only after the owner confirms it
// in OWNER_INPUT.md. Until then, GitHub is the contact path.
const emailReady = computed(() => !hasMarker(contact.email))
const github = computed(() => profile.links.find((l) => l.label === 'GitHub'))

const copied = ref(false)
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contact.email)
    copied.value = true
    setTimeout(() => (copied.value = false), 2500)
  } catch {
    copied.value = false
  }
}

function mailto(subject: string): string {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`
}
</script>

<template>
  <div class="contact-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="Contact"
        title="Start a conversation"
        text="Tell me what you are building, what stage it is at, and where it touches AI, business, or governance questions — context beats formality."
      />

      <!-- Primary contact panel -->
      <div class="contact-panel">
        <div class="panel-main">
          <template v-if="emailReady">
            <p class="panel-label">Email</p>
            <div class="email-row">
              <a :href="mailto('Hello from your portfolio')" class="email-address">{{ contact.email }}</a>
              <button type="button" class="btn btn-secondary" @click="copyEmail">Copy</button>
            </div>
            <span role="status" aria-live="polite" class="copy-status">
              {{ copied ? 'Email copied to clipboard.' : '' }}
            </span>
          </template>
          <template v-else>
            <p class="panel-label">Best route right now</p>
            <p class="panel-pending">
              A public email is not published yet — the fastest way to reach me is an issue or
              discussion on any of my repositories.
            </p>
            <a
              v-if="github"
              :href="github.url"
              target="_blank"
              rel="noopener"
              class="btn btn-primary"
            >Reach me on GitHub ↗</a>
          </template>
        </div>

        <div class="panel-side">
          <ul class="panel-socials" role="list" aria-label="Profiles">
            <li v-for="social in contact.socials" :key="social.url">
              <SocialProfileLink :label="social.label" :url="social.url" tone="muted" icon-only />
            </li>
          </ul>
          <dl class="panel-facts">
            <div>
              <dt>Location</dt>
              <dd>{{ contact.location }}</dd>
            </div>
            <div>
              <dt>Response time</dt>
              <dd><MarkedText :text="contact.responseExpectation" /></dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- What to write about -->
      <section class="inquiries" aria-labelledby="inquiries-title">
        <h2 id="inquiries-title" class="rule-title">Good reasons to write</h2>
        <ul role="list" class="inquiry-list">
          <li v-for="inquiry in contact.inquiryTypes" :key="inquiry.title" class="inquiry">
            <h3>{{ inquiry.title }}</h3>
            <p><MarkedText :text="inquiry.description" /></p>
            <a v-if="emailReady" :href="mailto(inquiry.subject)" class="inquiry-action">
              Email about this →
            </a>
          </li>
        </ul>
      </section>

      <!-- Boundaries -->
      <section class="boundaries" aria-labelledby="boundaries-title">
        <h2 id="boundaries-title" class="rule-title">Honest boundaries</h2>
        <div class="boundaries-grid">
          <div>
            <h3>Looking for</h3>
            <ul role="list">
              <li v-for="item in contact.boundaries.seeking" :key="item">
                <MarkedText :text="item" />
              </li>
            </ul>
          </div>
          <div>
            <h3>Not looking for</h3>
            <ul role="list">
              <li v-for="item in contact.boundaries.notSeeking" :key="item">
                <MarkedText :text="item" />
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Primary panel */
.contact-panel {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-8);
  align-items: start;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-7);
}

.panel-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-accent-2);
  margin-bottom: var(--space-3);
}

.email-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.email-address {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  text-decoration: none;
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.email-address:hover {
  color: var(--color-accent);
}

.copy-status {
  display: block;
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-positive);
  min-height: 1.2em;
}

.panel-pending {
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
  max-width: 48ch;
}

.panel-side {
  display: grid;
  gap: var(--space-5);
  justify-items: start;
}

.panel-socials {
  display: flex;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: 0;
}

.panel-facts {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}

.panel-facts dt {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
}

.panel-facts dd {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
}

/* Section rules */
.rule-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent-2);
  font-weight: 500;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.inquiries,
.boundaries {
  margin-top: var(--space-10);
}

.inquiry-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6) var(--space-8);
  list-style: none;
  padding: 0;
  margin: var(--space-6) 0 0;
}

.inquiry {
  display: grid;
  gap: var(--space-2);
  align-content: start;
  border-top: 2px solid var(--color-text);
  padding-top: var(--space-3);
}

.inquiry h3 {
  font-size: var(--text-lg);
}

.inquiry p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.inquiry-action {
  font-size: var(--text-sm);
  font-weight: 560;
  text-decoration: none;
  width: fit-content;
}

.boundaries-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  margin-top: var(--space-6);
}

.boundaries-grid h3 {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: var(--color-text-faint);
  margin-bottom: var(--space-3);
}

.boundaries-grid ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-inline-start: 1.1rem;
}

.boundaries-grid li {
  font-size: var(--text-sm);
}

@media (max-width: 760px) {
  .contact-panel {
    grid-template-columns: 1fr;
    padding: var(--space-5);
  }

  .inquiry-list,
  .boundaries-grid {
    grid-template-columns: 1fr;
  }
}
</style>
