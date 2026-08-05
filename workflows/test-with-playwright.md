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
# Default — laptop only, against the real build (~16s incl. build)
npm run test:e2e

# Full device matrix, all seven devices (~41s incl. build)
npm run test:e2e:devices

# Visual review captures
npm run test:e2e:shots

# Interactive UI mode
npm run test:e2e:ui

# Dev server instead of the build — for HMR while editing. Flaky at this test
# count; see gotcha #5. Not the default, for that reason.
npm run test:e2e:dev

# One device only
E2E_DEVICES=1 E2E_BUILD=1 npx playwright test --project=mobile-android
```

**Everything except `test:e2e:dev` generates the site first and serves
`.output/public`.** That costs ~13s and buys total reliability: no on-demand
compilation, full 8-worker concurrency, and it exercises the artifact that
actually deploys. Current: **220 tests across seven devices, 0 failures, ~41s**,
stable across repeated runs. The dev server could not sustain this test count —
see gotcha #5.

## The device matrix

| Project | Metrics | Viewport | Header shown |
|---|---|---|---|
| `laptop` | Desktop Chrome | 1440×900 | Desktop nav |
| `mobile-small` | iPhone SE | 320×568 | Menu toggle |
| `mobile-android-compact` | Galaxy S8 | 360×740 | Menu toggle |
| `mobile-android` | Pixel 5 | 393×851 | Menu toggle |
| `mobile-ios` | iPhone 13 | 390×844 | Menu toggle |
| `tablet-ipad` | iPad gen 7 | 810×1080 | Menu toggle |
| `tablet-ipad-landscape` | iPad gen 7 | 1080×810 | Desktop nav |

**iPad portrait uses the mobile menu.** The breakpoint is `max-width: 820px`,
which is where the desktop header measurably stops fitting on one line — iPad
portrait (810px) falls below it. It used to be 760px; see the bugs below.

## Visual review

```bash
npm run test:e2e:shots
```
Writes `.tmp/screenshots/<device>/` — a full-page shot, an above-the-fold shot,
and (on phone widths) the mobile menu open, for every page and case study.
The fold shots are the ones worth looking at; a full-page phone capture is
15,000px tall and unreadable when scaled.

It also logs page height per device, which is a UX signal in itself. Current
state: case studies run **17–25 phone screens** of scrolling, and `/journey`
hits 27 screens at 320px. Worth knowing before adding more prose.

Captures are clipped when they exceed Chromium's ~16384 **device**-pixel
texture limit (a DPR-2 iPad fails at half the CSS height a DPR-1 laptop
manages), so the spec halves the height until the capture succeeds rather than
assuming a constant.

## What is covered

**220 tests across seven devices.** Device-independent checks run on `laptop`
only; per-device concerns run everywhere.

- **`site.spec.ts`** — every published route: returns 200, has a non-empty
  `<title>` and meta description, has exactly **one** `<h1>`, logs no console
  or page errors, every `<img>` carries an `alt` attribute, and no
  `target="_blank"` lacks `rel="noopener"`. Plus site-wide: every internal link
  resolves (collected across all pages, each checked once), the skip link is the
  first Tab stop and points at a real element, an unknown URL returns 404, and
  the theme toggle changes the document and survives a reload.
- **`chat.spec.ts`** — the assistant, with `POST /api/chat` mocked at the
  network boundary. Panel opens and closes by button and Escape (focus returns
  to the launcher), Send is disabled until something is typed, the input caps at
  the contract's 500 chars, a message round-trips with follow-up chips, starter
  chips send, the local welcome bubble is **never** sent as history, a
  `navigateTo` moves the visitor and offers a one-shot way back, a non-path
  `navigateTo` is ignored rather than followed off-site, and 500 / 429 / network
  failure each produce their intended friendly message with the input still
  usable.
- **`responsive.spec.ts`** — correct nav per viewport, header stays on one line,
  mobile menu opens / closes on Escape with focus restored / closes after
  navigating, and **no horizontal overflow** on every static page *and* every
  published case study. All seven devices.
- **`project-pages.spec.ts`** — every published case study renders its name in
  `<h1>` and `<title>`, in-page section anchors all resolve, external links are
  safe; the index links every published project and none of the unpublished
  ones; disabled projects return ≥400.
- **`homepage.spec.ts`** — loads, `<h1>`, no console errors.

### Why the chat API is mocked

The static build under test has no serverless function, the real endpoint costs
Anthropic credits, and the key is owner-managed (CLAUDE.md rule 6). Mocking also
makes the 500 / 429 / offline paths testable on demand. These tests cover the
**client** contract — that the widget sends what `api/chat.ts` expects and
renders what it returns. The server's own logic is unit-tested in `tests/chat/`.

Routes and slugs derive from `content/projects/*.json` (CLAUDE.md rule 4) via
`tests/e2e/fixtures/`, mirroring `nuxt.config.ts`. **Adding a project JSON file
automatically adds its E2E coverage** — and disabling one automatically asserts
it is unreachable.


## Bugs this suite has already caught

**Header wrapped to two lines on every phone, and on iPad portrait.**
Measured by sweeping the viewport: the row is 64px tall on one line, 102px when
wrapped. With the brand name shown it only fits from 450px up, yet the name was
only hidden below 358px — so 360–449px (i.e. 360, 375, 390, 393, 412, 428: every
common phone) rendered a double-height header. Separately, the desktop header
needs ~815px, but the desktop nav switched on at 761px, so 761–815px — including
iPad portrait at 810px — wrapped with the CV pill and theme toggle pushed onto a
second row. Fixed by moving the two thresholds to where the layout actually
fits (450px and 820px). Guarded by "header stays on one line".

**`/about` scrolled sideways at 320px.** Three nested grids
(`.about-grid`, `.about-side`, `.side-card`) used bare `1fr` or an implicit
track. `Nfr` means `minmax(auto, Nfr)`, and that `auto` floor will not shrink
below content min-content — `.about-side` resolved a 302px track inside its own
280px box. Fixed with `minmax(0, …)` at each level.

**The homepage project rows overflowed at 320px.** `.project-row`'s mobile
override used `4.5rem 1fr auto auto`; the `1fr` auto floor let a long project
name set the track minimum and pushed the status badge and arrow 18px off
screen. Fixed with `minmax(0, 1fr)` plus `min-width: 0; overflow-wrap: anywhere`
on `.row-name` — the track cap does nothing unless the item is also allowed to
shrink past its own min-content.

**The hero caption duplicated the eyebrow.** `index.vue` renders
`{{ profile.name }} · {{ profile.location.text }}` twice — once as the portrait
plate, once as the eyebrow above the `<h1>`. Side by side in two columns that
reads as a photo caption; below 1040px the portrait moves above the text
(`order: -1`) and the same line appears twice in a row. The plate is now hidden
where the columns stack. The photo keeps its alt text, so nothing is lost for
assistive tech.

**This grid pattern is systemic.** Five instances found so far, in four
different files (`[slug].vue`, `about.vue` ×3, `index.vue` ×2). Many components
still use `display: grid` with no `grid-template-columns`, which is the same
latent bug. The rule: **`Nfr` means `minmax(auto, Nfr)`, and that `auto` floor
refuses to shrink below content min-content.** Use `minmax(0, …)` on any track
whose content you do not control, and add `min-width: 0` to the item.

The overflow tests cover every page on every device, so new instances surface as
failures rather than as silent sideways scroll.

## A caution: verify the fix, and revert wrong diagnoses

While fixing the above, a 6px "chat button overflows the viewport" reading led
to a `max-width` + `grid-template-columns` change on `.chat-widget`. That
reading was an artifact of measuring while the page still had 18px of overflow
from the row arrows — the widget was never broken. Worse, the "fix" was a real
regression: `justify-items: end` aligns an item *within its track*, not the
track within the box, so widening the box moved the launcher to the bottom-LEFT
over the `<h1>`. It was caught only by looking at the screenshot afterwards.

Take the screenshot after the fix, not just before.

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

WebKit installs but **cannot launch**. Do not trust the error message, and do
not re-run `npx playwright install webkit` — it reports success while the
browser still cannot start.

**The reported error is a false positive.** `Host system is missing
dependencies! ... icuuc77.dll` is wrong: the DLL is present at
`%LOCALAPPDATA%\ms-playwright\webkit-2336\icuuc77.dll` (1.8 MB, intact, not
blocked), and Playwright's own checker resolves everything:

```bash
cd "$LOCALAPPDATA/ms-playwright/webkit-2336"
"$LOCALAPPDATA/ms-playwright/winldd-1007/PrintDeps.exe" Playwright.exe | grep -i "not found"
# -> nothing missing
```
(Run it from *inside* that directory; from anywhere else it reports every
sibling DLL as missing, which is what makes the original error misleading.)

**The real failure is underneath.** With
`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` the process launches, then exits
~800ms later with `0xC0E90002` before the inspector-pipe handshake, printing no
diagnostic. Ruled out: headless vs headed, working directory, PATH-based DLL
search. Chromium works fine on the same machine. Investigated 2026-08-05,
Playwright 1.62.1 / webkit-2336 / Windows 11 build 26200.

So `mobile-ios` and the iPad projects run Apple **device metrics** on the
**Chromium** engine. That catches layout and responsive regressions but **not**
Safari engine bugs — and the header uses `backdrop-filter` and `100dvh`, both
historically Safari-divergent.

For true Safari coverage: a real iPhone/iPad, a macOS CI runner, or a hosted
device farm (BrowserStack / Sauce Labs / LambdaTest). Untried next step if it
ever becomes worth it: a different Playwright version, since this may be a
build/OS-version regression.

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
npm run test:e2e:devices   # 220 tests, all seven devices, against the real build
npm run verify             # the 12-phase pipeline (includes vitest)
```

## Not yet covered

- **Real Safari/WebKit** — blocked on this machine, see above. The one gap with
  no local workaround.
- **The live chat endpoint.** `chat.spec.ts` mocks the network, so it proves the
  client contract, not that the deployed function answers. A smoke test against
  the real endpoint would need the owner's key and would spend credits
  (CLAUDE.md rule 6) — an owner decision, not an automated one.
- Keyboard-only navigation beyond the skip link and the two Escape paths
- Colour contrast / automated a11y assertions beyond `npm run check:a11y`
- Visual regression (screenshot diffing against a committed baseline)
- **Page length.** Case studies run 17–25 phone screens and `/journey` hits 27
  at 320px. Measured and logged by `test:e2e:shots`, but no test asserts a
  budget — it is a content decision, not a defect.
