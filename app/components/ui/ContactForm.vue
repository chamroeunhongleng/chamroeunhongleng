<script setup lang="ts">
import { computed, reactive, useId } from 'vue'
import { contact, profile } from '~/data/portfolio'
import { hasMarker } from '~~/shared/markers'

/**
 * The contact form, shared by /contact and the homepage.
 *
 * Backend-free by design: submitting composes the email in the visitor's own
 * mail app. The form itself sends nothing to any server. (The site's one
 * runtime network call is the separate chat assistant, disclosed in the widget
 * and on /colophon.)
 *
 * Control ids come from useId(), so two forms on one page can never produce
 * duplicate ids (check:a11y fails on those).
 */
const uid = useId()
const ids = {
  name: `${uid}-name`,
  email: `${uid}-email`,
  inquiry: `${uid}-inquiry`,
  message: `${uid}-message`
}

// Privacy-safe contact: the email publishes only after the owner confirms it.
// Until then, GitHub is the contact path.
const emailReady = computed(() => !hasMarker(contact.email))
const github = computed(() => profile.links.find((l) => l.label === 'GitHub'))

const form = reactive({
  name: '',
  email: '',
  inquiry: contact.inquiryTypes[0]?.title ?? '',
  message: ''
})

const inquiryHint = computed(
  () => contact.inquiryTypes.find((i) => i.title === form.inquiry)?.description
)

function submitForm() {
  const type = contact.inquiryTypes.find((i) => i.title === form.inquiry)
  const subject = `${type?.subject ?? 'Hello'} — from ${form.name}`
  const body = `${form.message}\n\n—\n${form.name}\nReply to: ${form.email}`
  window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
</script>

<template>
  <form class="contact-form card" @submit.prevent="submitForm">
    <div class="field-row">
      <div class="field">
        <label :for="ids.name">Name</label>
        <input
          :id="ids.name"
          v-model="form.name"
          type="text"
          name="name"
          autocomplete="name"
          required
        >
      </div>
      <div class="field">
        <label :for="ids.email">Email</label>
        <input
          :id="ids.email"
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          required
        >
      </div>
    </div>

    <div class="field">
      <label :for="ids.inquiry">Type of inquiry</label>
      <select :id="ids.inquiry" v-model="form.inquiry" name="inquiry">
        <option v-for="inquiry in contact.inquiryTypes" :key="inquiry.title" :value="inquiry.title">
          {{ inquiry.title }}
        </option>
      </select>
      <p class="field-hint">{{ inquiryHint }}</p>
    </div>

    <div class="field">
      <label :for="ids.message">Message</label>
      <textarea
        :id="ids.message"
        v-model="form.message"
        name="message"
        rows="6"
        required
        placeholder="What are you building, what stage is it at, and what do you need?"
      />
    </div>

    <template v-if="emailReady">
      <button type="submit" class="btn btn-primary form-submit">Send message</button>
      <p class="form-note">
        This opens the message in your own email app — the form itself sends nothing to any
        server.
      </p>
    </template>
    <div v-else class="form-fallback">
      <p class="form-note">
        A public email is not published yet, so the form cannot send. The fastest way to reach me
        right now is GitHub:
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
</template>

<style scoped>
.contact-form {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-7);
}

.field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-5);
}

.field {
  display: grid;
  gap: var(--space-2);
}

.field label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-m);
  padding: 0.7em 0.9em;
  /* 16px on purpose: iOS Safari zooms the page into any smaller field. */
  font-size: var(--text-base);
  color: var(--color-text);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.field input:hover,
.field select:hover,
.field textarea:hover {
  border-color: var(--color-border-strong);
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
  min-height: 8rem;
  line-height: var(--leading-normal);
}

.field-hint {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  min-height: 2.6em;
}

.form-submit {
  width: 100%;
}

.form-note {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  max-width: 52ch;
}

.form-fallback {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  border-top: 1px dashed var(--color-border-strong);
  padding-top: var(--space-5);
}

@media (max-width: 760px) {
  .contact-form {
    padding: var(--space-5);
  }

  .field-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 400px) {
  .contact-form {
    padding: var(--space-4);
  }
}

@media (pointer: coarse) {
  .field input,
  .field select {
    min-height: 44px;
  }
}
</style>
