import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { buildCsp, inlineScriptHashes, injectMeta, policyFor, readCspMeta } from '../scripts/lib/csp'
import { isVercelBuild, outputDir, outputDirLabel } from '../scripts/lib/output-dir'

const sha = (source: string) => `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`

/** A page shaped like the real generated output: charset, viewport, title, importmap, bootstrap. */
function page(head: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>T</title>${head}</head><body></body></html>`
}

describe('inlineScriptHashes', () => {
  it('hashes bare inline scripts against a known vector', () => {
    // Vector computed outside this codebase, so it pins the format a browser
    // expects rather than agreeing with whatever the implementation does:
    //   printf 'var x = 1;' | openssl dgst -sha256 -binary | openssl base64
    expect(inlineScriptHashes(page('<script>var x = 1;</script>'), 'p'))
      .toEqual([`'sha256-9nfWt3DNT14o+tZCP3YilfLwTrhLI98eqbN689B7ajY='`])
  })

  it('hashes the importmap — Chrome enforces script-src on it', () => {
    const map = '{"imports":{"#entry":"/_nuxt/a.js"}}'
    expect(inlineScriptHashes(page(`<script type="importmap">${map}</script>`), 'p')).toEqual([sha(map)])
  })

  it('hashes module and text/javascript scripts', () => {
    const hashes = inlineScriptHashes(
      page('<script type="module">a()</script><script type="text/javascript">b()</script>'),
      'p'
    )
    expect(hashes).toEqual([sha('a()'), sha('b()')])
  })

  it('skips JSON data blocks, which the browser never executes', () => {
    const html = page(
      '<script type="application/ld+json">{"@type":"Person"}</script>'
      + '<script type="application/json" id="__NUXT_DATA__">[1,2]</script>'
    )
    expect(inlineScriptHashes(html, 'p')).toEqual([])
  })

  it('skips same-origin external scripts (covered by \'self\')', () => {
    expect(inlineScriptHashes(page('<script type="module" src="/_nuxt/a.js"></script>'), 'p')).toEqual([])
  })

  it('hashes the raw bytes, not the entity-decoded text', () => {
    const html = page('<script>var a = 1 &amp;&amp; 2;</script>')
    expect(inlineScriptHashes(html, 'p')).toEqual([sha('var a = 1 &amp;&amp; 2;')])
    expect(inlineScriptHashes(html, 'p')).not.toEqual([sha('var a = 1 && 2;')])
  })

  it('deduplicates identical scripts', () => {
    expect(inlineScriptHashes(page('<script>a()</script><script>a()</script>'), 'p')).toEqual([sha('a()')])
  })

  it('throws on an off-origin script rather than omitting it', () => {
    expect(() => inlineScriptHashes(page('<script src="https://evil.example/x.js"></script>'), 'p'))
      .toThrow(/external script/)
    expect(() => inlineScriptHashes(page('<script src="//cdn.example/x.js"></script>'), 'p'))
      .toThrow(/external script/)
  })

  it('throws on a script type it cannot classify', () => {
    expect(() => inlineScriptHashes(page('<script type="speculationrules">{}</script>'), 'p'))
      .toThrow(/unclassifiable/)
  })
})

describe('buildCsp', () => {
  it('locks the default sources down and still works with no hashes', () => {
    const policy = buildCsp([])
    expect(policy).toContain(`default-src 'self'`)
    expect(policy).toContain(`script-src 'self'`)
    expect(policy).toContain(`object-src 'none'`)
    expect(policy).toContain(`base-uri 'self'`)
    expect(policy).not.toContain('unsafe-eval')
  })

  it('never puts unsafe-inline in script-src', () => {
    const scriptSrc = buildCsp([sha('a()')]).split('; ').find((d) => d.startsWith('script-src'))
    expect(scriptSrc).toContain(sha('a()'))
    expect(scriptSrc).not.toContain('unsafe-inline')
  })

  it('omits frame-ancestors, which a meta tag cannot carry', () => {
    expect(buildCsp([])).not.toContain('frame-ancestors')
  })
})

describe('injectMeta', () => {
  const html = page('<script type="importmap">{}</script><script>boot()</script>')

  it('inserts the policy after the viewport meta and before the first script', () => {
    const out = injectMeta(html, policyFor(html, 'p'), 'p')
    expect(out.indexOf('http-equiv="Content-Security-Policy"')).toBeGreaterThan(out.indexOf('name="viewport"'))
    expect(out.indexOf('http-equiv="Content-Security-Policy"')).toBeLessThan(out.indexOf('<script'))
  })

  it('keeps charset inside the first 1024 bytes', () => {
    const out = injectMeta(html, policyFor(html, 'p'), 'p')
    expect(out.indexOf('charset')).toBeLessThan(1024)
  })

  it('leaves the hashed scripts byte-identical', () => {
    const out = injectMeta(html, policyFor(html, 'p'), 'p')
    expect(inlineScriptHashes(out, 'p')).toEqual(inlineScriptHashes(html, 'p'))
    expect(readCspMeta(out)).toBe(policyFor(out, 'p'))
  })

  it('refuses to inject twice', () => {
    const once = injectMeta(html, policyFor(html, 'p'), 'p')
    expect(() => injectMeta(once, policyFor(once, 'p'), 'p')).toThrow(/already present/)
  })

  it('throws when a script precedes the anchor', () => {
    const bad = '<html><head><script>boot()</script><meta charset="utf-8">'
      + '<meta name="viewport" content="w"></head><body></body></html>'
    expect(() => injectMeta(bad, 'default-src \'self\'', 'p')).toThrow(/precedes the injection point/)
  })

  it('throws when there is nothing to anchor on', () => {
    expect(() => injectMeta('<html><head><title>T</title></head></html>', 'x', 'p')).toThrow(/anchor/)
  })
})

describe('readCspMeta', () => {
  it('returns null for a page without a policy', () => {
    expect(readCspMeta(page(''))).toBeNull()
  })
})

// The injector hardcoded .output/public and aborted the first production
// build, because `vercel build` runs the vercel-static preset and writes
// .vercel/output/static. These pin the rule that replaced it.
describe('outputDir', () => {
  const savedVercel = process.env.VERCEL
  const savedPreset = process.env.NITRO_PRESET

  afterEach(() => {
    withEnv({ VERCEL: savedVercel, NITRO_PRESET: savedPreset })
  })

  function withEnv(env: { VERCEL?: string; NITRO_PRESET?: string }) {
    delete process.env.VERCEL
    delete process.env.NITRO_PRESET
    if (env.VERCEL !== undefined) process.env.VERCEL = env.VERCEL
    if (env.NITRO_PRESET !== undefined) process.env.NITRO_PRESET = env.NITRO_PRESET
  }

  it('uses .output/public for a plain local generate', () => {
    withEnv({})
    expect(isVercelBuild()).toBe(false)
    expect(outputDir('/repo')).toMatch(/[\\/]\.output[\\/]public$/)
    expect(outputDirLabel()).toBe('.output/public')
  })

  it('uses .vercel/output/static when the Vercel CLI is running the build', () => {
    withEnv({ VERCEL: '1' })
    expect(isVercelBuild()).toBe(true)
    expect(outputDir('/repo')).toMatch(/[\\/]\.vercel[\\/]output[\\/]static$/)
    expect(outputDirLabel()).toBe('.vercel/output/static')
  })

  it('follows an explicit vercel Nitro preset too', () => {
    withEnv({ NITRO_PRESET: 'vercel-static' })
    expect(isVercelBuild()).toBe(true)
  })

  it('does not treat a non-vercel preset as a Vercel build', () => {
    withEnv({ NITRO_PRESET: 'node-server' })
    expect(isVercelBuild()).toBe(false)
  })

  it('decides from the environment, never from which directory exists', () => {
    // A stale .output/public must not absorb the injection while the artifact
    // bound for production ships with no policy.
    withEnv({ VERCEL: '1' })
    const chosen = outputDir(process.cwd())
    expect(chosen).toContain('.vercel')
    expect(chosen).not.toContain('.output')
  })
})
