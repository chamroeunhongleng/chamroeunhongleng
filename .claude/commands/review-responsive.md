---
description: Review responsive behavior across breakpoints
---

Run a responsive review of the page(s) the user names (default: all).

1. Start `npm run dev` and inspect at 360px, 760px, 1040px, and 1440px —
   the design system's breakpoints are 760 and 1040.
2. Use the responsive section of `docs/ui-review-checklist.md` as the checklist:
   no horizontal scroll, readable line lengths, tap targets, mobile nav behavior,
   grids collapsing in the intended order, sticky elements not covering content.
3. Report findings as file + selector + what breaks at which width; fix only after
   listing them, and re-check both themes after fixing.
