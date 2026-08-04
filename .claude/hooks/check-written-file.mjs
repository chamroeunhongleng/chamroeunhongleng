#!/usr/bin/env node
/**
 * PostToolUse check for Write/Edit: warns when a written file looks like it
 * contains credentials or is an .env file. Warning only (exit 0) — the
 * hard gate is scripts/check-secrets.ts in `npm run verify`.
 */
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

let input = {}
try {
  // Strip a possible UTF-8 BOM (PowerShell pipes add one).
  input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, ''))
} catch {
  process.exit(0)
}

const filePath = String(input?.tool_input?.file_path ?? '')
const content = String(input?.tool_input?.content ?? input?.tool_input?.new_string ?? '')

const warnings = []

const name = basename(filePath)
if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') {
  warnings.push(`"${name}" looks like an environment secrets file — it must never be committed.`)
}

// Patterns assembled at runtime so this hook never flags itself.
const PATTERNS = [
  ['private key block', new RegExp('-----BEGIN [A-Z ]*' + 'PRIVATE KEY-----')],
  ['AWS access key', new RegExp('\\bAKIA' + '[0-9A-Z]{16}\\b')],
  ['GitHub token', new RegExp('\\b(ghp|gho|ghu|ghs|ghr)_' + '[A-Za-z0-9]{36,}\\b')],
  ['Anthropic key', new RegExp('\\bsk-ant-' + '[A-Za-z0-9-]{10,}\\b')],
  ['Slack token', new RegExp('\\bxox[abp]-' + '[A-Za-z0-9-]{10,}\\b')]
]
for (const [label, pattern] of PATTERNS) {
  if (pattern.test(content)) warnings.push(`content matches a ${label} pattern.`)
}

if (warnings.length > 0) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `[check-written-file] WARNING for ${filePath}: ${warnings.join(' ')} Run npm run check:secrets before committing.`
      }
    })
  )
}
process.exit(0)
