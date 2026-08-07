import { test, expect } from '@playwright/test'
import { publishedProjects } from './fixtures/projects'

// Must match the breakpoint in app/components/layout/SiteHeader.vue.
// At or below this width the desktop nav is hidden and the Menu toggle appears.
// 820px is where the desktop header measurably stops fitting on one line —
// which puts iPad portrait (810px) on the mobile menu, by design.
const MOBILE_BREAKPOINT = 820

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

    // A wrapped header is roughly double height. The brand name is supposed to
    // drop out below 450px so the row still fits on one line — before that was
    // fixed, every phone width from 360px up rendered a 102px double-height
    // header instead of 64px.
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

test.describe('Touch targets', () => {
  /**
   * These run only where the pointer is actually coarse — the fixes they guard
   * are all inside `@media (pointer: coarse)`, so on the laptop project there
   * is nothing to assert.
   */
  async function skipUnlessTouch(page: Page) {
    const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches)
    test.skip(!coarse, 'fine pointer — the touch rules do not apply')
  }

  /**
   * Open the chat panel, tolerating hydration — the same contract as
   * openMobileMenu above. The launcher is server-rendered and clickable before
   * Vue attaches its handler, and a click that lands in that window is
   * silently swallowed. Retrying is safe because the panel's own visibility
   * guards it: an already-open panel is never clicked shut.
   */
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
        // 'instant' is required, not tidiness: base.css sets
        // `html { scroll-behavior: smooth }`, which scrollIntoView inherits
        // when no behavior is given. The scroll then animates, and the
        // getBoundingClientRect below reads pre-scroll coordinates — so
        // elementFromPoint probes a spot the target has not reached yet and
        // every hit test reports "nothing".
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

  // The evidence arrow is a ~16px glyph repeated ~30 times sitewide, and it is
  // the site's whole "check this claim yourself" affordance. It cannot grow
  // without pushing inline text apart, so the hit area is an invisible pad —
  // which means only a hit test can prove it is there.
  test('the evidence arrow is tappable past the edge of its glyph', async ({ page }) => {
    await page.goto('/projects')
    await skipUnlessTouch(page)

    for (const [dx, dy] of [
      [0, 0],
      [0, -16],
      [0, 16],
      [-16, 0],
      [16, 0]
    ]) {
      expect(
        await hitAt(page, '.evidence-link', dx, dy),
        `a tap ${dx},${dy}px from the arrow's centre missed it`
      ).toContain('evidence-link')
    }
  })

  // The card title is 25px tall on a phone. The card is meant to be the target
  // (hence .project-card's `position: relative`, .live-link's z-index, and the
  // aria-hidden "Case study →" span) — assert it really is, and that the links
  // layered above it did not get swallowed.
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

  // iOS Safari zooms the page in when a focused field is under 16px and never
  // zooms back out. projects/index.vue already guards its filter controls;
  // the chat field was the one that still tripped it.
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

  // The controls that drive the assistant. They were 29px (chips) and 40px
  // (field, Send) — the smallest targets on the site after the arrows.
  test('the chat controls meet the 44px target floor', async ({ page }) => {
    await page.goto('/')
    await skipUnlessTouch(page)

    await openChat(page)

    const short = await page.evaluate(() =>
      [...document.querySelectorAll('.chat-chip, .chat-input, .chat-send, .chat-action')]
        .map((el) => ({ el: el.className, h: +el.getBoundingClientRect().height.toFixed(1) }))
        // Device emulation scales rects a shade under the CSS value, so the
        // floor is asserted with a 1px tolerance rather than exactly 44.
        .filter((c) => c.h < 43)
    )
    expect(short, `chat controls under 44px: ${JSON.stringify(short)}`).toEqual([])
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
