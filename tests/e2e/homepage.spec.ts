import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display main content', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/Chamroeun|portfolio/i)

    // Verify main heading exists
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  // Navigation is viewport-dependent (desktop nav vs. Menu toggle at 820px,
  // the dock at 760px), so those assertions live in responsive.spec.ts where
  // they run per device. This file stays device-agnostic.

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    expect(errors).toHaveLength(0)
  })

  // Header links, in-page buttons, and the chat assistant point at these.
  test('renders every homepage section by its anchor', async ({ page }) => {
    await page.goto('/')
    for (const id of ['about', 'process', 'now', 'stack', 'work', 'journey', 'education', 'contribute', 'contact']) {
      await expect(page.locator(`#${id}`), `#${id} is missing`).toHaveCount(1)
    }
  })

  // Playwright sets navigator.webdriver, and the marquee, the mascot, and the
  // hero stamp use the same gate as useReveal — which is what keeps screenshot
  // runs deterministic.
  test('keeps ambient motion still in automated runs', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => navigator.webdriver)).toBe(true)
    await expect(page.locator('.marquee-row').first()).toBeVisible()
    await expect(page.locator('.marquee-clone')).toHaveCount(0)
    await expect(page.locator('.mascot[data-animate]')).toHaveCount(0)
    await expect(page.locator('.stamp[data-animate]')).toHaveCount(0)
  })

  // The greeter beside the name is the friendliest way into the assistant.
  test('the hero mascot opens the site assistant', async ({ page }) => {
    await page.goto('/')
    const mascot = page.getByRole('button', { name: 'Open the site assistant' })
    const panel = page.locator('#chat-panel')

    // Server-rendered and clickable before Vue attaches its handler, so retry
    // until the click is heard — guarded so it never clicks an open panel.
    await expect(async () => {
      if (!(await panel.isVisible())) await mascot.click()
      await expect(panel).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
  })

  // The interactive map that once sat in the Now section was removed at the
  // owner's request (2026-10-05); the section is its heading, the availability
  // statement, and the dated cards.
  test('the Now section is plain content, with no canvas', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#now canvas')).toHaveCount(0)
    await expect(page.locator('#now .now-card').first()).toBeVisible()
  })
})
