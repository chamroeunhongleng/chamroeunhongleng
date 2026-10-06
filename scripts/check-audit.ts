// --omit=dev: only the chat function's deps ship; dev-tooling advisories are Dependabot's job.
// Offline is not a failure: verify must run without a network, and CI always has one.
import { spawnSync } from 'node:child_process'

const NETWORK_ERROR = /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|EPROTO|ERR_SOCKET|registry|network|offline|getaddrinfo/i

interface AuditAdvisory {
  name?: string
  severity?: string
  fixAvailable?: unknown
  via?: Array<string | { title?: string }>
}
interface AuditReport {
  error?: { code?: string; summary?: string; detail?: string }
  metadata?: { vulnerabilities?: Record<string, number> }
  vulnerabilities?: Record<string, AuditAdvisory>
}

const result = spawnSync('npm', ['audit', '--omit=dev', '--audit-level=high', '--json'], {
  encoding: 'utf8',
  shell: true, // npm is npm.cmd on Windows
  timeout: 90_000,
  maxBuffer: 32 * 1024 * 1024
})

if (result.error?.message.includes('ETIMEDOUT') || result.signal === 'SIGTERM') {
  console.log('check:audit — SKIPPED (npm audit timed out; the registry check runs again in CI)')
  process.exit(0)
}

if (result.status === 0) {
  console.log('check:audit — OK (no high or critical advisories in shipped dependencies)')
  process.exit(0)
}

let report: AuditReport
try {
  report = JSON.parse(result.stdout ?? '') as AuditReport
} catch {
  // Nothing parseable: a registry error means offline; anything else is an unknown, and unknowns do not pass.
  const noise = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (NETWORK_ERROR.test(noise)) {
    console.log('check:audit — SKIPPED (registry unreachable; the audit runs again in CI)')
    process.exit(0)
  }
  console.error('check:audit — FAILED: npm audit exited non-zero with unparseable output')
  console.error(noise.trim().slice(0, 2000))
  process.exit(1)
}

if (report.error) {
  const summary = `${report.error.code ?? ''} ${report.error.summary ?? ''} ${report.error.detail ?? ''}`
  if (NETWORK_ERROR.test(summary)) {
    console.log(`check:audit — SKIPPED (${report.error.code ?? 'registry error'}; the audit runs again in CI)`)
    process.exit(0)
  }
  console.error(`check:audit — FAILED: ${summary.trim()}`)
  process.exit(1)
}

const counts = report.metadata?.vulnerabilities ?? {}
const serious = (counts.high ?? 0) + (counts.critical ?? 0)
if (serious === 0) {
  console.error('check:audit — FAILED: npm audit exited non-zero but reported no high or critical advisories')
  console.error(`  counts: ${JSON.stringify(counts)}`)
  process.exit(1)
}

console.error(`check:audit — FAILED (${serious} high/critical advisory(ies) in shipped dependencies)`)
for (const [name, advisory] of Object.entries(report.vulnerabilities ?? {})) {
  const severity = advisory.severity ?? 'unknown'
  if (severity !== 'high' && severity !== 'critical') continue
  const titles = (advisory.via ?? [])
    .map((v) => (typeof v === 'string' ? v : v.title))
    .filter(Boolean)
    .join('; ')
  const fix = advisory.fixAvailable ? 'fix available' : 'no fix available'
  console.error(`  ERROR ${name} (${severity}) — ${titles || 'see npm audit'} [${fix}]`)
}
console.error('  Run: npm audit --omit=dev')
process.exit(1)
