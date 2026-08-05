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
 *
 * SERVING MODEL: the request path is never joined onto a filesystem path.
 * `.output/public` is walked once at startup into a URL -> absolute-path map,
 * and a request is a plain Map lookup; anything not in the map is a 404. The
 * earlier version joined the decoded URL onto ROOT and guarded the result with
 * normalize() + startsWith(), which CodeQL flagged as path injection (5 High
 * alerts) and which is genuinely hard to prove correct — it has to be right
 * about percent-encoding, null bytes, Windows vs POSIX separators, and
 * symlinks all at once. An allowlist has none of those failure modes: the set
 * of servable files is fixed before the socket opens. Directory entries that
 * are symlinks are skipped rather than followed, so a link planted in the
 * build output cannot escape either.
 */
import { createReadStream, existsSync, readdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'
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

/**
 * Walk the prerendered output once and return every servable URL path mapped
 * to its absolute file path. Prerendered routes are directories holding
 * index.html, so each of those is registered under `/route`, `/route/` and
 * `/route/index.html` — the three forms a browser or test may ask for.
 */
function indexOutput(directory, urlPrefix = '') {
  const files = new Map()
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name)
    const urlPath = `${urlPrefix}/${entry.name}`
    if (entry.isDirectory()) {
      for (const [key, value] of indexOutput(absolute, urlPath)) files.set(key, value)
    } else if (entry.isFile()) {
      // isFile() is false for symlinks (Dirent reflects lstat), so links are
      // skipped rather than followed out of the tree.
      files.set(urlPath, absolute)
      if (entry.name === 'index.html') {
        files.set(urlPrefix === '' ? '/' : urlPrefix, absolute)
        files.set(`${urlPrefix}/`, absolute)
      }
    }
  }
  return files
}

const FILES = indexOutput(ROOT)

/** Look a request up in the allowlist. Never touches the filesystem. */
function lookup(requestUrl) {
  let decoded
  try {
    decoded = decodeURIComponent(requestUrl.split(/[?#]/)[0])
  } catch {
    return null // malformed percent-encoding
  }
  return FILES.get(decoded) ?? null
}

const NOT_FOUND = FILES.get('/404.html') ?? null

const server = createServer((req, res) => {
  const file = lookup(req.url ?? '/')

  if (!file) {
    // Static hosts serve 404.html with a real 404 status; the "unpublished
    // project is unreachable" test depends on that status being honest.
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    if (NOT_FOUND) return createReadStream(NOT_FOUND).pipe(res)
    return res.end('Not found')
  }

  res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})

server.listen(PORT, HOST, () => {
  console.log(`[static-server] serving ${FILES.size} paths from .output/public at http://${HOST}:${PORT}`)
})
