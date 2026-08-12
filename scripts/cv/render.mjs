/**
 * Render the site's /cv page to a print-ready A4 PDF.
 *
 *   npm run generate && node scripts/cv/render.mjs [outputPath]
 *   npm run cv:pdf                                   # both steps
 *
 * Defaults to public/cv/chamroeun-hongleng.pdf — the file the site links from
 * the header pill and the contact page.
 *
 * The source is app/pages/cv.vue, the same page a visitor reads at /cv; its
 * @media print block owns the page geometry (@page size and margins), and
 * preferCSSPageSize honours it. There is no separate CV template to keep in
 * sync any more.
 *
 * Why a server instead of file://: a prerendered Nuxt page requests /_nuxt/*
 * by absolute path, which resolves to the filesystem root under file:// and
 * loads nothing. tests/e2e/static-server.mjs already serves .output/public
 * from a fixed allowlist, so this reuses it on an ephemeral port rather than
 * introducing a second server.
 */
import { spawn } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../../', import.meta.url))
const built = path.join(root, '.output', 'public', 'cv', 'index.html')
const output = path.resolve(process.argv[2] ?? 'public/cv/chamroeun-hongleng.pdf')

if (!existsSync(built)) {
  console.error('CV render — FAILED: .output/public/cv/index.html is missing. Run `npm run generate` first.')
  process.exit(1)
}

/** Ask the OS for a free port, then hand it to the server. */
function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })
}

async function waitForServer(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${url}`)
    await new Promise((r) => setTimeout(r, 150))
  }
}

/**
 * The bundled Chromium intermittently fails to spawn on this machine
 * ("spawn UNKNOWN"). Installed Edge is the same engine and prints identically.
 */
async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch (error) {
    console.warn(`CV render — bundled Chromium failed to launch (${error.message.split('\n')[0]}); trying Edge.`)
    return await chromium.launch({ channel: 'msedge' })
  }
}

const port = await freePort()
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, [path.join(root, 'tests', 'e2e', 'static-server.mjs')], {
  cwd: root,
  env: { ...process.env, E2E_PORT: String(port) },
  stdio: 'ignore'
})

let browser
try {
  await waitForServer(`${origin}/cv`)
  browser = await launchBrowser()
  const page = await browser.newPage()
  await page.goto(`${origin}/cv`, { waitUntil: 'networkidle' })
  // Print rules decide the document; render them before measuring page breaks.
  await page.emulateMedia({ media: 'print' })
  mkdirSync(path.dirname(output), { recursive: true })
  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  })
} finally {
  await browser?.close()
  server.kill()
}

// Keep the current build's copy in step: `generate` copied public/ before this
// script overwrote the PDF, so without this the just-built site still carries
// the previous revision.
const inBuild = path.join(root, '.output', 'public', path.relative(path.join(root, 'public'), output))
if (output.startsWith(path.join(root, 'public')) && existsSync(path.dirname(inBuild))) {
  copyFileSync(output, inBuild)
}

console.log(`CV rendered -> ${output}`)
