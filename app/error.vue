<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => (is404.value ? 'Page not found' : 'Something went wrong')
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout>
    <div class="error-page">
      <div class="container">
        <p class="error-code">{{ error.statusCode }}</p>
        <p class="eyebrow">{{ is404 ? 'Not found' : 'Error' }}</p>
        <h1>{{ is404 ? 'This page is not here' : 'Something went wrong' }}</h1>
        <p class="lede">
          {{
            is404
              ? 'Sorry about that. The page may have moved, or the link has a typo in it.'
              : 'Sorry about that. Something broke while this page was loading.'
          }}
        </p>
        <p class="hand" aria-hidden="true">the rest of the site still works, I promise</p>
        <button type="button" class="btn btn-primary" @click="goHome">Take me home</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.error-page {
  min-height: 70dvh;
  display: grid;
  place-items: center;
  text-align: left;
}

.error-page .container {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  padding-block: var(--space-12);
}

.error-code {
  font-family: var(--font-mono);
  font-size: var(--text-display);
  font-weight: var(--weight-medium);
  line-height: var(--leading-display);
  letter-spacing: var(--tracking-display);
  color: var(--color-border-strong);
}

.error-page h1 {
  font-size: var(--text-h1);
}
</style>
