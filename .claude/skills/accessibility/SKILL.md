---
name: accessibility
description: Accessibility patterns for this site and the split between automated and manual checks
---

# Accessibility

## Covered automatically (`npm run check:a11y`, over generated HTML)
`html[lang]`, exactly one `h1`, no skipped heading levels, `img[alt]`,
unique `main` + `nav`/`header`/`footer` landmarks, accessible names on links
and buttons, label association on form controls, duplicate ids, skip link →
`#main`. SPA fallback shells (200.html/404.html) are excluded by design.

## Requires a human every time
Keyboard-only walk (including mobile menu, filters, theme toggle), visible
focus everywhere, logical focus order, `aria-live` regions actually announcing
(copy-email confirmation, filter result count), contrast spot-checks in BOTH
themes, reduced-motion sanity, zoom to 200%.

## Patterns already in place — preserve them
- Skip link is the first focusable element (`SkipLink.vue`).
- Theme toggle is `role="switch"` + `aria-checked` + `aria-label`.
- Filter chips use `aria-pressed`; result count is `role="status" aria-live="polite"`.
- Nav marks the active page with `aria-current="page"`.
- Decorative arrows/icons are `aria-hidden`; evidence-link suffixes have
  visually-hidden expansions.
- `[id]` elements have `scroll-margin-top` so the sticky header never hides
  an anchor target.
- `prefers-reduced-motion` reset lives at the end of `motion.css`.
