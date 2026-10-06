import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from '@playwright/test'
import { publishedProjects } from './fixtures/projects'

// Visual review capture, not a pass/fail check. Excluded from normal runs; run with
// `npm run test:e2e:shots`, and E2E_THEME=dark captures into <device>-dark/ instead.
const OUT = fileURLToPath(new URL('../../.tmp/screenshots', import.meta.url))
const DARK = process.env.E2E_THEME === 'dark'

const PAGES: Array<{ name: string, path: string }> = [
  { name: 'home', path: '/' },
  { name: 'projects', path: '/projects' },
  { name: 'about', path: '/about' },
  { name: 'journey', path: '/journey' },
  { name: 'learning', path: '/learning' },
  { name: 'contact', path: '/contact' },
  { name: 'colophon', path: '/colophon' },
  { name: 'cv', path: '/cv' },
  ...publishedProjects.map((p) => ({ name: `project-${p.slug}`, path: `/projects/${p.slug}` }))
]

function outDir(projectName: string): string {
  const dir = join(OUT, DARK ? `${projectName}-dark` : projectName)
  mkdirSync(dir, { recursive: true })
  return dir
}

test.beforeEach(async ({ page }) => {
  if (!DARK) return
  // The theme bootstrap reads localStorage before first paint.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('theme', 'dark')
    } catch {
      /* storage unavailable — capture proceeds in the default theme */
    }
  })
})

for (const target of PAGES) {
  test(`capture ${target.name}`, async ({ page }, testInfo) => {
    const dir = outDir(testInfo.project.name)

    await page.goto(target.path)
    // Let fonts and lazy images settle, or the shot shows a flash-of-unstyled state.
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')

    const { height, width } = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      width: document.documentElement.clientWidth
    }))

    // Chromium cannot capture past its max texture size (~16384 device pixels) and the
    // usable CSS height depends on DPR, so halve from the full page until it succeeds.
    let limit = height
    let clipped = false
    for (let attempt = 0; ; attempt++) {
      try {
        await page.screenshot({
          path: join(dir, `${target.name}.png`),
          ...(clipped ? { clip: { x: 0, y: 0, width, height: limit } } : { fullPage: true })
        })
        break
      } catch (error) {
        if (attempt >= 6) throw error
        clipped = true
        limit = Math.floor(limit / 2)
      }
    }

    // Above-the-fold shot: the full-page one is unreadable when scaled down.
    await page.screenshot({ path: join(dir, `${target.name}-fold.png`) })

    // Page height is itself a UX signal: how long is this to scroll on a phone?
    const screens = (height / (page.viewportSize()?.height ?? 1)).toFixed(1)
    console.log(
      `[shot] ${testInfo.project.name.padEnd(24)} ${target.name.padEnd(30)} ` +
        `${width}x${height}px  ${screens} screens${clipped ? '  (clipped)' : ''}`
    )
  })
}

// The open menu is invisible in a normal capture; 820 matches SiteHeader.vue.
test('capture mobile menu open', async ({ page }, testInfo) => {
  const width = page.viewportSize()?.width ?? 0
  test.skip(width > 820, 'this viewport shows the inline desktop nav')

  const dir = outDir(testInfo.project.name)

  await page.goto('/')
  const toggle = page.getByRole('button', { name: /^(Menu|Close)$/ })
  await toggle.click()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).waitFor({ state: 'visible' })

  await page.screenshot({ path: join(dir, 'menu-open.png') })
})
