import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
// Explicit import so check-structure.ts can import this config and compare its headers to vercel.json.
import { defineNuxtConfig } from 'nuxt/config'

const SITE_NAME = 'Chamroeun Hongleng'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://chamroeunhongleng.me'

// demo | review | production — baked in at generate time (static site).
const portfolioMode = process.env.NUXT_PUBLIC_PORTFOLIO_MODE || 'review'

// Never hardcode project routes: a JSON added to content/projects/ must build without touching this config.
const projectsDir = fileURLToPath(new URL('./content/projects', import.meta.url))
const projectRoutes = existsSync(projectsDir)
  ? readdirSync(projectsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(projectsDir, f), 'utf8')) as { slug: string; enabled?: boolean })
      .filter((p) => p.enabled !== false)
      .map((p) => `/projects/${p.slug}`)
  : []

// Mirrored in scripts/check-seo.ts, which fails on any sitemap route it did not expect.
const staticRoutes = ['/', '/about', '/projects', '/journey', '/learning', '/contact', '/colophon', '/cv']

export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@nuxtjs/sitemap'],
  components: [{ path: '~/components', pathPrefix: false }],
  vite: {
    plugins: [tailwindcss()]
  },
  css: [
    // Fraunces is used only by /cv; the font file is fetched only where a glyph uses it.
    '@fontsource-variable/fraunces/index.css',
    '@fontsource-variable/inter/index.css',
    '@fontsource/ibm-plex-mono/400.css',
    '@fontsource/ibm-plex-mono/500.css',
    '@fontsource/ibm-plex-mono/600.css',
    // Tailwind first so tokens.css wins where a name exists in both (--text-lg, --ease-out…).
    '~/assets/css/tailwind.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/typography.css',
    '~/assets/css/utilities.css',
    '~/assets/css/motion.css'
  ],
  runtimeConfig: {
    public: {
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
          // Anti-FOUC theme bootstrap, run before first paint. It also sets <meta name="theme-color">,
          // which CSS cannot do because the theme follows data-theme; values track --color-bg in tokens.css.
          innerHTML:
            "(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name=\"theme-color\"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}m.content=t==='dark'?'#131318':'#FAF7F2'}catch(e){}})();"
        },
        // Vercel Web Analytics is served by the Vercel edge, not the build output, so it ships
        // only when the deploy build sets NUXT_PUBLIC_ANALYTICS=1; locally it would 404 and fail e2e.
        ...(process.env.NUXT_PUBLIC_ANALYTICS === '1'
          ? [{ src: '/_vercel/insights/script.js', defer: true }]
          : [])
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [...staticRoutes, ...projectRoutes]
    }
  },
  // Static hosting ignores routeRules, so vercel.json duplicates these and check-structure.ts
  // keeps them in sync. CSP here is frame-ancestors only: <meta> cannot carry it; script-src is injected per build.
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'accelerometer=(), autoplay=(), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'Content-Security-Policy': 'frame-ancestors \'none\''
      }
    }
  },
  typescript: { strict: true }
})
