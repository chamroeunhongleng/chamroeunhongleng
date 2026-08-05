import { test, expect } from '@playwright/test'
import { publishedProjects } from './fixtures/projects'

// Must match the breakpoint in app/components/layout/SiteHeader.vue.
// At or below this width the desktop nav is hidden and the Menu toggle appears.
const MOBILE_BREAKPOINT = 760

type Page = import('@playwright/test').Page
type Locator = import('@playwright/test').Locator

function widthOf(page: Page): number {
  const size = page.viewportSize()
  if (!size) throw new Error('viewport size unavailable')
  return size.width
}

/**
 * Open the mobile menu, tolerating hydration.
 *
 * The header is server-rendered, so the Menu button exists and is clickable
 * before Vue attaches its handler — a click that lands in that window is
 * silently swallowed and the menu never opens. (Confirmed: the failure
 * snapshot showed the button still reading "Menu" after a successful click.)
 * Dev mode makes the window wide enough to hit reliably.
 *
 * Retrying is safe because the click is guarded by the current aria-expanded
 * state: it never toggles an already-open menu shut.
 */
async function openMobileMenu(page: Page, toggle: Locator, mobileNav: Locator) {
  await expect(async () => {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await toggle.click()
    }
    await expect(mobileNav).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 20_000 })
}

test.describe('Responsive header', () => {
  test('exposes the navigation that matches the viewport', async ({ page }) => {
    await page.goto('/')

    const desktopNav = page.getByRole('navigation', { name: 'Main navigation' })
    const toggle = page.getByRole('button', { name: /^(Menu|Close)$/ })

    if (widthOf(page) <= MOBILE_BREAKPOINT) {
      await expect(desktopNav).toBeHidden()
      await expect(toggle).toBeVisible()
    } else {
      // Includes both iPad orientations — 810px portrait is above the breakpoint.
      await expect(desktopNav).toBeVisible()
      await expect(toggle).toBeHidden()
    }
  })

  test('mobile menu opens, then Escape closes it and restores focus', async ({ page }) => {
    await page.goto('/')
    test.skip(widthOf(page) > MOBILE_BREAKPOINT, 'viewport uses the inline desktop nav')

    // Name changes to "Close" once open, so match either state.
    const toggle = page.getByRole('button', { name: /^(Menu|Close)$/ })
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })

    await expect(mobileNav).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav')

    await openMobileMenu(page, toggle, mobileNav)
    await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )

    // The Escape handler must also hand focus back, or keyboard users are
    // stranded where the panel used to be.
    await page.keyboard.press('Escape')
    await expect(mobileNav).toBeHidden()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused()
  })

  test('mobile menu closes after navigating', async ({ page }) => {
    await page.goto('/')
    test.skip(widthOf(page) > MOBILE_BREAKPOINT, 'viewport uses the inline desktop nav')

    const toggle = page.getByRole('button', { name: /^(Menu|Close)$/ })
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })

    await openMobileMenu(page, toggle, mobileNav)

    await mobileNav.getByRole('link', { name: 'Projects' }).click()
    await expect(page).toHaveURL(/\/projects/)
    // A menu left open over the new page is the classic SPA bug.
    await expect(mobileNav).toBeHidden()
  })
})

test.describe('Responsive layout', () => {
  // The most common real-device regression: one wide element forces the whole
  // page to scroll sideways. Runs on every project, so a phone-only overflow
  // is caught by the phone projects. Case-study pages are included because
  // they carry the widest content (tables, code, long links).
  const paths = [
    '/',
    '/projects',
    '/about',
    ...publishedProjects.map((p) => `/projects/${p.slug}`)
  ]

  for (const path of paths) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(overflow, `${path} scrolls horizontally by ${overflow}px`).toBeLessThanOrEqual(0)
    })
  }
})
