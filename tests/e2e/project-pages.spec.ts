import { test, expect } from '@playwright/test'
import { stripMarkers } from '../../shared/markers'
import { escapeForRegExp, publishedProjects, unpublishedProjects } from './fixtures/projects'

// Case-study content and structure do not vary by device. The per-device
// concern for these pages — horizontal overflow — lives in responsive.spec.ts
// and does run on every project.
// Playwright's documented form for a hook that needs testInfo but no fixtures;
// the empty pattern is required by its fixture-injection signature.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'laptop', 'content is device-independent')
})

test.describe('Published case studies', () => {
  for (const project of publishedProjects) {
    const name = stripMarkers(project.name)

    test(`${project.slug} renders its case study`, async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`)
      expect(response?.status()).toBe(200)

      // The <h1> carries the project name; markers render as chips in review
      // mode, so compare against the stripped value.
      await expect(page.getByRole('heading', { level: 1 })).toContainText(name)
      await expect(page).toHaveTitle(new RegExp(escapeForRegExp(name)))
      await expect(page.getByRole('link', { name: '← All projects' })).toBeVisible()
    })

    test(`${project.slug} in-page section links resolve`, async ({ page }) => {
      await page.goto(`/projects/${project.slug}`)

      const sectionNav = page.getByRole('navigation', { name: 'Case study sections' })

      // Guard against a vacuous pass: if the section nav ever stops rendering,
      // the loop below would iterate nothing and report green.
      await expect(sectionNav.getByRole('link')).not.toHaveCount(0)

      const hrefs = await page
        .locator('a[href^="#"]')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href')))

      // A case study's section nav is its table of contents; an anchor that
      // points at no element is a silently broken link.
      for (const href of hrefs) {
        if (!href || href === '#') continue
        await expect(page.locator(href), `${href} has no target element`).toHaveCount(1)
      }
    })

    test(`${project.slug} opens external links safely`, async ({ page }) => {
      await page.goto(`/projects/${project.slug}`)

      // target="_blank" without rel="noopener" hands the opened page a
      // reference back to this one (reverse tabnabbing).
      const unsafe = page.locator('a[target="_blank"]:not([rel~="noopener"])')
      await expect(unsafe).toHaveCount(0)
    })
  }
})

test.describe('Projects index', () => {
  test('links to every published project', async ({ page }) => {
    await page.goto('/projects')

    for (const project of publishedProjects) {
      await expect(
        page.locator(`a[href="/projects/${project.slug}"]`).first(),
        `${project.slug} is published but not linked from /projects`
      ).toBeVisible()
    }
  })

  test('does not link to unpublished projects', async ({ page }) => {
    await page.goto('/projects')

    for (const project of unpublishedProjects) {
      await expect(
        page.locator(`a[href="/projects/${project.slug}"]`),
        `${project.slug} is disabled but still linked from /projects`
      ).toHaveCount(0)
    }
  })
})

test.describe('Unpublished projects', () => {
  for (const project of unpublishedProjects) {
    test(`${project.slug} is not reachable`, async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`)

      // The content gate must keep a disabled project off the site entirely —
      // not merely unlinked from the index.
      expect(response?.status(), 'disabled project returned a success status').toBeGreaterThanOrEqual(400)
      await expect(page.getByRole('heading', { level: 1 })).not.toContainText(
        stripMarkers(project.name)
      )
    })
  }
})
