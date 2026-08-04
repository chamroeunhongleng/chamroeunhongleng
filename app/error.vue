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
  <div class="error-page">
    <div class="container">
      <p class="eyebrow">{{ error.statusCode }}</p>
      <h1>{{ is404 ? 'Page not found' : 'Something went wrong' }}</h1>
      <p class="lede">
        {{
          is404
            ? 'The page you were looking for does not exist — it may have moved, or the link was mistyped.'
            : 'An unexpected error occurred while rendering this page.'
        }}
      </p>
      <button type="button" class="btn btn-primary" @click="goHome">Back to home</button>
    </div>
  </div>
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
</style>
