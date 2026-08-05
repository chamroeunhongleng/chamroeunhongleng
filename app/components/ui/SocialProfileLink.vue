<script setup lang="ts">
import { computed } from 'vue'

type SocialPlatform = 'github' | 'linkedin' | 'x' | 'generic'

const props = withDefaults(
  defineProps<{
    label: string
    url: string
    tone?: 'accent' | 'muted'
    /** Icon-only presentation: the label stays for screen readers. */
    iconOnly?: boolean
  }>(),
  {
    tone: 'accent',
    iconOnly: false
  }
)

const platform = computed<SocialPlatform>(() => {
  let hostname = ''

  try {
    hostname = new URL(props.url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    // Keep the generic icon when content contains an invalid or relative URL.
  }

  if (hostname === 'github.com' || hostname.endsWith('.github.com')) return 'github'
  if (hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')) return 'linkedin'
  if (hostname === 'x.com' || hostname.endsWith('.x.com') || hostname === 'twitter.com') return 'x'
  return 'generic'
})
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener"
    class="social-profile-link"
    :class="[`social-profile-link--${tone}`, { 'social-profile-link--icon-only': iconOnly }]"
    :data-platform="platform"
    :aria-label="`${label} (opens in a new tab)`"
  >
    <svg
      v-if="platform === 'github'"
      class="social-profile-link__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.7 4.9 18.7 5.2 18.7 5.2c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>

    <svg
      v-else-if="platform === 'linkedin'"
      class="social-profile-link__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.4 20.5h-3.5v-5.6c0-1.3 0-3-1.9-3-1.8 0-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.2 2.4 4.2 5.5v6.3ZM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1Zm1.8 13.1H3.6V9h3.5v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0Z" />
    </svg>

    <svg
      v-else-if="platform === 'x'"
      class="social-profile-link__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.2 2.3h3.3l-7.2 8.2 8.5 11.3h-6.6L11 14.9l-6 6.9H1.7l7.7-8.9L1.3 2.3h6.8l4.7 6.2 5.4-6.2Zm-1.1 17.5h1.8L7.1 4.1h-2l12 15.7Z" />
    </svg>

    <svg
      v-else
      class="social-profile-link__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.5A8.1 8.1 0 0 1 18.9 8ZM12 4c.8 1 1.5 2.3 1.9 4h-3.8c.4-1.7 1.1-3 1.9-4ZM4.3 14a7.9 7.9 0 0 1 0-4h3.8a16.9 16.9 0 0 0 0 4H4.3Zm.8 2h3a15.7 15.7 0 0 0 1.4 3.5A8.1 8.1 0 0 1 5.1 16Zm3-8h-3a8.1 8.1 0 0 1 4.4-3.5A15.7 15.7 0 0 0 8.1 8Zm3.9 12c-.8-1-1.5-2.3-1.9-4h3.8c-.4 1.7-1.1 3-1.9 4Zm2.3-6H9.7a14.4 14.4 0 0 1 0-4h4.6a14.4 14.4 0 0 1 0 4Zm.2 5.5a15.7 15.7 0 0 0 1.4-3.5h3a8.1 8.1 0 0 1-4.4 3.5Zm1.4-5.5a16.9 16.9 0 0 0 0-4h3.8a7.9 7.9 0 0 1 0 4h-3.8Z" />
    </svg>

    <span :class="{ 'visually-hidden': iconOnly }">{{ label }}</span>
    <span v-if="!iconOnly" class="social-profile-link__external" aria-hidden="true">↗</span>
  </a>
</template>

<style scoped>
.social-profile-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  width: fit-content;
  font-size: var(--text-sm);
  font-weight: 560;
  line-height: 1.4;
  text-decoration: none;
}

.social-profile-link--accent {
  color: var(--color-accent);
}

.social-profile-link--muted {
  color: var(--color-text-muted);
}

.social-profile-link:hover {
  color: var(--color-accent-hover);
}

.social-profile-link__icon {
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
  fill: currentColor;
}

.social-profile-link--icon-only {
  padding: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-m);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.social-profile-link--icon-only:hover {
  border-color: var(--color-accent);
}

@media (pointer: coarse) {
  .social-profile-link--icon-only {
    min-width: 44px;
    min-height: 44px;
    justify-content: center;
  }
}

.social-profile-link--icon-only .social-profile-link__icon {
  width: 1.25rem;
  height: 1.25rem;
}

.social-profile-link__external {
  margin-left: calc(var(--space-1) * -1);
  color: var(--color-text-faint);
  font-size: var(--text-xs);
  transition: transform var(--duration-fast) var(--ease-out);
}

.social-profile-link:hover .social-profile-link__external {
  transform: translate(1px, -1px);
}
</style>
