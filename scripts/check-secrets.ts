/**
 * check-secrets — regex scan of all tracked text files for credential
 * patterns. Zero network, zero dependencies. The scanner skips itself and
 * the Claude hooks (they contain the patterns by necessity).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = process.cwd()
const SKIP_DIRS = new Set(['node_modules', '.nuxt', '.output', '.git', 'dist', 'coverage'])
const SKIP_EXTS = new Set(['.png', '.ico', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.zip', '.pdf'])
const SELF_EXEMPT = ['scripts' + sep + 'check-secrets.ts', '.claude' + sep + 'hooks']
const MAX_SIZE = 2 * 1024 * 1024

// Assembled at runtime so this file never matches its own patterns.
const PATTERNS: Array<[string, RegExp]> = [
  ['private key block', new RegExp('-----BEGIN [A-Z ]*' + 'PRIVATE KEY-----')],
  ['AWS access key', new RegExp('\\bAKIA' + '[0-9A-Z]{16}\\b')],
  ['GitHub token', new RegExp('\\b(ghp|gho|ghu|ghs|ghr)_' + '[A-Za-z0-9]{36,}\\b')],
  ['GitHub PAT', new RegExp('\\bgithub_pat_' + '[A-Za-z0-9_]{22,}\\b')],
  ['Anthropic key', new RegExp('\\bsk-ant-' + '[A-Za-z0-9-]{10,}\\b')],
  ['OpenAI-style key', new RegExp('\\bsk-' + '[A-Za-z0-9]{32,}\\b')],
  ['Slack token', new RegExp('\\bxox[abp]-' + '[A-Za-z0-9-]{10,}\\b')],
  [
    'generic credential assignment',
    new RegExp('(api[_-]?key|secret|password|token)\\s*[:=]\\s*["\'][A-Za-z0-9+/_-]{24,}["\']', 'i')
  ]
]

const findings: string[] = []

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = relative(root, full)
    if (SKIP_DIRS.has(name)) continue
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
      continue
    }
    if (SELF_EXEMPT.some((exempt) => rel.startsWith(exempt))) continue
    if (SKIP_EXTS.has(name.slice(name.lastIndexOf('.')).toLowerCase())) continue
    if (stat.size > MAX_SIZE) continue
    const text = readFileSync(full, 'utf8')
    for (const [label, pattern] of PATTERNS) {
      if (pattern.test(text)) findings.push(`${rel}: possible ${label}`)
    }
  }
}

walk(root)

if (findings.length > 0) {
  console.error(`check:secrets — FAILED (${findings.length} finding(s))`)
  for (const f of findings) console.error(`  ERROR ${f}`)
  process.exit(1)
}
console.log('check:secrets — OK (no credential patterns found)')
