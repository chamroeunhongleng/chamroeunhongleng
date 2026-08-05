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

  // Navigation is viewport-dependent (desktop nav vs. Menu toggle at 760px),
  // so those assertions live in responsive.spec.ts where they run per device.
  // This file stays device-agnostic.

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
})
