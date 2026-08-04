/**
 * check-links — validates the GENERATED site (.output/public) with zero
 * network calls: internal hrefs must resolve to generated files, anchors
 * must resolve to element ids, asset references must exist, and external
 * links must be https/mailto with no placeholder domains.
 * Run after `npm run generate`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from 'node-html-parser'

const root = process.cwd()
const site = join(root, '.output', 'public')

if (!existsSync(site)) {
  console.error('check:links — FAILED: .output/public does not exist. Run `npm run generate` first.')
  process.exit(1)
}

const problems: string[] = []
const htmlFiles: string[] = []

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.html')) htmlFiles.push(full)
  }
}
walk(site)

const PLACEHOLDER_RE = /example\.(com|org|net)|localhost|127\.0\.0\.1|your-domain/i
const docCache = new Map<string, ReturnType<typeof parse>>()

function loadDoc(file: string) {
  let doc = docCache.get(file)
  if (!doc) {
    doc = parse(readFileSync(file, 'utf8'))
    docCache.set(file, doc)
  }
  return doc
}

function resolveInternal(path: string): string | null {
  const clean = path.split('?')[0] ?? ''
  const candidates = [
    join(site, clean),
    join(site, clean, 'index.html'),
    join(site, `${clean}.html`)
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

function hasId(file: string, id: string): boolean {
  const doc = loadDoc(file)
  return doc.querySelector(`[id="${id}"]`) !== null
}

for (const file of htmlFiles) {
  const rel = relative(site, file)
  const doc = loadDoc(file)

  // Hyperlinks
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? ''
    if (href.startsWith('mailto:')) continue
    if (href.startsWith('https://')) {
      if (PLACEHOLDER_RE.test(href)) problems.push(`${rel}: placeholder external link "${href}"`)
      continue
    }
    if (href.startsWith('http://')) {
      problems.push(`${rel}: insecure http link "${href}"`)
      continue
    }
    if (href === '#' || href === '') {
      problems.push(`${rel}: empty link target`)
      continue
    }
    if (href.startsWith('#')) {
      if (!hasId(file, href.slice(1))) problems.push(`${rel}: broken anchor "${href}"`)
      continue
    }
    const [path = '', hash] = href.split('#')
    const target = resolveInternal(path)
    if (!target) {
      problems.push(`${rel}: broken internal link "${href}"`)
    } else if (hash && !hasId(target, hash)) {
      problems.push(`${rel}: anchor "#${hash}" not found in "${path}"`)
    }
  }

  // Asset references
  const assetRefs: string[] = []
  for (const img of doc.querySelectorAll('img[src]')) assetRefs.push(img.getAttribute('src') ?? '')
  for (const link of doc.querySelectorAll('link[href]')) {
    const relAttr = link.getAttribute('rel') ?? ''
    if (/stylesheet|icon|manifest|apple-touch-icon|preload|modulepreload/.test(relAttr)) {
      assetRefs.push(link.getAttribute('href') ?? '')
    }
  }
  for (const script of doc.querySelectorAll('script[src]')) {
    assetRefs.push(script.getAttribute('src') ?? '')
  }
  for (const ref of assetRefs) {
    if (!ref || ref.startsWith('data:') || ref.startsWith('https://') || ref.startsWith('http://')) {
      continue
    }
    if (!resolveInternal(ref)) problems.push(`${rel}: missing asset "${ref}"`)
  }
}

if (problems.length > 0) {
  const unique = [...new Set(problems)]
  console.error(`check:links — FAILED (${unique.length} problem(s) across ${htmlFiles.length} pages)`)
  for (const p of unique) console.error(`  ERROR ${p}`)
  process.exit(1)
}
console.log(`check:links — OK (${htmlFiles.length} pages, all links and assets resolve)`)
