import { defineConfig, devices } from '@playwright/test'

// Single device by default (fast loop); the full device matrix on demand:
//   npm run test:e2e            -> laptop only
//   npm run test:e2e:devices    -> laptop + phones + iPads
const FULL_MATRIX = !!process.env.E2E_DEVICES || !!process.env.CI

// E2E_BUILD=1 tests the prerendered site in .output/public instead of the dev
// server. Slower to start (a ~13s `npm run generate` first) but it removes
// on-demand compilation, which is what makes long dev-server runs flaky here —
// and it exercises the artifact that actually deploys.
const USE_BUILD = !!process.env.E2E_BUILD

// WebKit will not launch on this Windows machine (missing icuuc77.dll), so the
// iOS/iPadOS projects run Apple *device metrics* — viewport, DPR, touch, mobile
// UA — on the Chromium engine. That catches layout and responsive regressions,
// which is what these projects are for. It does NOT catch Safari engine bugs.
// See workflows/test-with-playwright.md for the real-Safari options.
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
  // Compiles every route once, serially, so parallel workers never race the
  // Nuxt dev server's first-request compile. See tests/e2e/global-setup.ts.
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The Nuxt DEV server compiles each route on first request. With the full
  // matrix at default concurrency (8 workers here), simultaneous first-hits on
  // uncompiled routes overwhelm it and requests die with
  // "net::ERR_ABORTED; maybe frame was detached?" — whole projects fail while
  // the same tests pass in isolation. Capping concurrency keeps it stable.
  // The static server handles full concurrency fine; only the dev server needs
  // throttling (it stalls under sustained parallel load on Windows).
  workers: process.env.CI ? 1 : FULL_MATRIX && !USE_BUILD ? 2 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    // 127.0.0.1, not "localhost": Nuxt dev binds IPv6 (::1) only by default on
    // Windows, and Node can resolve "localhost" to IPv4 first — the webServer
    // health check then polls a dead address until it times out. The --host
    // flag below pins the server to the same IPv4 address this polls.
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: FULL_MATRIX
    ? [
        LAPTOP,
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
      : 'npm run dev -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    // A cold Nuxt/Vite dev start on Windows can exceed the 120s default.
    timeout: 240_000
  }
})
