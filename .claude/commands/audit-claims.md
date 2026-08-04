---
description: Adversarial sweep for overstated or unlabeled claims
---

Audit every public claim on the site as a skeptical reader would.

1. Load the `evidence-verification` skill for the label taxonomy and rules.
2. Sweep all of `content/` for:
   - achievement-shaped numbers outside evidence-labeled claims;
   - status or deployment labels stronger than the evidence supports;
   - "Public evidence"/"Repository evidence" labels whose links do not actually
     show what the claim says;
   - demo content that could be mistaken for real work;
   - team results presented as individual work (or vice versa);
   - expertise implied where the positioning says learner (never lawyer,
     legal expert, senior engineer, or ML expert).
3. Run `npm run check:owner-content -- --mode=production` and read every finding.
4. Report: claim → current label → problem → recommended fix. Downgrade labels
   when in doubt; honesty outranks impressiveness here.
