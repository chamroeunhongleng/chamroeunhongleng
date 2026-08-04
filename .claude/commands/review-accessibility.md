---
description: Run the accessibility review — automated basics plus manual pass
---

1. Load the `accessibility` skill — it explains what the automated check covers
   and what needs human judgment.
2. Run `npm run generate` then `npm run check:a11y` and fix every finding.
3. Manual pass (the automated check cannot do these):
   - keyboard-only navigation of every page, including the mobile menu and filters;
   - visible focus on every interactive element;
   - theme toggle announced correctly (`role="switch"` + `aria-checked`);
   - `aria-live` confirmations actually fire (copy email, filter result count);
   - contrast spot-check against the table in the `ui-implementation` skill, both themes;
   - reduced-motion: nothing essential disappears with animations off.
4. Report findings mapped to WCAG criteria where possible, fix, and re-run step 2.
