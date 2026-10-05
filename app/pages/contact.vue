<script setup lang="ts">
import { contact, profile } from '~/data/portfolio'
import { hasMarker } from '~~/shared/markers'

usePageMeta({
  title: 'Contact',
  description:
    'How to reach Chamroeun Hongleng for research, product collaborations, and governance practice opportunities.'
})

// Privacy-safe contact: the email publishes only after the owner confirms it.
const emailReady = computed(() => !hasMarker(contact.email))

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contact.email)
    copyState.value = 'copied'
    setTimeout(() => (copyState.value = 'idle'), 2500)
  } catch {
    // Clipboard access can be denied (permissions, insecure context) — say so
    // instead of failing silently; the address itself stays selectable.
    copyState.value = 'failed'
  }
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
        <div class="form-col">
          <ContactForm />

          <div v-if="emailReady" class="direct-contact card">
            <Glyph name="mail" plaque />
            <div class="direct-body">
              <p class="direct-label">Prefer email?</p>
              <p class="direct-row">
                <a :href="`mailto:${contact.email}`" class="direct-email-lg">{{ contact.email }}</a>
                <button type="button" class="copy-btn pill" @click="copyEmail">Copy</button>
              </p>
              <span
                role="status"
                aria-live="polite"
                class="copy-status"
                :class="{ failed: copyState === 'failed' }"
              >
                {{
                  copyState === 'copied'
                    ? 'Email copied to clipboard.'
                    : copyState === 'failed'
                      ? 'Copy failed — please select the address and copy it manually.'
                      : ''
                }}
              </span>
              <p class="direct-note"><MarkedText :text="contact.responseExpectation" /></p>
            </div>
          </div>
        </div>

        <aside class="contact-side">
          <div class="side-card card">
            <Glyph name="briefcase" plaque />
            <div class="side-body">
              <h2>Right now</h2>
              <p>{{ profile.availability }}</p>
            </div>
          </div>

          <div v-if="profile.cv" class="side-card card">
            <Glyph name="file" plaque />
            <div class="side-body">
              <h2>CV</h2>
              <p>
                <a :href="profile.cv.url" target="_blank" rel="noopener" class="pill">
                  {{ profile.cv.label }}
                </a>
              </p>
            </div>
          </div>

          <div class="side-card card">
            <Glyph name="users" plaque />
            <div class="side-body">
              <h2>Profiles</h2>
              <ul class="side-socials" role="list" aria-label="Profiles">
                <li v-for="social in contact.socials" :key="social.url">
                  <SocialProfileLink :label="social.label" :url="social.url" tone="muted" icon-only round />
                </li>
              </ul>
            </div>
          </div>

          <div class="side-card card">
            <Glyph name="pin" plaque />
            <div class="side-body">
              <h2>Location</h2>
              <p>{{ contact.location }}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--space-8);
  align-items: start;
}

.form-col {
  display: grid;
  gap: var(--space-5);
  align-content: start;
}

/* Direct contact — the reliable path, directly under the form. */
.direct-contact {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-5);
}

.direct-body {
  display: grid;
  gap: var(--space-2);
}

.direct-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-strong);
  color: var(--color-text-muted);
}

.direct-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  max-width: none;
}

.direct-email-lg {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  color: var(--color-text);
  text-decoration-color: var(--color-accent);
  overflow-wrap: anywhere;
}

.direct-email-lg:hover {
  color: var(--color-accent);
}

.copy-status {
  font-size: var(--text-sm);
  color: var(--color-positive);
  min-height: 1.2em;
}

/* The same live region carries the failure message — it must not read green. */
.copy-status.failed {
  color: var(--color-danger);
}

.direct-note {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
}

/* Side panel */
.contact-side {
  display: grid;
  gap: var(--space-4);
  position: sticky;
  top: 6rem;
}

.side-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-5);
}

.side-body {
  display: grid;
  gap: var(--space-2);
}

.side-body h2 {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  font-weight: var(--weight-strong);
  color: var(--color-text-faint);
}

.side-body p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.side-socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 1040px) {
  .contact-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .contact-side {
    position: static;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  }
}

@media (pointer: coarse) {
  .direct-email-lg {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
