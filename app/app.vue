<script setup lang="ts">
import { profile } from '~/data/portfolio'

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl
const route = useRoute()

useHead({
  link: [{ rel: 'canonical', href: () => new URL(route.path, siteUrl).href }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': profile.name,
        'url': siteUrl,
        'description': profile.headline,
        'sameAs': profile.links.map((l) => l.url)
      })
    }
  ]
})

useSeoMeta({
  ogType: 'website',
  ogSiteName: profile.name,
  ogImage: new URL('/og.png', siteUrl).href,
  ogUrl: () => new URL(route.path, siteUrl).href,
  twitterCard: 'summary_large_image',
  description:
    'Portfolio of Chamroeun Hongleng — exploring AI, machine learning, software, and business with responsible governance.'
})
</script>

<template>
  <div class="app-root">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
