#!/usr/bin/env node
/**
 * PreToolUse guard for Bash commands. Denies destructive or boundary-crossing
 * commands with a readable reason (exit code 2 blocks the tool call and shows
 * the reason to Claude).
 *
 * WHAT THIS IS. A regex denylist over the raw command string. It reliably
 * catches the destructive command an agent would plausibly type by accident —
 * `rm -rf`, force push, `.env` reads, production deploys — and that is a real
 * reduction in accident rate.
 *
 * WHAT THIS IS NOT. A security boundary. A denylist over an unparsed shell
 * string cannot be made sound: the shell will still expand, dequote, alias and
 * substitute whatever it receives, so `"rm" -rf /`, `$(which rm) -rf /`, and
 * anything reachable through `base64 -d | sh` walk straight through. Do not
 * describe it as a sandbox. The real bounds are that CI holds no deploy
 * credentials, deploys are gated on secrets the runner does not have, and the
 * Anthropic Console spend limit caps the blast radius.
 *
 * It is also registered with `"matcher": "Bash"` in .claude/settings.json, so
 * PowerShell-shaped commands are only inspected when they arrive through the
 * Bash tool. The PowerShell rule below is opportunistic, not a guarantee.
 *
 * Two bugs lived here undetected because nothing tested the hook:
 *   1. The `.env.example` allowance was applied to EVERY rule inside the match
 *      loop, so appending that string to any command disabled all of them.
 *   2. The deploy rules used `\b(--prod|--production)\b`; `\b` cannot match
 *      between a space and a hyphen, so they never fired.
 * tests/hooks/guard-bash.test.ts now drives this file as a subprocess and
 * asserts the exit code for every rule, both directions.
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// ── Normalisation ─────────────────────────────────────────────────────────
/** Newlines are argument separators to the shell; collapse them so that
 *  putting a command on a later line cannot slip past a single-line pattern. */
const flatten = (command) => command.replace(/[\r\n]+/g, ' ')

/** Blank out quoted runs. Used only by the deploy rules, so that a commit
 *  message or `echo` that merely mentions `--prod` is not treated as a deploy. */
const unquoted = (text) => text.replace(/'[^']*'/g, " '' ").replace(/"[^"]*"/g, ' "" ')

/** Everything left of the first redirect: `cat .env.example > .env` reads the
 *  example and only writes the secret file, so the read rule must not fire. */
const beforeRedirect = (text) => text.split('>')[0]

// ── Fragments ─────────────────────────────────────────────────────────────
/** A flag as it appears on a command line. `\b` cannot open this — a space
 *  followed by a hyphen is non-word on both sides, which is what made the
 *  original deploy rules permanently inert. */
const PROD_INTENT = /(?:^|\s)(?:--prod(?:uction)?\b|--target[=\s]+production\b)/i

const RM_RECURSIVE = /(?:^|\s)(?:-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\b/
const RM_FORCE = /(?:^|\s)(?:-[a-zA-Z]*f[a-zA-Z]*|--force)\b/
const RM_INVOKED = /(?:^|\s|["'`/])["']?rm["']?\s/

/** Reading a secret is the verb plus the file; both lists stay generous. */
const ENV_READERS = /\b(cat|type|Get-Content|gc|less|more|head|tail|grep|egrep|rg|ag|sed|awk|xxd|od|strings|nano|vim|vi|source|dotenv|printenv)\b/i
/** `.env`, `.env.local`, `.env.production.local` — but never `.env.example`. */
const ENV_FILE = /\.env(?!\.example\b)(?:\.[a-z0-9]+)*\b/i

/**
 * Vercel subcommands that read or build but never change what production
 * serves, and those that repoint production with no flag at all.
 *
 * These are matched POSITIONALLY — the first non-flag token after `vercel` —
 * not "appears anywhere in the string". Scanning the whole command let a
 * trailing `# see .env.example` register as the `env` subcommand and wave a
 * real `vercel deploy --prod` straight through.
 */
const VERCEL_READONLY = new Set([
  'build', 'ls', 'list', 'inspect', 'logs', 'env', 'pull', 'link', 'whoami',
  'login', 'logout', 'teams', 'domains', 'certs', 'dev', 'help', 'switch',
  'projects', 'git', 'bisect'
])
const VERCEL_REPOINTS_PRODUCTION = new Set(['promote', 'rollback', 'redeploy'])

/** First non-flag token after `vercel`; null when there is none (deploy is the default). */
function vercelSubcommand(command) {
  const match = /\bvercel\b(.*)$/is.exec(command)
  if (!match) return null
  for (const token of match[1].trim().split(/\s+/).filter(Boolean)) {
    if (token.startsWith('-')) continue
    return token.toLowerCase()
  }
  return null
}

// ── Rules ─────────────────────────────────────────────────────────────────
const RULES = [
  {
    reason: 'Recursive force delete is blocked. Delete specific paths deliberately.',
    match: (flat) => RM_INVOKED.test(` ${flat}`) && RM_RECURSIVE.test(flat) && RM_FORCE.test(flat)
  },
  {
    reason: 'Broad recursive force delete is blocked.',
    match: (flat) => /\bRemove-Item\b/i.test(flat)
      && /(?:^|\s)-Rec(?:urse)?\b/i.test(flat)
      && /(?:^|\s)-For(?:ce)?\b/i.test(flat)
  },
  {
    reason: 'git reset --hard is blocked — it destroys uncommitted work.',
    match: (flat) => /\bgit\b[^;&|]*\breset\s+--hard\b/.test(flat)
  },
  {
    reason: 'git clean -f is blocked — it deletes untracked files.',
    // Note the trailing `[a-z]*`: without it, `\b` after the `f` cannot hold
    // in `-fd`/`-fdx`, which is the same boundary mistake that made the
    // deploy rules inert. Clustered flags are the normal way to type this.
    match: (flat) => /\bgit\b[^;&|]*\bclean\b[^;&|]*(?:(?:^|\s)-[a-z]*f[a-z]*\b|--force\b)/i.test(flat)
  },
  {
    reason: 'Force push is blocked. Create a new commit instead.',
    match: (flat) => /\bgit\b[^;&|]*\bpush\b[^;&|]*(?:--force(?:-with-lease)?\b|\s-f\b|\s\+[\w./-]+:?)/.test(flat)
  },
  {
    reason: 'Piping downloads into a shell is blocked.',
    match: (flat) => /\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|\s*(?:sudo\s+(?:-\S+\s+)*)?(sh|bash|zsh|pwsh|powershell|iex|python3?|node)\b/i.test(flat)
      || /\b(sh|bash|zsh)\s+<\(\s*(curl|wget)\b/i.test(flat)
  },
  {
    reason: 'Reading .env files is blocked — secrets stay out of the transcript. (.env.example is fine.)',
    match: (flat) => {
      const segment = beforeRedirect(flat)
      return ENV_READERS.test(segment) && ENV_FILE.test(segment)
    }
  },
  {
    reason: 'Production deployment requires explicit human approval — see docs/production-release-checklist.md.',
    match: (flat) => {
      const command = unquoted(flat)
      if (!/\bvercel\b/i.test(command)) return false
      const subcommand = vercelSubcommand(command)
      // These repoint production with no flag at all.
      if (subcommand && VERCEL_REPOINTS_PRODUCTION.has(subcommand)) return true
      if (subcommand === 'alias' && /\balias\s+set\b/i.test(command)) return true
      if (subcommand && VERCEL_READONLY.has(subcommand)) return false
      // Bare `vercel` or `vercel deploy`: production only on explicit intent.
      return PROD_INTENT.test(command)
    }
  },
  {
    reason: 'Production deployment requires explicit human approval.',
    match: (flat) => {
      const command = unquoted(flat)
      // `wrangler deploy` with no flag IS the production deploy.
      if (/\bwrangler\b[^;&|]*\b(deploy|publish)\b/i.test(command)) return !/--dry-run\b/i.test(command)
      return /\bnetlify\b[^;&|]*\b(deploy|publish)\b/i.test(command)
        && (PROD_INTENT.test(command) || /\bproduction\b/i.test(command))
    }
  }
]

/**
 * Returns the reason a command is blocked, or null when it is allowed.
 * Exported so the rules can be exercised without spawning a process.
 */
export function evaluateCommand(command) {
  if (!command) return null
  const flat = flatten(command)
  for (const { match, reason } of RULES) {
    if (match(flat)) return reason
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
