// Static hosting cannot mint nonces, and the inline __NUXT__ config embeds the buildId, so its
// hash rotates every build: the policy is computed from the artifacts and injected as <meta>.
import { createHash } from 'node:crypto'
import { parse } from 'node-html-parser'

/** Script types the browser executes — these need a hash to survive the CSP. */
const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'module', 'importmap'])

/** CSP does not gate data scripts, and ld+json blocks change with every content edit. */
const DATA_TYPES = new Set(['application/json', 'application/ld+json'])

const META_MARKER = 'http-equiv="Content-Security-Policy"'

/** Throws on an unknown script type or off-origin src: omitting one would ship a policy that breaks the page. */
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
    // rawText, not text: the browser hashes the bytes as authored, and .text decodes entities,
    // so a single &amp; would yield a hash no browser ever computes.
    hashes.push(`'sha256-${createHash('sha256').update(script.rawText, 'utf8').digest('base64')}'`)
  }
  return [...new Set(hashes)]
}

/** Hashes are base64 plus single quotes, so nothing needs escaping inside the content attribute. */
export function buildCsp(hashes: string[]): string {
  return [
    `default-src 'self'`,
    `script-src 'self'${hashes.length > 0 ? ` ${hashes.join(' ')}` : ''}`,
    // Vue transitions and the inlined critical CSS write style attributes, which hashes
    // cannot cover; 'unsafe-inline' is the cost of that.
    `style-src 'self' 'unsafe-inline'`,
    // Vite inlines small assets into CSS as data: URIs; a data: image executes nothing.
    `img-src 'self' data:`,
    `font-src 'self'`,
    // /api/chat, /_payload.json, and the same-origin Vercel analytics beacon.
    `connect-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `base-uri 'self'`,
    // The contact form submits via a mailto: location assignment, which form-action never
    // governs; this covers the no-JS fallback.
    `form-action 'self'`
  ].join('; ')
  // frame-ancestors is absent on purpose: <meta> cannot carry it, so vercel.json ships it as a header.
}

export function hasCspMeta(html: string): boolean {
  return html.includes(META_MARKER)
}

// Nitro reuses cached prerender output, so a rebuild can hand the injector pages that still
// carry its previous tag. Splice from the end so the earlier parser offsets stay valid.
export function stripCspMeta(html: string): { html: string; removed: number } {
  const metas = parse(html).querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
  let out = html
  for (const meta of [...metas].reverse()) {
    out = out.slice(0, meta.range[0]) + out.slice(meta.range[1])
  }
  return { html: out, removed: metas.length }
}

// String splice rather than re-serialising: re-serialising rewrites attribute quoting and
// would change the very inline scripts whose hashes were just computed.
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

export function readCspMeta(html: string): string | null {
  const meta = parse(html).querySelector('meta[http-equiv="Content-Security-Policy"]')
  return meta?.getAttribute('content') ?? null
}

export function policyFor(html: string, file: string): string {
  return buildCsp(inlineScriptHashes(html, file))
}
