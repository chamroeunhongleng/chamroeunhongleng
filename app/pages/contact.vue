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

const form = reactive({
  name: '',
  email: '',
  inquiry: contact.inquiryTypes[0]?.title ?? '',
  message: ''
})

// The form is backend-free by design: submitting composes the email in the
// visitor's own mail app. Nothing is sent to, or stored on, any server.
function submitForm() {
  const type = contact.inquiryTypes.find((i) => i.title === form.inquiry)
  const subject = `${type?.subject ?? 'Hello'} — from ${form.name}`
  const body = `${form.message}\n\n—\n${form.name}\nReply to: ${form.email}`
  window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

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
        <!-- The form -->
        <form class="contact-form" @submit.prevent="submitForm">
          <div class="field-row">
            <div class="field">
              <label for="contact-name">Name</label>
              <input
                id="contact-name"
                v-model="form.name"
                type="text"
                name="name"
                autocomplete="name"
                required
              >
            </div>
            <div class="field">
              <label for="contact-email">Email</label>
              <input
                id="contact-email"
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                required
              >
            </div>
          </div>

          <div class="field">
            <label for="contact-inquiry">Type of inquiry</label>
            <select id="contact-inquiry" v-model="form.inquiry" name="inquiry">
              <option v-for="inquiry in contact.inquiryTypes" :key="inquiry.title" :value="inquiry.title">
                {{ inquiry.title }}
              </option>
            </select>
            <p class="field-hint">
              {{ contact.inquiryTypes.find((i) => i.title === form.inquiry)?.description }}
            </p>
          </div>

          <div class="field">
            <label for="contact-message">Message</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              rows="7"
              required
              placeholder="What are you building, what stage is it at, and what do you need?"
            />
          </div>

          <template v-if="emailReady">
            <button type="submit" class="btn btn-primary">Send message</button>
            <p class="form-note">
              This opens the message in your own email app — nothing is sent to or stored on any
              server.
            </p>
          </template>
          <div v-else class="form-fallback">
            <p class="form-note">
              A public email is not published yet, so the form cannot send. The fastest way to
              reach me right now is GitHub:
            </p>
            <a
              v-if="github"
              :href="github.url"
              target="_blank"
              rel="noopener"
              class="btn btn-primary"
            >Reach me on GitHub ↗</a>
          </div>
        </form>

        <!-- Side panel -->
        <aside class="contact-side">
          <div class="side-block">
            <h2>Availability</h2>
            <p>{{ profile.availability }}</p>
          </div>

          <div class="side-block">
            <h2>Response time</h2>
            <p><MarkedText :text="contact.responseExpectation" /></p>
          </div>

          <div v-if="emailReady" class="side-block">
            <h2>Prefer email?</h2>
            <div class="direct-row">
              <a :href="`mailto:${contact.email}`" class="direct-email mono">{{ contact.email }}</a>
              <button type="button" class="copy-btn mono" @click="copyEmail">Copy</button>
            </div>
            <span role="status" aria-live="polite" class="copy-status">
              {{ copied ? 'Email copied to clipboard.' : '' }}
            </span>
          </div>

          <div class="side-block">
            <h2>Profiles</h2>
            <ul class="side-socials" role="list" aria-label="Profiles">
              <li v-for="social in contact.socials" :key="social.url">
                <SocialProfileLink :label="social.label" :url="social.url" tone="muted" icon-only />
              </li>
            </ul>
          </div>

          <div class="side-block">
            <h2>Location</h2>
            <p>{{ contact.location }}</p>
          </div>
        </aside>
      </div>

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
.contact-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-10);
  align-items: start;
}

/* Form */
.contact-form {
  display: grid;
  gap: var(--space-5);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-l);
  background: var(--color-surface);
  padding: var(--space-7);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.field {
  display: grid;
  gap: var(--space-2);
}

.field label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-m);
  padding: 0.65em 0.9em;
  font-size: var(--text-base);
  color: var(--color-text);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.field input:focus-visible,
.field select:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
  border-color: var(--color-accent);
}

.field textarea {
  resize: vertical;
  min-height: 9rem;
  line-height: var(--leading-normal);
}

.field-hint {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  min-height: 2.6em;
}

.contact-form .btn {
  justify-self: start;
}

.form-note {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  max-width: 48ch;
}

.form-fallback {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  border-top: 1px dashed var(--color-border-strong);
  padding-top: var(--space-5);
}

/* Side panel */
.contact-side {
  display: grid;
  gap: var(--space-6);
  position: sticky;
  top: 5.5rem;
}

.side-block {
  display: grid;
  gap: var(--space-2);
  border-top: 2px solid var(--color-text);
  padding-top: var(--space-3);
}

.side-block h2 {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  font-weight: 500;
  color: var(--color-accent-2);
}

.side-block p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.direct-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.direct-email {
  font-size: var(--text-sm);
  text-decoration: none;
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.direct-email:hover {
  color: var(--color-accent);
}

.copy-btn {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-s);
  padding: 0.2em 0.6em;
}

.copy-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.copy-status {
  font-size: var(--text-sm);
  color: var(--color-positive);
  min-height: 1.2em;
}

.side-socials {
  display: flex;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Boundaries */
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

.boundaries {
  margin-top: var(--space-10);
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

@media (max-width: 1040px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .contact-side {
    position: static;
  }
}

@media (max-width: 760px) {
  .contact-form {
    padding: var(--space-5);
  }

  .field-row,
  .boundaries-grid {
    grid-template-columns: 1fr;
  }
}
</style>
