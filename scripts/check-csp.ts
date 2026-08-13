/**
 * check-csp — proves the generated site actually carries the policy it should.
 *
 * inject-csp writes the meta tag; this re-derives it from the same artifact
 * bytes and demands an exact match. That catches a page the injector skipped,
 * a policy that drifted after a Nuxt upgrade, and any post-injection edit to
 * an inline script (which would leave a hash that no longer matches and a page
 * that silently fails to hydrate in the browser).
 *
 * It also enforces the posture claim that this site loads nothing off-origin:
 * every script and stylesheet reference must be root-relative.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from 'node-html-parser'
import { policyFor, readCspMeta } from './lib/csp'
import { outputDirLabel, requireOutputDir } from './lib/output-dir'

const root = process.cwd()
// Matches inject-csp, so `VERCEL=1 npm run check:csp` audits the artifact the
// Vercel CLI just built rather than a stale local one.
const site = requireOutputDir(root, 'check:csp')

const htmlFiles: string[] = []
function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.html')) htmlFiles.push(full)
  }
}
walk(site)

if (htmlFiles.length === 0) {
  console.error(`check:csp — FAILED: no HTML files under ${outputDirLabel()}.`)
  process.exit(1)
}

// rel values that pull a subresource. Excludes canonical/alternate, which are
// URLs the page points at rather than resources it loads.
const SUBRESOURCE_RELS = new Set([
  'stylesheet',
  'preload',
  'modulepreload',
  'prefetch',
  'icon',
  'apple-touch-icon',
  'manifest'
])

const problems: string[] = []
const uniqueHashes = new Set<string>()

for (const file of htmlFiles) {
  const rel = relative(site, file)
  const html = readFileSync(file, 'utf8')
  const doc = parse(html)

  const metas = doc.querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
  if (metas.length === 0) {
    problems.push(`${rel}: no CSP meta tag — did inject-csp run?`)
    continue
  }
  if (metas.length > 1) {
    problems.push(`${rel}: ${metas.length} CSP meta tags; a page must carry exactly one`)
    continue
  }

  // A policy that lands after the first script does not govern that script.
  const firstScript = doc.querySelector('script')
  if (firstScript && firstScript.range[0] < metas[0]!.range[0]) {
    problems.push(`${rel}: the CSP meta tag sits after the first <script>, which it therefore does not govern`)
  }

  let expected: string
  try {
    expected = policyFor(html, rel)
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error))
    continue
  }
  const actual = readCspMeta(html)
  if (actual !== expected) {
    problems.push(
      `${rel}: CSP does not match the page's own scripts.\n`
      + `      expected ${expected}\n`
      + `      actual   ${actual}`
    )
  }
  for (const hash of expected.match(/'sha256-[^']+'/g) ?? []) uniqueHashes.add(hash)

  for (const script of doc.querySelectorAll('script[src]')) {
    const src = script.getAttribute('src')!
    if (!src.startsWith('/') || src.startsWith('//')) {
      problems.push(`${rel}: off-origin script "${src}" — this site loads no third-party code`)
    }
  }
  for (const link of doc.querySelectorAll('link[href]')) {
    const relAttr = (link.getAttribute('rel') ?? '').toLowerCase()
    if (!relAttr.split(/\s+/).some((r) => SUBRESOURCE_RELS.has(r))) continue
    const href = link.getAttribute('href')!
    if (!href.startsWith('/') || href.startsWith('//')) {
      problems.push(`${rel}: off-origin ${relAttr} "${href}" — this site loads no third-party assets`)
    }
  }
}

if (problems.length > 0) {
  console.error(`check:csp — FAILED (${problems.length} problem(s))`)
  for (const p of problems) console.error(`  ERROR ${p}`)
  process.exit(1)
}
console.log(`check:csp — OK (${htmlFiles.length} pages carry a matching policy, ${uniqueHashes.size} unique script hashes)`)
