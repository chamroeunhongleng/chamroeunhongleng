# Playwright E2E Testing Workflow

## Objective
Validate portfolio behaviour across real device shapes — phone, laptop, iPad —
and verify every case-study page renders. Catch responsive, layout, and
interaction bugs before deploy.

## Prerequisites
- `npm install --save-dev @playwright/test`
- Browser binary: `npx playwright install chromium`
  (the npm package alone is NOT enough — the binary is a separate download)

## Commands

```bash
# Fast loop — laptop only, dev server (~14s)
npm run test:e2e

# Full device matrix, dev server (~60s, occasionally flaky — see #5)
npm run test:e2e:devices

# Full device matrix against the REAL BUILD (~35s incl. build) — most reliable
npm run test:e2e:build

# Interactive UI mode
npm run test:e2e:ui

# One device only
E2E_DEVICES=1 npx playwright test --project=mobile-android
```

**Prefer `npm run test:e2e:build` for anything that matters.** It generates the
static site and serves `.output/public`, so there is no on-demand compilation:
full 8-worker concurrency, no flake, and it tests the artifact that actually
deploys. Measured: 180 tests, 3 consecutive runs, 86 passed / 0 failed, ~20s
each. The dev-server matrix at the same scale failed 1–2 tests per run.

## The device matrix

| Project | Metrics | Viewport | Header shown |
|---|---|---|---|
| `laptop` | Desktop Chrome | 1440×900 | Desktop nav |
| `mobile-android` | Pixel 5 | 393×851 | Menu toggle |
| `mobile-ios` | iPhone 13 | 390×844 | Menu toggle |
| `tablet-ipad` | iPad gen 7 | 810×1080 | **Desktop nav** |
| `tablet-ipad-landscape` | iPad gen 7 | 1080×810 | **Desktop nav** |

**iPads get the desktop nav, not the mobile menu.** The breakpoint in
`app/components/layout/SiteHeader.vue` is `max-width: 760px`, and iPad portrait
is 810px wide. The tests assert this deliberately.

## What is covered

- **`homepage.spec.ts`** — loads, `<h1>`, no console errors. Device-agnostic.
- **`responsive.spec.ts`** — correct nav per viewport; mobile menu opens,
  closes on Escape with focus restored, and closes after navigating; **no
  horizontal overflow** on every static page *and* every published project
  page. Runs on all five devices.
- **`project-pages.spec.ts`** — every published case study renders with its
  name in `<h1>` and `<title>`, in-page section anchors all resolve, no
  `target="_blank"` without `rel="noopener"`; the index links every published
  project and none of the unpublished ones; disabled projects return ≥400.
  Laptop only (content does not vary by device).

Slugs derive from `content/projects/*.json` (CLAUDE.md rule 4) via
`tests/e2e/fixtures/projects.ts`, mirroring `nuxt.config.ts`. **Adding a
project JSON file automatically adds its E2E coverage** — and disabling one
automatically asserts it is unreachable.

## Bug this suite has already caught

`/projects/portfolio-site` scrolled sideways by **83px** on both phones. Cause:
`.case-header .container` is a grid whose implicit `auto` track grows to its
items' min-content width, and the project name `chamroeunhongleng.me` is a
single token with no break opportunity — min-content was 456px in a 393px
viewport. Every other project name contains spaces, so only this page failed.

Fixed in `app/pages/projects/[slug].vue` with `grid-template-columns:
minmax(0, 1fr)` plus `overflow-wrap: anywhere` on the `h1`. Note it must be
`anywhere`, not `break-word` — only `anywhere` also shrinks min-content width,
which is what stops the track overflowing.

## Environment gotchas (learned the hard way — do not re-litigate)

**1. Use `127.0.0.1`, never `localhost`.**
Nuxt dev on this machine binds **IPv6 only** (`[::1]:3000`); nothing listens on
IPv4. Node can resolve `localhost` to IPv4 first, so the `webServer` health
check polls a dead address and dies with `Timed out waiting … from
config.webServer`. Symptom: the server clearly works in a browser, but
Playwright still times out waiting for it.

**2. Stale Nuxt locks block runs.**
Both `nuxt dev` and `nuxt build` leave a lock in `.nuxt/` that survives a
killed shell. Symptoms: `Another Nuxt dev server is already running`,
`Another Nuxt build is already running`, or a silent webServer timeout. Fix:
```bash
netstat -ano | grep ":3000.*LISTENING"   # last column is the PID
taskkill //PID <pid> //F                 # double slashes in Git Bash
rm -f .nuxt/*.lock                       # only once the PID is really dead
```
Check the PID is actually dead first — removing a live build's lock leaves an
orphan process burning ~1GB.

**3. Cold starts are slow.** A first Nuxt/Vite dev boot on Windows can exceed
Playwright's 120s default, so `webServer.timeout` is 240s.

**4. Hydration swallows early clicks.**
The header is server-rendered, so the Menu button is clickable *before* Vue
attaches its handler. A click landing in that window is silently lost and the
menu never opens — the failure snapshot shows the button still reading "Menu"
after a "successful" click. `openMobileMenu()` in `responsive.spec.ts` retries,
guarded by `aria-expanded` so it never toggles an open menu shut. **Use that
helper for any interaction with server-rendered controls.**

**5. The dev server stalls under sustained parallel load.**
At ~180 tests, navigations intermittently hang until the 30s test timeout and
die with `net::ERR_ABORTED; maybe frame was detached?` — a *different* route
each run, each passing fine in isolation. Lowering workers 4 → 2 made it
**worse**, and a serial route warm-up (`tests/e2e/global-setup.ts`) reduced but
did not eliminate it. The fix is `npm run test:e2e:build`, which removes the
dev server from the equation entirely.

**6. `reuseExistingServer` can silently test the wrong thing.**
Outside CI, Playwright reuses whatever already listens on port 3000. If a dev
server is running, `npm run test:e2e:build` will quietly test *that* instead of
the build. Free the port first.

**7. Vitest and Playwright must not collide.**
`vitest.config.ts` includes only `tests/**/*.test.ts`; Playwright uses
`tests/e2e/**/*.spec.ts`. Keep the `.spec.ts` suffix for E2E, or `npm run test`
will try to run browser tests in happy-dom.

**8. `nuxt preview` is not a static server.** It expects a nitro server build
and parses `--host` as a positional rootDir. `tests/e2e/static-server.mjs`
serves `.output/public` instead — zero dependencies, binds IPv4, and returns a
real 404 status (which the "unpublished project is unreachable" test needs).

## Known limitation: no real Safari on this machine

WebKit installs but **cannot launch** — Windows reports a missing
`icuuc77.dll`. So `mobile-ios` and the iPad projects run Apple **device
metrics** on the **Chromium** engine. That catches layout and responsive
regressions but **not** Safari engine bugs — and the header uses
`backdrop-filter` and `100dvh`, both historically Safari-divergent.

For true Safari coverage: a real iPhone/iPad, a macOS CI runner, or a hosted
device farm (BrowserStack / Sauce Labs / LambdaTest).

## Writing a test

```typescript
import { test, expect } from '@playwright/test'

test('does the thing', async ({ page }) => {
  await page.goto('/path')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
```

Rules that keep tests honest here:
- **Select by role + accessible name**, not CSS class. The layout has *two*
  `<nav>` landmarks, so bare `locator('nav')` throws a strict-mode violation.
- **Viewport-dependent assertions go in `responsive.spec.ts`.** Keep
  `homepage.spec.ts` device-agnostic or it fails on phones, where the desktop
  nav is correctly hidden.
- **Guard loops against vacuous passes.** A `for` loop over found elements
  reports green when it finds none — assert the collection is non-empty first.
- **Assert content, not just presence.** A visible nav with zero links passes a
  naive visibility check.

## Debugging

1. **Page snapshot** — `test-results/<test>/error-context.md` holds the
   accessibility tree at the moment of failure. Read this first; it is usually
   enough to diagnose without re-running.
2. **Screenshot** — auto-captured on failure in `test-results/`
3. **Trace** — `npx playwright show-trace test-results/*.zip`
4. **Headed** — `npx playwright test --headed`

| Symptom | Cause |
|---|---|
| `Timed out waiting … from config.webServer` | IPv4/IPv6 (#1) or stale lock (#2) |
| `Another Nuxt dev server/build is already running` | Stale lock (#2) |
| `net::ERR_ABORTED; maybe frame was detached?` | Dev server stall (#5) — use `test:e2e:build` |
| Click "succeeds" but nothing happens | Hydration race (#4) |
| `strict mode violation: resolved to N elements` | Selector matches >1 node; use role + name |

## Before each deploy

```bash
npm run test:e2e:build   # all devices, against the real build
npm run verify           # the 12-phase pipeline (includes vitest)
```

## Not yet covered

- **Chat assistant flow** (`api/chat.ts`) — the highest-value remaining gap
- Real Safari/WebKit (blocked, see above)
- Keyboard-only navigation beyond the mobile-menu Escape path
- Colour contrast / automated a11y assertions beyond `npm run check:a11y`
- Visual regression (screenshot diffing)
