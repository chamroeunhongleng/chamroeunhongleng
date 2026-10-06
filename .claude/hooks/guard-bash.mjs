#!/usr/bin/env node
// PreToolUse denylist for Bash commands; exit 2 blocks the call and shows the reason.
// Not a security boundary: an unparsed shell string can always be dequoted around it.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** Collapse newlines so a command placed on a later line cannot slip past a single-line pattern. */
const flatten = (command) => command.replace(/[\r\n]+/g, ' ')

/** Blank out quoted runs so a commit message that merely mentions `--prod` is not a deploy. */
const unquoted = (text) => text.replace(/'[^']*'/g, " '' ").replace(/"[^"]*"/g, ' "" ')

/** `cat .env.example > .env` only writes the secret file, so the read rule looks left of the redirect. */
const beforeRedirect = (text) => text.split('>')[0]

/** (?:^|\s) rather than \b: a space before a hyphen is non-word on both sides, so \b never matches there. */
const PROD_INTENT = /(?:^|\s)(?:--prod(?:uction)?\b|--target[=\s]+production\b)/i

const RM_RECURSIVE = /(?:^|\s)(?:-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\b/
const RM_FORCE = /(?:^|\s)(?:-[a-zA-Z]*f[a-zA-Z]*|--force)\b/
const RM_INVOKED = /(?:^|\s|["'`/])["']?rm["']?\s/

const ENV_READERS = /\b(cat|type|Get-Content|gc|less|more|head|tail|grep|egrep|rg|ag|sed|awk|xxd|od|strings|nano|vim|vi|source|dotenv|printenv)\b/i
/** `.env`, `.env.local`, `.env.production.local` — but never `.env.example`. */
const ENV_FILE = /\.env(?!\.example\b)(?:\.[a-z0-9]+)*\b/i

// Matched positionally (first non-flag token after `vercel`), never "anywhere in the string":
// a trailing `# see .env.example` would otherwise register as the `env` subcommand.
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
    // The trailing [a-z]* matters: \b after the f cannot hold inside clustered flags like -fdx.
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

/** Exported so tests can exercise the rules without spawning a process. */
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

// Only run when executed directly, so importing from a test does not read stdin.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
