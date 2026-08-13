/**
 * check-secrets — regex scan of every committable text file for credential
 * patterns. Zero network, zero dependencies. The scanner skips itself and
 * the Claude hooks (they contain the patterns by necessity).
 *
 * The file set comes from git: tracked files plus untracked-but-not-ignored
 * ones — exactly what can reach the public repository. A filesystem walk
 * used to be the source, which read gitignored trees (.vercel, .env.local,
 * .tmp) that can never be committed while claiming to scan "tracked" files.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const root = process.cwd()
const SKIP_EXTS = new Set(['.png', '.ico', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.zip', '.pdf'])
const SELF_EXEMPT = ['scripts/check-secrets.ts', '.claude/hooks']
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
  // Two dot-separated base64url segments both opening with the base64 of '{"'
  // is structurally a JWT header.payload — Vercel OIDC tokens, Supabase keys,
  // session cookies. The generic pattern below cannot see these: its character
  // class has no dot, so it stops at the first separator.
  ['JWT', new RegExp('\\bey' + 'J[A-Za-z0-9_-]{8,}\\.ey' + 'J[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9_-]*')],
  [
    'generic credential assignment',
    new RegExp('(api[_-]?key|secret|password|token)\\s*[:=]\\s*["\'][A-Za-z0-9+/_-]{24,}["\']', 'i')
  ]
]

const findings: string[] = []

const listed = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
})
if (listed.status !== 0) {
  console.error('check:secrets — FAILED: git ls-files did not run; refusing to guess the file set.')
  if (listed.stderr) console.error(`  ${listed.stderr.trim()}`)
  process.exit(1)
}

// git reports POSIX separators; SELF_EXEMPT is written the same way.
for (const rel of listed.stdout.split('\0').filter(Boolean)) {
  if (SELF_EXEMPT.some((exempt) => rel.startsWith(exempt))) continue
  if (SKIP_EXTS.has(rel.slice(rel.lastIndexOf('.')).toLowerCase())) continue
  const full = join(root, rel.split('/').join(sep))
  if (!existsSync(full)) continue // staged-but-deleted paths still appear in ls-files
  if (statSync(full).size > MAX_SIZE) continue
  const text = readFileSync(full, 'utf8')
  for (const [label, pattern] of PATTERNS) {
    if (pattern.test(text)) findings.push(`${rel}: possible ${label}`)
  }
}

if (findings.length > 0) {
  console.error(`check:secrets — FAILED (${findings.length} finding(s))`)
  for (const f of findings) console.error(`  ERROR ${f}`)
  process.exit(1)
}
console.log('check:secrets — OK (no credential patterns found)')
