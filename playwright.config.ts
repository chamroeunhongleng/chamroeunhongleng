import { defineConfig, devices } from '@playwright/test'

// Laptop only by default; E2E_DEVICES (or CI) runs the full phone and iPad matrix.
const FULL_MATRIX = !!process.env.E2E_DEVICES || !!process.env.CI

// E2E_BUILD=1 tests the prerendered .output/public: no on-demand compilation, which is what
// makes long dev-server runs flaky, and it is the artifact that actually deploys.
const USE_BUILD = !!process.env.E2E_BUILD

// With reuseExistingServer on, an unrelated server on 3000 would be silently adopted;
// E2E_PORT overrides it, and tests/e2e/static-server.mjs reads the same variable.
const PORT = Number(process.env.E2E_PORT ?? 3000)
const ORIGIN = `http://127.0.0.1:${PORT}`

// WebKit will not launch on this machine (missing icuuc77.dll), so the Apple projects run
// device metrics on Chromium: layout regressions are caught, Safari engine bugs are not.
const appleMetricsOnChromium = (device: typeof devices[string]) => ({
  ...device,
  browserName: 'chromium' as const
})

const LAPTOP = {
  name: 'laptop',
  use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
}

export default defineConfig({
  testDir: './tests/e2e',
  // The screenshot run writes ~100 images and is a review tool, not a check; opt in with E2E_SHOTS.
  testIgnore: process.env.E2E_SHOTS ? [] : ['**/screenshots.spec.ts'],
  // Compiles every route once, serially, so workers never race the dev server's first-request compile.
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The dev server compiles routes on first request and dies under 8 simultaneous first hits
  // ("net::ERR_ABORTED; maybe frame was detached?"); the static server handles full concurrency.
  workers: process.env.CI ? 1 : FULL_MATRIX && !USE_BUILD ? 2 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    // 127.0.0.1, not localhost: Nuxt dev binds ::1 only on Windows and Node may resolve localhost
    // to IPv4 first, so the health check would poll a dead address; --host below pins the server to match.
    baseURL: ORIGIN,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: FULL_MATRIX
    ? [
        LAPTOP,
        // 320x568 — below SiteHeader's 22.4em (~358px) rule, so the monogram alone carries the brand.
        { name: 'mobile-small', use: appleMetricsOnChromium(devices['iPhone SE']) },
        // 360x740 — the width SiteHeader's header-row spacing was tuned against.
        { name: 'mobile-android-compact', use: { ...devices['Galaxy S8'] } },
        // 393x851 — below the 760px breakpoint, so: mobile menu.
        { name: 'mobile-android', use: { ...devices['Pixel 5'] } },
        // 390x844 — mobile menu.
        { name: 'mobile-ios', use: appleMetricsOnChromium(devices['iPhone 13']) },
        // 810x1080 portrait — ABOVE 760px, so iPads get the desktop nav.
        { name: 'tablet-ipad', use: appleMetricsOnChromium(devices['iPad (gen 7)']) },
        // 1080x810 landscape — desktop nav.
        {
          name: 'tablet-ipad-landscape',
          use: appleMetricsOnChromium(devices['iPad (gen 7) landscape'])
        }
      ]
    : [LAPTOP],

  webServer: {
    command: USE_BUILD
      ? 'node tests/e2e/static-server.mjs'
      : `npm run dev -- --host 127.0.0.1 --port ${PORT}`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
    // A cold Nuxt/Vite dev start on Windows can exceed the 120s default.
    timeout: 240_000
  }
})
