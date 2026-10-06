import { test, expect } from '@playwright/test'
import { ALL_ROUTES, routeLabel } from './fixtures/routes'

// Whole-site health on every published route. Content and metadata do not vary by
// device, so this runs on laptop only; per-device concerns live in responsive.spec.ts.

// Keep the directive on ONE line: a wrapped description would become the comment, leaving the hook unguarded.
// eslint-disable-next-line no-empty-pattern -- Playwright's documented form for a hook that needs testInfo but no fixtures.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'laptop', 'site content is device-independent')
})

for (const route of ALL_ROUTES) {
  const label = routeLabel(route)

  test.describe(`${label} (${route})`, () => {
    test('loads, and is titled and described', async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status(), 'route did not return 200').toBe(200)

      // An empty title or description is a silent SEO regression nothing else catches per-route.
      const title = await page.title()
      expect(title.trim().length, 'empty <title>').toBeGreaterThan(0)

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content')
      expect(description?.trim().length ?? 0, 'empty meta description').toBeGreaterThan(10)
    })

    test('has exactly one h1', async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('h1')).toHaveCount(1)
    })

    test('renders no console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      page.on('pageerror', (error) => errors.push(String(error)))

      await page.goto(route)
      await page.waitForLoadState('networkidle')

      expect(errors, `console errors on ${route}`).toEqual([])
    })

    // A CSP refusal is not a console error: it arrives as a securitypolicyviolation
    // event, so the assertion above cannot see it.
    test('triggers no Content-Security-Policy violations', async ({ page }) => {
      await page.addInitScript(() => {
        const seen: string[] = []
        ;(window as unknown as { __cspViolations: string[] }).__cspViolations = seen
        document.addEventListener('securitypolicyviolation', (event) => {
          seen.push(`${event.violatedDirective} blocked ${event.blockedURI || '(inline or eval)'}`)
        })
      })

      await page.goto(route)
      await page.waitForLoadState('networkidle')

      const violations = await page.evaluate(
        () => (window as unknown as { __cspViolations: string[] }).__cspViolations
      )
      expect(violations, `CSP violations on ${route}`).toEqual([])
    })

    test('every image has alt text', async ({ page }) => {
      await page.goto(route)

      // alt="" is fine for decoration; a missing attribute makes a screen reader announce the file name.
      const missing = await page.locator('img:not([alt])').evaluateAll((imgs) =>
        imgs.map((img) => (img as HTMLImageElement).src)
      )
      expect(missing, 'images without an alt attribute').toEqual([])
    })

    test('opens external links safely', async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('a[target="_blank"]:not([rel~="noopener"])')).toHaveCount(0)
    })
  })
}

test.describe('Site-wide navigation', () => {
  test('every internal link resolves', async ({ page, request }) => {
    const targets = new Set<string>()

    for (const route of ALL_ROUTES) {
      await page.goto(route)
      const hrefs = await page.locator('a[href]').evaluateAll((links) =>
        links
          .map((a) => a.getAttribute('href') ?? '')
          .filter((h) => h.startsWith('/') && !h.startsWith('//'))
      )
      for (const href of hrefs) targets.add(href.split('#')[0] || '/')
    }

    expect(targets.size, 'no internal links found — selector is probably wrong').toBeGreaterThan(5)

    const broken: string[] = []
    for (const target of targets) {
      const response = await request.get(target)
      if (response.status() >= 400) broken.push(`${target} -> ${response.status()}`)
    }
    expect(broken, 'internal links returning >=400').toEqual([])
  })

  test('the skip link reaches main content', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to main/i })
    await expect(skip).toBeFocused()

    const href = await skip.getAttribute('href')
    expect(href, 'skip link has no fragment target').toMatch(/^#/)
    await expect(page.locator(href!), 'skip link points at nothing').toHaveCount(1)
  })

  test('a missing page returns 404 rather than a blank render', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

test.describe('Theme', () => {
  test('toggling theme changes the document and survives reload', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('switch')
    await expect(toggle).toBeVisible()

    const themeOf = () =>
      page.evaluate(() => document.documentElement.dataset.theme ?? document.documentElement.className)

    const before = await themeOf()

    // The toggle is server-rendered, so an early click is swallowed before Vue attaches
    // its handler. Retry, guarded by the current value so it never toggles back.
    await expect(async () => {
      if ((await themeOf()) === before) await toggle.click()
      expect(await themeOf()).not.toBe(before)
    }).toPass({ timeout: 20_000 })

    const after = await themeOf()
    await page.reload()
    expect(await themeOf(), 'theme did not persist across reload').toBe(after)
  })
})
