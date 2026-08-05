import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from '@playwright/test'
import { publishedProjects } from './fixtures/projects'

/**
 * Visual review capture — not a pass/fail check.
 *
 * Writes a full-page screenshot of every key page at every device size into
 * .tmp/screenshots/<device>/, so the UI can be reviewed as it actually renders
 * on a phone, tablet, and laptop. Excluded from normal runs (see testIgnore in
 * playwright.config.ts); run with `npm run test:e2e:shots`.
 *
 * .tmp/ is disposable by convention — regenerate rather than commit.
 */
const OUT = fileURLToPath(new URL('../../.tmp/screenshots', import.meta.url))

const PAGES: Array<{ name: string, path: string }> = [
  { name: 'home', path: '/' },
  { name: 'projects', path: '/projects' },
  { name: 'about', path: '/about' },
  { name: 'journey', path: '/journey' },
  { name: 'learning', path: '/learning' },
  { name: 'contact', path: '/contact' },
  ...publishedProjects.map((p) => ({ name: `project-${p.slug}`, path: `/projects/${p.slug}` }))
]

for (const target of PAGES) {
  test(`capture ${target.name}`, async ({ page }, testInfo) => {
    const dir = join(OUT, testInfo.project.name)
    mkdirSync(dir, { recursive: true })

    await page.goto(target.path)
    // Fonts and lazy images settle before the shot, or the capture shows a
    // flash-of-unstyled state that does not represent the real page.
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')

    const { height, width } = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      width: document.documentElement.clientWidth
    }))

    // Chromium cannot capture past its max texture size (~16384 DEVICE pixels),
    // so the usable CSS height depends on the device pixel ratio — an iPad at
    // DPR 2 fails at half the height a DPR 1 laptop manages. Rather than guess
    // a constant, start from the full page and halve until it succeeds.
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

    // Above-the-fold, viewport-sized. The full-page shot is unreadable when
    // scaled down; this is the one a human (or a model) can actually judge —
    // and it is the first impression a visitor gets.
    await page.screenshot({ path: join(dir, `${target.name}-fold.png`) })

    // Page height is itself a UX signal: how long is this to scroll on a phone?
    const screens = (height / (page.viewportSize()?.height ?? 1)).toFixed(1)
    console.log(
      `[shot] ${testInfo.project.name.padEnd(24)} ${target.name.padEnd(30)} ` +
        `${width}x${height}px  ${screens} screens${clipped ? '  (clipped)' : ''}`
    )
  })
}

// The mobile menu is invisible in a normal capture, so it gets its own shot on
// the viewports that actually have one.
test('capture mobile menu open', async ({ page }, testInfo) => {
  const width = page.viewportSize()?.width ?? 0
  test.skip(width > 760, 'this viewport shows the inline desktop nav')

  const dir = join(OUT, testInfo.project.name)
  mkdirSync(dir, { recursive: true })

  await page.goto('/')
  const toggle = page.getByRole('button', { name: /^(Menu|Close)$/ })
  await toggle.click()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).waitFor({ state: 'visible' })

  await page.screenshot({ path: join(dir, 'menu-open.png') })
})
