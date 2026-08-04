import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
// Explicit import (instead of Nuxt's config-time auto-import) so verification
// scripts can import this config and compare routeRules headers to vercel.json.
import { defineNuxtConfig } from 'nuxt/config'

const SITE_NAME = 'Chamroeun Hongleng'

// NUXT_PUBLIC_SITE_URL overrides at build time. chamroeunhongleng.me is the
// intended production domain but was not serving when this repo was built —
// verify DNS + hosting before a production release.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://chamroeunhongleng.me'

// demo | review | production — baked in at generate time (static site).
const portfolioMode = process.env.NUXT_PUBLIC_PORTFOLIO_MODE || 'review'

// Prerender routes are DERIVED from the content directory. Never hardcode a
// project route list here — a JSON file added to content/projects/ must build
// without touching this config (the old build's hardcoded list was a
// maintenance trap; check-content.ts asserts slug === filename).
const projectsDir = fileURLToPath(new URL('./content/projects', import.meta.url))
const projectRoutes = existsSync(projectsDir)
  ? readdirSync(projectsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(projectsDir, f), 'utf8')) as { slug: string; enabled?: boolean })
      .filter((p) => p.enabled !== false)
      .map((p) => `/projects/${p.slug}`)
  : []

const staticRoutes = ['/', '/about', '/projects', '/experience', '/learning', '/contact', '/colophon']

export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@nuxtjs/sitemap'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: [
    '@fontsource-variable/fraunces/index.css',
    '@fontsource-variable/inter/index.css',
    '@fontsource/ibm-plex-mono/400.css',
    '@fontsource/ibm-plex-mono/500.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/typography.css',
    '~/assets/css/utilities.css',
    '~/assets/css/motion.css'
  ],
  runtimeConfig: {
    public: {
      // NUXT_PUBLIC_PORTFOLIO_MODE / NUXT_PUBLIC_SITE_URL override these.
      portfolioMode,
      siteUrl
    }
  },
  site: {
    url: siteUrl,
    name: SITE_NAME
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: `%s · ${SITE_NAME}`,
      meta: [
        { name: 'theme-color', content: '#FAF7F2' },
        { name: 'color-scheme', content: 'light dark' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      script: [
        {
          // Anti-FOUC theme bootstrap: run before first paint. Light is the
          // default; localStorage then prefers-color-scheme decide.
          innerHTML:
            "(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();"
        }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [...staticRoutes, ...projectRoutes]
    }
  },
  // These headers apply to the dev/server runtime. Static hosting on Vercel
  // ignores routeRules headers, so the same set is duplicated in vercel.json —
  // that duplication is load-bearing; check-structure.ts keeps them in sync.
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    }
  },
  typescript: { strict: true }
})
