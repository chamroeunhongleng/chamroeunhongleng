# CV variants

Print-ready A4 CV sources, tailored per application type. All three share the
same design system and the same underlying facts as the site content — keep
metrics and claims in sync with `content/*.json` when either changes.

| File | Use for | Leads with |
| --- | --- | --- |
| [`cv-software-dev.html`](./cv-software-dev.html) | Software developer roles | PhsarOS, the site's own build, engineering practice |
| [`cv-general.html`](./cv-general.html) | General applications | Balanced view of all three projects |
| [`cv-ml-research.html`](./cv-ml-research.html) | Applied-ML / research internships | Kaskor ASR metrics, research practice |
| [`cv-product-business.html`](./cv-product-business.html) | Product / business analysis internships | OrderLoop field work, hackathon result |

`cv-software-dev.html` is the internship CV: an availability line under the
contact block, then shipped software, applied ML, and the three degrees. It
carries **no** awards, mathematics publications, field-research or hackathon
material, or scholarships — the site is linked for anyone who wants the depth.
It follows the design system of `scripts/cv/cv.html` rather than the three older
variants, and it is tuned to fill exactly one A4 page (currently ~98% of the
page box): adding a bullet overflows it onto a second, so check the print
preview's page count after any edit.

## Export to PDF

Open the file in Chrome/Edge → `Ctrl+P` → "Save as PDF" → Margins: **None** →
enable **Background graphics**. (An on-page hint repeats this; it does not print.)

## Relation to the site's CV

The PDF served on the live site (`public/cv/chamroeun-hongleng.pdf`) is rendered
from a separate template, `scripts/cv/cv.html`, via `node scripts/cv/render.mjs`.
That template is the public default; the variants here are for direct,
per-application submissions.

## History

`docs/cv-source.html` was the previous-generation CV source; it was superseded
by `scripts/cv/cv.html` and these variants, and removed on 2026-08-05 (it
remains available in git history).
