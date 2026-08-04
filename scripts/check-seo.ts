/**
 * check-seo — validates SEO metadata on the GENERATED site: unique titles,
 * description lengths, canonical URLs, Open Graph and Twitter tags, JSON-LD,
 * robots.txt, the OG image's actual pixel size, and that sitemap.xml matches
 * exactly the route set derived from content.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from 'node-html-parser'

const root = process.cwd()
const site = join(root, '.output', 'public')

if (!existsSync(site)) {
  console.error('check:seo — FAILED: .output/public does not exist. Run `npm run generate` first.')
  process.exit(1)
}

const problems: string[] = []
const htmlFiles: string[] = []
function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name === 'index.html' || (name.endsWith('.html') && name !== '200.html' && name !== '404.html')) {
      htmlFiles.push(full)
    }
  }
}
walk(site)

const titles = new Map<string, string>()

for (const file of htmlFiles) {
  const rel = relative(site, file)
  const doc = parse(readFileSync(file, 'utf8'))

  const title = doc.querySelector('title')?.text.trim() ?? ''
  if (!title) problems.push(`${rel}: missing <title>`)
  else if (titles.has(title)) problems.push(`${rel}: duplicate title "${title}" (also ${titles.get(title)})`)
  else titles.set(title, rel)

  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
  if (!description) problems.push(`${rel}: missing meta description`)
  else if (description.length < 50 || description.length > 170) {
    problems.push(`${rel}: meta description length ${description.length} outside 50–170`)
  }

  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? ''
  if (!canonical.startsWith('https://')) problems.push(`${rel}: missing or non-https canonical`)

  for (const property of ['og:title', 'og:description', 'og:image', 'og:type', 'og:url']) {
    if (!doc.querySelector(`meta[property="${property}"]`)) {
      problems.push(`${rel}: missing ${property}`)
    }
  }
  if (!doc.querySelector('meta[name="twitter:card"]')) problems.push(`${rel}: missing twitter:card`)

  const jsonLd = doc.querySelector('script[type="application/ld+json"]')
  if (!jsonLd) {
    problems.push(`${rel}: missing JSON-LD`)
  } else {
    try {
      JSON.parse(jsonLd.text)
    } catch {
      problems.push(`${rel}: JSON-LD does not parse`)
    }
  }
}

// robots.txt
const robotsPath = join(site, 'robots.txt')
if (!existsSync(robotsPath)) problems.push('robots.txt missing from generated output')
else if (!readFileSync(robotsPath, 'utf8').includes('Sitemap:')) {
  problems.push('robots.txt does not reference the sitemap')
}

// OG image real dimensions (PNG IHDR: width/height at bytes 16–24)
const ogPath = join(site, 'og.png')
if (!existsSync(ogPath)) {
  problems.push('og.png missing from generated output')
} else {
  const buffer = readFileSync(ogPath)
  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  if (width !== 1200 || height !== 630) {
    problems.push(`og.png is ${width}×${height}, expected 1200×630`)
  }
}

// sitemap.xml must contain exactly the derived route set
const sitemapPath = join(site, 'sitemap.xml')
if (!existsSync(sitemapPath)) {
  problems.push('sitemap.xml missing from generated output')
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8')
  const sitemapPaths = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
      const url = new URL(m[1] ?? '')
      return url.pathname.replace(/\/$/, '') || '/'
    })
  )
  const staticRoutes = ['/', '/about', '/projects', '/journey', '/learning', '/contact', '/colophon']
  const projectRoutes = readdirSync(join(root, 'content', 'projects'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(root, 'content', 'projects', f), 'utf8')) as { slug: string; enabled?: boolean })
    .filter((p) => p.enabled !== false)
    .map((p) => `/projects/${p.slug}`)
  const expected = new Set([...staticRoutes, ...projectRoutes])
  for (const route of expected) {
    if (!sitemapPaths.has(route)) problems.push(`sitemap.xml missing route ${route}`)
  }
  for (const path of sitemapPaths) {
    if (!expected.has(path)) problems.push(`sitemap.xml contains unexpected route ${path}`)
  }
}

if (problems.length > 0) {
  const unique = [...new Set(problems)]
  console.error(`check:seo — FAILED (${unique.length} problem(s) across ${htmlFiles.length} pages)`)
  for (const p of unique) console.error(`  ERROR ${p}`)
  process.exit(1)
}
console.log(`check:seo — OK (${htmlFiles.length} pages, sitemap matches derived routes, og.png 1200×630)`)
