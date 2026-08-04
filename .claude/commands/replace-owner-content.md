---
description: Replace placeholder content with owner-provided answers from OWNER_INPUT.md
---

Replace placeholders with the owner's real answers.

1. Load the `owner-content-replacement` skill — it maps every OWNER_INPUT.md
   question to its content file and field.
2. Only use information the owner actually provided. Never invent facts,
   dates, institutions, results, or credentials to fill a gap — if an answer
   is missing, the marker stays.
3. When replacing a claim, set the honest evidence label: `Owner confirmed`
   unless there is a public URL (`Public evidence` / `Repository evidence`)
   or a document (`Document evidence`).
4. Remove the corresponding `[OWNER_INPUT_REQUIRED: …]` marker only when the
   field is genuinely complete.
5. After each file: `npm run check:owner-content`. Before claiming completion:
   `npm run verify`. The remaining-marker count should only ever go down.
