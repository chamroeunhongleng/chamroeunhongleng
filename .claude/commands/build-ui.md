---
description: Implement or modify a component or page within the design system
---

Implement the component or page the user names.

1. Load the `ui-implementation` skill — token contract, contrast table, motion rules.
2. Rules that are never negotiable:
   - styling consumes CSS custom properties from `app/assets/css/tokens.css` only;
   - all content prose renders through `<MarkedText>` so placeholder markers stay visible;
   - important claims render through `<ClaimList>`/`<EvidenceLabel>`;
   - semantic HTML with one `h1` per page and no skipped heading levels;
   - both themes must work (check `:root[data-theme='dark']` overrides).
3. Finish with `npm run lint`, `npm run typecheck`, and `npm run test`.
4. If the change affects generated output, also run `npm run generate` and
   `npm run check:a11y`.
