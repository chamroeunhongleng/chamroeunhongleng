<script setup lang="ts">
// Leaf component — no Nuxt dependencies so it mounts bare in vitest.
withDefaults(
  defineProps<{
    role: 'user' | 'assistant'
    text: string
    /** Label only the first bubble of a run — repeating it is noise. */
    showLabel?: boolean
  }>(),
  { showLabel: true }
)
</script>

<template>
  <div class="chat-message" :data-role="role">
    <p v-if="showLabel" class="chat-message-label mono">
      {{ role === 'user' ? 'You' : 'Assistant' }}
    </p>
    <p class="chat-message-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.chat-message {
  display: grid;
  gap: var(--space-1);
  max-width: 85%;
}

.chat-message[data-role='user'] {
  justify-self: end;
  justify-items: end;
}

.chat-message[data-role='assistant'] {
  justify-self: start;
  justify-items: start;
}

.chat-message-label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  padding-inline: var(--space-1);
}

.chat-message-text {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-text);
  background: var(--color-surface-sunken);
  border-radius: var(--radius-m);
  padding: var(--space-2) var(--space-3);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  text-align: start;
}

.chat-message[data-role='user'] .chat-message-text {
  background: var(--color-accent-tint);
  border-start-end-radius: var(--radius-s);
}

.chat-message[data-role='assistant'] .chat-message-text {
  border-start-start-radius: var(--radius-s);
}
</style>
