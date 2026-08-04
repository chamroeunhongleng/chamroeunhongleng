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

      <div class="contact-grid">
        <div class="contact-main">
          <div class="inquiry-grid">
            <article v-for="inquiry in contact.inquiryTypes" :key="inquiry.title" class="inquiry">
              <h2>{{ inquiry.title }}</h2>
              <p><MarkedText :text="inquiry.description" /></p>
              <a
                v-if="emailReady"
                :href="mailto(inquiry.subject)"
                class="inquiry-action"
              >Email about this →</a>
              <SocialProfileLink
                v-else-if="github"
                label="Reach me via GitHub"
                :url="github.url"
                class="inquiry-action"
              />
            </article>
          </div>

          <div v-if="emailReady" class="email-row">
            <p class="mono email-address">{{ contact.email }}</p>
            <button type="button" class="btn btn-secondary" @click="copyEmail">Copy email</button>
            <span role="status" aria-live="polite" class="copy-status">
              {{ copied ? 'Email copied to clipboard.' : '' }}
            </span>
          </div>
          <div v-else class="email-pending">
            <p>
              <MarkedText :text="contact.email" />
            </p>
            <p class="pending-note">
              Until a public email is confirmed, the fastest route is opening an issue or
              discussion on any of my repositories.
            </p>
          </div>
        </div>

        <aside class="contact-side">
          <section class="side-card">
            <h2>Looking for</h2>
            <ul role="list">
              <li v-for="item in contact.boundaries.seeking" :key="item">
                <MarkedText :text="item" />
              </li>
            </ul>
          </section>

          <section class="side-card">
            <h2>Not looking for</h2>
            <ul role="list">
              <li v-for="item in contact.boundaries.notSeeking" :key="item">
                <MarkedText :text="item" />
              </li>
            </ul>
          </section>

          <section class="side-card">
            <h2>Details</h2>
            <dl class="detail-list">
              <div>
                <dt>Location</dt>
                <dd>{{ contact.location }}</dd>
              </div>
              <div>
                <dt>Response time</dt>
                <dd><MarkedText :text="contact.responseExpectation" /></dd>
              </div>
            </dl>
            <ul role="list" class="social-list">
              <li v-for="social in contact.socials" :key="social.url">
                <SocialProfileLink :label="social.label" :url="social.url" />
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-10);
  align-items: start;
}

.inquiry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.inquiry {
  display: grid;
  gap: var(--space-3);
  align-content: start;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-5);
}

.inquiry h2 {
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
}

.email-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.email-address {
  font-size: var(--text-base);
}

.copy-status {
  font-size: var(--text-sm);
  color: var(--color-positive);
  min-height: 1.2em;
}

.email-pending {
  margin-top: var(--space-6);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-l);
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
}

.pending-note {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.contact-side {
  display: grid;
  gap: var(--space-5);
}

.side-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
}

.side-card h2 {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: var(--color-text-muted);
}

.side-card ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}

.side-card li {
  font-size: var(--text-sm);
}

.detail-list {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}

.detail-list dt {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-faint);
}

.detail-list dd {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
}

.social-list {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

@media (max-width: 1040px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .inquiry-grid {
    grid-template-columns: 1fr;
  }
}
</style>
