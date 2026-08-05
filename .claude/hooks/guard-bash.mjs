#!/usr/bin/env node
/**
 * PreToolUse guard for Bash/PowerShell commands. Denies destructive or
 * boundary-crossing commands with a readable reason (exit code 2 blocks
 * the tool call and shows the reason to Claude).
 *
 * Two bugs lived here undetected because nothing tested the hook itself:
 *
 * 1. The `.env.example` allowance was applied to EVERY rule inside the
 *    match loop, so appending that string to any command disabled all of
 *    them — `rm -rf / # .env.example` passed. The allowance now lives in
 *    the .env pattern itself, as a negative lookahead, and no rule is
 *    skipped on the basis of unrelated text elsewhere in the command.
 *
 * 2. The production-deploy rules were written as `\b(--prod|--production)\b`.
 *    `\b` asserts a word/non-word boundary, and a space followed by a
 *    hyphen is non-word on both sides — so the assertion could never hold
 *    and `vercel deploy --prod` was never blocked. Flags are matched from a
 *    start-or-whitespace anchor instead. (The force-push rule put `\b`
 *    *after* the flag and was always correct; these two had it inverted.)
 *
 * tests/hooks/guard-bash.test.ts drives this file as a subprocess, the same
 * way Claude Code invokes it, and asserts the exit code for each command.
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/**
 * A production flag as it actually appears on a command line: at the start
 * of the string or after whitespace. `\b` cannot be used to open this —
 * see note 2 above.
 */
const PROD_FLAG = String.raw`(?:^|\s)--prod(?:uction)?\b`

const RULES = [
  {
    pattern: /\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\b/i,
    reason: 'Recursive force delete is blocked. Delete specific paths deliberately.'
  },
  {
    pattern: /\bRemove-Item\b[^\n]*-Recurse[^\n]*-Force[^\n]*(\\|\/)?\s*$/i,
    reason: 'Broad recursive force delete is blocked.'
  },
  {
    pattern: /\bgit\s+reset\s+--hard\b/,
    reason: 'git reset --hard is blocked — it destroys uncommitted work.'
  },
  {
    pattern: /\bgit\s+clean\s+-[a-z]*f/,
    reason: 'git clean -f is blocked — it deletes untracked files.'
  },
  {
    pattern: /\bgit\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/,
    reason: 'Force push is blocked. Create a new commit instead.'
  },
  {
    pattern: /\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|\s*(sh|bash|pwsh|powershell|iex)\b/i,
    reason: 'Piping downloads into a shell is blocked.'
  },
  {
    // `.env.example` is committed and safe to read; every other .env file is
    // not. The exclusion is part of this pattern so it cannot leak to the
    // other rules the way a command-wide allowance did.
    pattern: /\b(cat|type|Get-Content|less|more|head|tail)\b[^\n]*\.env(?!\.example\b)(\.[a-z]+)?\b(?![a-z.])/i,
    reason: 'Reading .env files is blocked — secrets stay out of the transcript. (.env.example is fine.)'
  },
  {
    pattern: new RegExp(String.raw`\bvercel\b[^\n]*` + PROD_FLAG, 'i'),
    reason: 'Production deployment requires explicit human approval — see docs/production-release-checklist.md.'
  },
  {
    pattern: new RegExp(
      String.raw`\b(netlify|wrangler)\b[^\n]*\b(deploy|publish)\b[^\n]*(?:` + PROD_FLAG + String.raw`|\bproduction\b)`,
      'i'
    ),
    reason: 'Production deployment requires explicit human approval.'
  }
]

/**
 * Pure rule evaluation. Returns the reason the command is blocked, or null
 * when it is allowed. Exported so the rules can be exercised directly.
 */
export function evaluateCommand(command) {
  if (!command) return null
  for (const { pattern, reason } of RULES) {
    if (pattern.test(command)) return reason
  }
  return null
}

/** PowerShell pipes can prepend a UTF-8 BOM, which JSON.parse rejects. */
function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text
}

function main() {
  let input = {}
  try {
    input = JSON.parse(stripBom(readFileSync(0, 'utf8')))
  } catch {
    process.exit(0)
  }

  const reason = evaluateCommand(String(input?.tool_input?.command ?? ''))
  if (reason) {
    console.error(`[guard-bash] Blocked: ${reason}`)
    process.exit(2)
  }
  process.exit(0)
}

// Only run the hook when executed directly, so importing `evaluateCommand`
// from a test does not try to read stdin.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
