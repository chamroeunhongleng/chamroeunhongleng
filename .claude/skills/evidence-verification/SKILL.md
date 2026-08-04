---
name: evidence-verification
description: The evidence-label taxonomy and the rules that keep claims honest
---

# Evidence verification

## The eight labels
| Label | Means | A visitor can… |
|---|---|---|
| Public evidence | Verifiable on a public page (profile, org, event) | click and confirm |
| Repository evidence | Verifiable in a public repository | read the code/README |
| Document evidence | Backed by a document (certificate, report) | be shown it on request |
| Owner confirmed | Stated by the owner, no public artifact | trust the owner |
| Demo only | Demonstration content, not real work | treat as illustrative |
| Planned | Intended future work | expect, not assume |
| Unverified | Stated but not yet confirmed by anyone | discount it |
| Private | Real but cannot be shown | accept the boundary |

## Rules
1. Never invent qualifications, education, employment, projects, users, revenue,
   customers, partnerships, awards, model performance, deployments, research
   results, or ownership. A gap keeps its marker; it is never filled with fiction.
2. A label must not be stronger than its receipt. A metric that only exists in
   the owner's own README is Repository evidence WITH self-reported framing in
   the claim text — the ~86k-samples figure and the hackathon Top 2 are
   Owner confirmed until a public artifact exists.
3. Achievement-shaped numbers (%, $, users, tests, samples, interviews) live
   only inside labeled Claims. The rule engine enforces this in production.
4. Upgrades require receipts: Owner confirmed → Document evidence needs the
   actual document; → Public evidence needs a URL that shows the claim.
5. Private work is disclosed as Private, never dressed up or hidden.

## Verification levers
`npm run check:owner-content -- --mode=production` (full strictness),
`npm run check:content` (schema), the `/audit-claims` command (adversarial sweep).
