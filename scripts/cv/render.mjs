// Renders the built /cv page to public/cv/chamroeun-hongleng.pdf (npm run cv:pdf). Served over
// HTTP rather than file:// because the prerendered page requests /_nuxt/* by absolute path.
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

/** Bundled Chromium intermittently fails to spawn here ("spawn UNKNOWN"); Edge is the same engine. */
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

// `generate` copied public/ before this overwrote the PDF; without this copy the just-built
// site would still carry the previous revision.
const inBuild = path.join(root, '.output', 'public', path.relative(path.join(root, 'public'), output))
if (output.startsWith(path.join(root, 'public')) && existsSync(path.dirname(inBuild))) {
  copyFileSync(output, inBuild)
}

console.log(`CV rendered -> ${output}`)
