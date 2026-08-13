/**
 * csp — the Content-Security-Policy the generated site carries.
 *
 * The site is statically hosted, so nonces are impossible: there is no server
 * to mint a fresh one per request. Hashes are the alternative, and they cannot
 * live in vercel.json either — Nuxt's `window.__NUXT__.config` inline script
 * embeds the buildId, so its hash changes with every single build and a
 * hardcoded header would silently break the site one deploy later.
 *
 * So the policy is computed from the build artifacts and injected into each
 * generated page as a <meta> tag (scripts/inject-csp.ts), then re-derived and
 * compared byte-for-byte by scripts/check-csp.ts. Nothing is stored between
 * runs; the artifacts are the source of truth.
 *
 * This operates on generated HTML only — never on source or content files.
 * (CLAUDE.md rule 3 forbids regex-over-source content validation; parsing your
 * own build output with a real HTML parser is a different activity.)
 */
import { createHash } from 'node:crypto'
import { parse } from 'node-html-parser'

/** Script types the browser executes — these need a hash to survive the CSP. */
const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'module', 'importmap'])

/**
 * Script types the browser parses as data. CSP does not gate them, so hashing
 * them would only add noise — and ld+json blocks change with content edits.
 */
const DATA_TYPES = new Set(['application/json', 'application/ld+json'])

const META_MARKER = 'http-equiv="Content-Security-Policy"'

/**
 * SHA-256 hash-sources for every executable inline script in one page.
 *
 * Throws rather than guessing: an unknown script type or an off-origin src is
 * exactly the kind of thing a Nuxt upgrade or a new integration introduces,
 * and silently omitting it would ship a policy that breaks the page.
 */
export function inlineScriptHashes(html: string, file: string): string[] {
  const hashes: string[] = []
  for (const script of parse(html).querySelectorAll('script')) {
    const src = script.getAttribute('src')
    const type = (script.getAttribute('type') ?? '').toLowerCase()

    if (src !== undefined) {
      // `//host/path` is protocol-relative, i.e. off-origin — reject it too.
      if (!src.startsWith('/') || src.startsWith('//')) {
        throw new Error(`${file}: external script "${src}" is not covered by script-src 'self'`)
      }
      continue
    }
    if (DATA_TYPES.has(type)) continue
    if (!EXECUTABLE_TYPES.has(type)) {
      throw new Error(`${file}: unclassifiable <script type="${type}"> — extend csp.ts deliberately`)
    }
    // rawText, NOT text: the browser hashes the bytes as authored. `.text`
    // decodes entities, so a single &amp; would produce a plausible-looking
    // hash that no browser ever computes.
    hashes.push(`'sha256-${createHash('sha256').update(script.rawText, 'utf8').digest('base64')}'`)
  }
  return [...new Set(hashes)]
}

/**
 * The policy string. Hash values are base64 plus quotes, so they need no
 * escaping inside the double-quoted content attribute.
 */
export function buildCsp(hashes: string[]): string {
  return [
    `default-src 'self'`,
    `script-src 'self'${hashes.length > 0 ? ` ${hashes.join(' ')}` : ''}`,
    // Vue scoped styles and transitions write inline style attributes, and the
    // build inlines critical CSS. Hashing does not apply to style attributes,
    // so 'unsafe-inline' here is the honest cost of the current architecture.
    `style-src 'self' 'unsafe-inline'`,
    // data: covers small assets Vite may inline into CSS. A data: image
    // executes nothing, so this does not weaken the script boundary.
    `img-src 'self' data:`,
    `font-src 'self'`,
    // /api/chat, /_payload.json, and the same-origin Vercel analytics beacon.
    `connect-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `base-uri 'self'`,
    // The contact form is @submit.prevent + a mailto: location assignment,
    // which form-action never governs; this covers the no-JS fallback.
    `form-action 'self'`
  ].join('; ')
  // frame-ancestors is deliberately absent: <meta> cannot carry it. It ships
  // as a real header from vercel.json (mirrored in nuxt.config routeRules).
}

export function hasCspMeta(html: string): boolean {
  return html.includes(META_MARKER)
}

/**
 * Remove any CSP meta tags, returning the document as it was before injection.
 *
 * This is what makes the injector re-runnable. A rebuild does not always
 * rewrite every page — Nitro reuses cached prerender output — so a second
 * `vercel build` over an existing output directory hands the injector pages
 * carrying its own previous tag. Stripping first is safe because the hashes
 * are recomputed from the page's scripts every time, so a fresh injection on
 * unchanged input is byte-identical to the one it replaces.
 *
 * Ranges come from parsing the original string, so splice from the end
 * backwards to keep the earlier offsets valid.
 */
export function stripCspMeta(html: string): { html: string; removed: number } {
  const metas = parse(html).querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
  let out = html
  for (const meta of [...metas].reverse()) {
    out = out.slice(0, meta.range[0]) + out.slice(meta.range[1])
  }
  return { html: out, removed: metas.length }
}

/**
 * Splice the meta tag in after the viewport meta (charset as fallback).
 *
 * String splice at parser-reported offsets rather than re-serialising the
 * document: re-serialising a Nuxt page rewrites attribute quoting and would
 * change the very inline scripts whose hashes were just computed.
 */
export function injectMeta(html: string, policy: string, file: string): string {
  if (hasCspMeta(html)) {
    throw new Error(`${file}: a CSP meta tag is already present — regenerate rather than re-injecting`)
  }
  const root = parse(html)
  const anchor = root.querySelector('meta[name="viewport"]') ?? root.querySelector('meta[charset]')
  if (!anchor) {
    throw new Error(`${file}: no <meta charset> or viewport to anchor the CSP tag on`)
  }
  const insertAt = anchor.range[1]
  const firstScript = root.querySelector('script')
  if (firstScript && firstScript.range[0] < insertAt) {
    throw new Error(`${file}: a <script> precedes the injection point — the CSP would not govern it`)
  }
  return `${html.slice(0, insertAt)}<meta ${META_MARKER} content="${policy}">${html.slice(insertAt)}`
}

/** The policy actually present in a page, or null if there is no CSP meta. */
export function readCspMeta(html: string): string | null {
  const meta = parse(html).querySelector('meta[http-equiv="Content-Security-Policy"]')
  return meta?.getAttribute('content') ?? null
}

/** Convenience for both the injector and the checker: page HTML → policy. */
export function policyFor(html: string, file: string): string {
  return buildCsp(inlineScriptHashes(html, file))
}
