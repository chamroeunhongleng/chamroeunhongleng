import { test, expect } from '@playwright/test'
import { publishedProjects } from './fixtures/projects'

// Must match SiteHeader.vue: at or below this width the Menu toggle replaces the
// desktop nav. 820 puts iPad portrait (810px) on the mobile menu, by design.
const MOBILE_BREAKPOINT = 820

// Must match MobileDock.vue and the chat widget's phone layout: at or below this
// width the bottom dock exists and the header scrolls away with the page.
const PHONE_BREAKPOINT = 760

type Page = import('@playwright/test').Page
type Locator = import('@playwright/test').Locator

function widthOf(page: Page): number {
  const size = page.viewportSize()
  if (!size) throw new Error('viewport size unavailable')
  return size.width
}

// The header is server-rendered, so an early click is swallowed before Vue attaches
// its handler. Retry, guarded by aria-expanded so it never toggles an open menu shut.
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
      await expect(desktopNav).toBeVisible()
      await expect(toggle).toBeHidden()
    }
  })

  test('header stays on one line', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const { rowHeight, tallestControl } = await page.evaluate(() => {
      const row = document.querySelector('.header-row') as HTMLElement
      const kids = Array.from(row.children).map((c) => c.getBoundingClientRect())
      return {
        rowHeight: row.getBoundingClientRect().height,
        tallestControl: Math.max(...kids.map((k) => k.height))
      }
    })

    // A wrapped header is roughly double height, hence the 1.8 factor.
    expect(
      rowHeight,
      `header wrapped to two lines (row ${rowHeight}px vs tallest control ${tallestControl}px)`
    ).toBeLessThan(tallestControl * 1.8)
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
    await expect(mobileNav).toBeHidden()
  })
})

test.describe('Phone dock', () => {
  test('exists on phones only, beside the chat launcher rather than under it', async ({ page }) => {
    await page.goto('/')
    const dock = page.getByRole('navigation', { name: 'Quick navigation' })

    if (widthOf(page) > PHONE_BREAKPOINT) {
      await expect(dock).toBeHidden()
      return
    }

    await expect(dock).toBeVisible()
    const launcher = page.getByRole('button', { name: 'Chat about this site' })
    const [dockBox, launcherBox] = await Promise.all([dock.boundingBox(), launcher.boundingBox()])
    expect(dockBox && launcherBox, 'dock or launcher has no box').toBeTruthy()
    expect(
      dockBox!.x + dockBox!.width,
      'the dock runs underneath the chat launcher'
    ).toBeLessThanOrEqual(launcherBox!.x)

    // 44px touch floor, with 1px tolerance for device-emulation rounding.
    const short = await dock.locator('a').evaluateAll((links) =>
      links.map((a) => +a.getBoundingClientRect().height.toFixed(1)).filter((h) => h < 43)
    )
    expect(short, `dock links under 44px: ${JSON.stringify(short)}`).toEqual([])
  })

  // A real click on purpose: the chat widget's box spans the bottom strip and once
  // swallowed dock taps; Playwright refuses the click if anything else would take it.
  test('a dock link is tappable, navigates, and marks the current page', async ({ page }) => {
    await page.goto('/')
    test.skip(widthOf(page) > PHONE_BREAKPOINT, 'no dock at this width')

    const dock = page.getByRole('navigation', { name: 'Quick navigation' })
    await dock.getByRole('link', { name: 'Projects' }).click()
    await expect(page).toHaveURL(/\/projects/)
    await expect(dock.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page')
  })

  test('the header scrolls away on phones and stays put on wider screens', async ({ page }) => {
    await page.goto('/')
    const position = await page.evaluate(
      () => getComputedStyle(document.querySelector('.site-header')!).position
    )
    expect(position).toBe(widthOf(page) > PHONE_BREAKPOINT ? 'sticky' : 'relative')
  })
})

test.describe('Touch targets', () => {
  /** The rules under test live inside `@media (pointer: coarse)`; a fine pointer has nothing to assert. */
  async function skipUnlessTouch(page: Page) {
    const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches)
    test.skip(!coarse, 'fine pointer — the touch rules do not apply')
  }

  /** Same hydration race as openMobileMenu: retry, guarded by the panel's own visibility. */
  async function openChat(page: Page) {
    const launcher = page.getByRole('button', { name: 'Chat about this site' })
    const panel = page.locator('#chat-panel')
    await expect(async () => {
      if (!(await panel.isVisible())) await launcher.click()
      await expect(panel).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
  }

  /** What a tap at (centre + offset) would actually activate. */
  function hitAt(page: Page, selector: string, dx: number, dy: number) {
    return page.evaluate(
      ([sel, x, y]) => {
        const el = document.querySelector(sel as string)
        if (!el) return 'MISSING'
        // 'instant' is required: base.css sets `html { scroll-behavior: smooth }`, and a
        // smooth scroll leaves getBoundingClientRect reading pre-scroll coordinates.
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
        const r = el.getBoundingClientRect()
        const hit = document.elementFromPoint(
          r.left + r.width / 2 + (x as number),
          r.top + r.height / 2 + (y as number)
        )
        return hit?.closest('a, button')?.className ?? 'nothing'
      },
      [selector, dx, dy] as const
    )
  }

  // The arrow's hit area is an invisible pad (the ~16px glyph cannot grow without
  // pushing inline text apart), so only a hit test can prove it is there.
  test('the evidence arrow is tappable past the edge of its glyph', async ({ page }) => {
    await page.goto('/projects')
    await skipUnlessTouch(page)

    for (const [dx, dy] of [
      [0, 0],
      [0, -16],
      [0, 16],
      [-16, 0],
      [16, 0]
    ] as const) {
      expect(
        await hitAt(page, '.evidence-link', dx, dy),
        `a tap ${dx},${dy}px from the arrow's centre missed it`
      ).toContain('evidence-link')
    }
  })

  // The whole card is the target (hence .project-card's `position: relative` and
  // .live-link's z-index); the links layered above it must not get swallowed.
  test('the project card body opens the case study', async ({ page }) => {
    await page.goto('/projects')
    await skipUnlessTouch(page)

    for (const region of ['.card-summary', '.tag-list']) {
      expect(await hitAt(page, region, 0, 0), `${region} is not part of the card link`)
        .toContain('card-link')
    }

    // Independently clickable things must stay independently clickable.
    for (const own of ['.live-link', '.proof-link', '.card-proof .evidence-link']) {
      expect(await hitAt(page, own, 0, 0), `${own} was covered by the card overlay`)
        .toContain(own.split('.').pop()!)
    }
  })

  // iOS Safari zooms in on a focused field under 16px and never zooms back out.
  test('no focusable field is small enough to trigger iOS zoom', async ({ page }) => {
    await page.goto('/')
    await skipUnlessTouch(page)

    await openChat(page)

    const tooSmall = await page.evaluate(() =>
      [...document.querySelectorAll('input, select, textarea')]
        .filter((el) => el.getBoundingClientRect().height > 0)
        .map((el) => ({ el: el.id || el.className, px: parseFloat(getComputedStyle(el).fontSize) }))
        .filter((f) => f.px < 16)
    )
    expect(tooSmall, `fields under 16px: ${JSON.stringify(tooSmall)}`).toEqual([])
  })

  test('the chat controls meet the 44px target floor', async ({ page }) => {
    await page.goto('/')
    await skipUnlessTouch(page)

    await openChat(page)

    const short = await page.evaluate(() =>
      [...document.querySelectorAll('.chat-chip, .chat-input, .chat-send, .chat-action')]
        .map((el) => ({ el: el.className, h: +el.getBoundingClientRect().height.toFixed(1) }))
        // Device emulation scales rects a shade under the CSS value: 1px tolerance.
        .filter((c) => c.h < 43)
    )
    expect(short, `chat controls under 44px: ${JSON.stringify(short)}`).toEqual([])
  })

  test('homepage buttons, pills, and icon buttons meet the 44px target floor', async ({ page }) => {
    await page.goto('/')
    await skipUnlessTouch(page)

    const short = await page.evaluate(() =>
      [...document.querySelectorAll('.btn, a.pill, button.pill, .icon-btn, .social-profile-link--round, .story-link, .thanks-link')]
        .filter((el) => el.getBoundingClientRect().height > 0)
        .map((el) => ({ el: el.className || el.tagName, h: +el.getBoundingClientRect().height.toFixed(1) }))
        .filter((c) => c.h < 43)
    )
    expect(short, `targets under 44px: ${JSON.stringify(short)}`).toEqual([])
  })
})

test.describe('Responsive layout', () => {
  const paths = [
    '/',
    '/projects',
    '/about',
    '/cv',
    '/journey',
    '/learning',
    '/contact',
    '/colophon',
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
