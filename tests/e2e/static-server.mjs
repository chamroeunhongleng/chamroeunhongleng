/**
 * Minimal static file server for E2E runs against the generated site.
 *
 * Why this exists: the Nuxt DEV server intermittently stalls under sustained
 * parallel load on Windows — navigations hang until the test timeout and die
 * with "net::ERR_ABORTED; maybe frame was detached?", on a different route
 * each run. Serving the prerendered output removes compilation from the loop
 * entirely and tests the artifact that actually deploys.
 *
 * `nuxt preview` is not used because it expects a nitro server build and
 * parses `--host` as a positional rootDir. Zero dependencies on purpose.
 *
 * Binds 127.0.0.1 explicitly — see playwright.config.ts on the IPv4/IPv6 trap.
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../.output/public', import.meta.url))
const PORT = Number(process.env.E2E_PORT ?? 3000)
const HOST = '127.0.0.1'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf'
}

if (!existsSync(ROOT)) {
  console.error(`[static-server] ${ROOT} does not exist — run "npm run generate" first.`)
  process.exit(1)
}

/** Resolve a URL path to a file inside ROOT, or null if it escapes or is missing. */
function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  // normalize() collapses "..", and the prefix check keeps traversal inside ROOT.
  const candidate = normalize(join(ROOT, decoded))
  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) return null

  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate

  // Prerendered routes are directories holding index.html.
  const asIndex = join(candidate, 'index.html')
  if (existsSync(asIndex) && statSync(asIndex).isFile()) return asIndex

  return null
}

const server = createServer((req, res) => {
  const file = resolve(req.url ?? '/')

  if (!file) {
    // Static hosts serve 404.html with a real 404 status; the "unpublished
    // project is unreachable" test depends on that status being honest.
    const notFound = join(ROOT, '404.html')
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    if (existsSync(notFound)) return createReadStream(notFound).pipe(res)
    return res.end('Not found')
  }

  res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})

server.listen(PORT, HOST, () => {
  console.log(`[static-server] serving .output/public at http://${HOST}:${PORT}`)
})
