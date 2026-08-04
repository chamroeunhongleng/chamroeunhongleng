#!/usr/bin/env node
/**
 * PreToolUse guard for Bash/PowerShell commands. Denies destructive or
 * boundary-crossing commands with a readable reason (exit code 2 blocks
 * the tool call and shows the reason to Claude).
 */
import { readFileSync } from 'node:fs'

let input = {}
try {
  // Strip a possible UTF-8 BOM (PowerShell pipes add one).
  input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, ''))
} catch {
  process.exit(0)
}

const command = String(input?.tool_input?.command ?? '')
if (!command) process.exit(0)

const RULES = [
  [/\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\b/i, 'Recursive force delete is blocked. Delete specific paths deliberately.'],
  [/\bRemove-Item\b[^\n]*-Recurse[^\n]*-Force[^\n]*(\\|\/)?\s*$/i, 'Broad recursive force delete is blocked.'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard is blocked — it destroys uncommitted work.'],
  [/\bgit\s+clean\s+-[a-z]*f/, 'git clean -f is blocked — it deletes untracked files.'],
  [/\bgit\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/, 'Force push is blocked. Create a new commit instead.'],
  [/\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|\s*(sh|bash|pwsh|powershell|iex)\b/i, 'Piping downloads into a shell is blocked.'],
  [/\b(cat|type|Get-Content|less|more|head|tail)\b[^\n]*\.env(\.[a-z]+)?\b(?![a-z.])/i, 'Reading .env files is blocked — secrets stay out of the transcript. (.env.example is fine.)'],
  [/\bvercel\b[^\n]*\b(--prod|--production)\b/i, 'Production deployment requires explicit human approval — see docs/production-release-checklist.md.'],
  [/\b(netlify|wrangler)\b[^\n]*\b(deploy|publish)\b[^\n]*\b(--prod|production)\b/i, 'Production deployment requires explicit human approval.']
]

for (const [pattern, reason] of RULES) {
  if (pattern.test(command) && !command.includes('.env.example')) {
    console.error(`[guard-bash] Blocked: ${reason}`)
    process.exit(2)
  }
}

process.exit(0)
