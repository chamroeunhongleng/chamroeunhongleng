// Stamps a hash-based CSP <meta> into every generated page. Runs as the second half of
// `npm run generate`, so the deploy recipe, e2e suite and CV renderer all pick it up.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { injectMeta, policyFor, stripCspMeta } from './lib/csp'
import { outputDirLabel, requireOutputDir } from './lib/output-dir'

const root = process.cwd()
// Not a fixed path: `vercel build` writes .vercel/output/static.
const site = requireOutputDir(root, 'inject-csp')

// Includes the 200/404 SPA shells: they carry the same inline bootstrap scripts.
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
  console.error(`inject-csp — FAILED: no HTML files under ${outputDirLabel()}. The build produced nothing to protect.`)
  process.exit(1)
}

const problems: string[] = []
const uniqueHashes = new Set<string>()
let reinjected = 0

for (const file of htmlFiles) {
  const rel = relative(site, file)
  try {
    // Strip first so a re-run over an existing build replaces the policy instead of stacking one.
    const { html, removed } = stripCspMeta(readFileSync(file, 'utf8'))
    if (removed > 0) reinjected++
    const policy = policyFor(html, rel)
    for (const hash of policy.match(/'sha256-[^']+'/g) ?? []) uniqueHashes.add(hash)
    writeFileSync(file, injectMeta(html, policy, rel), 'utf8')
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error))
  }
}

if (problems.length > 0) {
  console.error(`inject-csp — FAILED (${problems.length} problem(s))`)
  for (const p of problems) console.error(`  ERROR ${p}`)
  process.exit(1)
}
const note = reinjected > 0 ? `, ${reinjected} re-injected over a previous build` : ''
console.log(`inject-csp — OK (${htmlFiles.length} pages, ${uniqueHashes.size} unique script hashes${note})`)
