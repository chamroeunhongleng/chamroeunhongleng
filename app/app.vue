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
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': profile.name,
        'url': siteUrl,
        'description': profile.headline,
        'author': { '@type': 'Person', 'name': profile.name }
      })
    }
  ]
})

useSeoMeta({
  ogType: 'website',
  ogSiteName: profile.name,
  ogImage: new URL('/og.png', siteUrl).href,
  ogImageAlt: 'Chamroeun Hongleng — software engineering student in Phnom Penh building web and data systems, with applied-ML work in Khmer speech',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: 'en_US',
  ogUrl: () => new URL(route.path, siteUrl).href,
  twitterCard: 'summary_large_image',
  description:
    'Portfolio of Chamroeun Hongleng — a software engineering student in Phnom Penh building web and data systems, with applied-ML work in Khmer speech.'
})
</script>

<template>
  <div class="app-root">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
