// Static server for E2E runs against the prerendered output: the Nuxt dev server
// stalls under parallel load on Windows, and this tests the artifact that deploys.
import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs'
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
  '.pdf': 'application/pdf',
  // With nosniff mirrored from vercel.json, the sitemap stylesheet needs its real type.
  '.xsl': 'application/xslt+xml'
}

// vercel.json "source" -> path predicate. Only the two shapes this repo uses; anything
// else throws rather than silently matching nothing, so a new rule cannot go untested.
function sourceToPredicate(source) {
  if (source === '/(.*)') return () => true
  const prefix = source.match(/^(\/[A-Za-z0-9._/-]*)\(\.\*\)$/)
  if (prefix) return (path) => path.startsWith(prefix[1])
  if (!source.includes('(')) return (path) => path === source
  throw new Error(`[static-server] unsupported vercel.json source pattern: ${source}`)
}

// Read from vercel.json rather than hand-copied, so the suite serves the headers production does.
const HEADER_RULES = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../vercel.json', import.meta.url)), 'utf8')
).headers.map((rule) => ({ matches: sourceToPredicate(rule.source), headers: rule.headers }))

/** Every matching rule applies, later rules winning per key — as Vercel does. */
function headersFor(urlPath, contentType) {
  const headers = { 'content-type': contentType }
  for (const rule of HEADER_RULES) {
    if (!rule.matches(urlPath)) continue
    for (const { key, value } of rule.headers) headers[key] = value
  }
  return headers
}

if (!existsSync(ROOT)) {
  console.error(`[static-server] ${ROOT} does not exist — run "npm run generate" first.`)
  process.exit(1)
}

// Walk the output once into a URL -> file allowlist, so a request is a plain Map lookup
// and the request path is never joined onto a filesystem path (no path injection).
function indexOutput(directory, urlPrefix = '') {
  const files = new Map()
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name)
    const urlPath = `${urlPrefix}/${entry.name}`
    if (entry.isDirectory()) {
      for (const [key, value] of indexOutput(absolute, urlPath)) files.set(key, value)
    } else if (entry.isFile()) {
      // isFile() is false for symlinks (Dirent reflects lstat), so links are never followed out of the tree.
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
  const requestPath = (req.url ?? '/').split(/[?#]/)[0]
  const file = lookup(req.url ?? '/')

  if (!file) {
    // Static hosts serve 404.html with a real 404 status; the unpublished-project test depends on it.
    res.writeHead(404, headersFor(requestPath, 'text/html; charset=utf-8'))
    if (NOT_FOUND) return createReadStream(NOT_FOUND).pipe(res)
    return res.end('Not found')
  }

  const type = TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
  res.writeHead(200, headersFor(requestPath, type))
  createReadStream(file).pipe(res)
})

server.listen(PORT, HOST, () => {
  console.log(`[static-server] serving ${FILES.size} paths from .output/public at http://${HOST}:${PORT}`)
})
