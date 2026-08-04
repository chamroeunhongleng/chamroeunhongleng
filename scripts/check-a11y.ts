/**
 * check-a11y — deterministic accessibility basics over the GENERATED HTML.
 * This is not a substitute for manual keyboard/screen-reader review (see
 * docs/ui-review-checklist.md); it catches the structural failures that
 * never need human judgment: missing lang, broken heading order, images
 * without alt, unnamed controls, duplicate ids, missing landmarks.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'

const root = process.cwd()
const site = join(root, '.output', 'public')

if (!existsSync(site)) {
  console.error('check:a11y — FAILED: .output/public does not exist. Run `npm run generate` first.')
  process.exit(1)
}

// 200.html and 404.html are Nuxt's SPA fallback shells — empty by design
// and hydrated client-side, so structural checks don't apply to them.
const SPA_SHELLS = new Set(['200.html', '404.html'])

const htmlFiles: string[] = []
function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.html') && !SPA_SHELLS.has(name)) htmlFiles.push(full)
  }
}
walk(site)

const problems: string[] = []

function accessibleName(el: HTMLElement): string {
  return (
    el.getAttribute('aria-label')
    ?? (el.getAttribute('aria-labelledby') ? 'labelledby' : '')
    ?? ''
  ) || el.text.trim()
}

for (const file of htmlFiles) {
  const rel = relative(site, file)
  const doc = parse(readFileSync(file, 'utf8'))

  // Document language
  const html = doc.querySelector('html')
  if (!html?.getAttribute('lang')) problems.push(`${rel}: <html> missing lang attribute`)

  // Exactly one h1
  const h1s = doc.querySelectorAll('h1')
  if (h1s.length !== 1) problems.push(`${rel}: expected exactly one <h1>, found ${h1s.length}`)

  // No skipped heading levels
  const headings = doc
    .querySelectorAll('h1, h2, h3, h4, h5, h6')
    .map((h) => Number(h.tagName.slice(1)))
  let previous = 0
  for (const level of headings) {
    if (previous > 0 && level > previous + 1) {
      problems.push(`${rel}: heading level skips from h${previous} to h${level}`)
    }
    previous = level
  }

  // Images need alt attributes (empty alt allowed for decorative)
  for (const img of doc.querySelectorAll('img')) {
    if (img.getAttribute('alt') === undefined) {
      problems.push(`${rel}: <img src="${img.getAttribute('src')}"> missing alt attribute`)
    }
  }

  // Landmarks
  if (doc.querySelectorAll('main').length !== 1) problems.push(`${rel}: expected exactly one <main>`)
  if (!doc.querySelector('nav')) problems.push(`${rel}: no <nav> landmark`)
  if (!doc.querySelector('header')) problems.push(`${rel}: no <header> landmark`)
  if (!doc.querySelector('footer')) problems.push(`${rel}: no <footer> landmark`)

  // Links and buttons need accessible names
  for (const el of [...doc.querySelectorAll('a'), ...doc.querySelectorAll('button')]) {
    if (!accessibleName(el)) {
      problems.push(`${rel}: <${el.tagName.toLowerCase()}> without accessible name`)
    }
  }

  // Form controls need labels
  for (const control of [...doc.querySelectorAll('input'), ...doc.querySelectorAll('select'), ...doc.querySelectorAll('textarea')]) {
    if (control.getAttribute('type') === 'hidden') continue
    const id = control.getAttribute('id')
    const labelled
      = control.getAttribute('aria-label')
        || control.getAttribute('aria-labelledby')
        || (id && doc.querySelector(`label[for="${id}"]`))
        || control.closest('label')
    if (!labelled) {
      problems.push(`${rel}: form control <${control.tagName.toLowerCase()}> without label`)
    }
  }

  // Duplicate ids
  const seen = new Map<string, number>()
  for (const el of doc.querySelectorAll('[id]')) {
    const id = el.getAttribute('id') ?? ''
    seen.set(id, (seen.get(id) ?? 0) + 1)
  }
  for (const [id, count] of seen) {
    if (count > 1) problems.push(`${rel}: duplicate id "${id}" (${count}×)`)
  }

  // Skip link must exist and target an existing id
  const skip = doc.querySelector('a[href="#main"]')
  if (!skip) problems.push(`${rel}: skip link to #main missing`)
  else if (!doc.querySelector('[id="main"]')) problems.push(`${rel}: skip link target #main missing`)
}

if (problems.length > 0) {
  const unique = [...new Set(problems)]
  console.error(`check:a11y — FAILED (${unique.length} problem(s) across ${htmlFiles.length} pages)`)
  for (const p of unique) console.error(`  ERROR ${p}`)
  process.exit(1)
}
console.log(`check:a11y — OK (${htmlFiles.length} pages pass structural accessibility checks)`)
