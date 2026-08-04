---
name: case-study-development
description: The 28-field case-study method — claim, argument, evidence
---

# Case-study development

## Shape
Every case study is an assurance case: state what the project demonstrates
(the `question` is its falsifiable form), argue it through architecture and
decisions, prove it with labeled evidence. Headings on the page are claims
("What I actually did"), not nouns ("Overview").

## The 28 fields
All fields in `shared/schemas/project.ts` are required — the schema enforces it.
Guidance for the ones people fudge:
- `exactRole` vs `teamContributions`: personal scope and team credit are
  SEPARATE fields; never absorb the team's work into "I".
- `status` + `deployment`: two independent axes. A runnable public repo on
  synthetic data is `Public demo`, not Production. Idea/Research/Experiment
  can never be `Deployed` (schema-enforced).
- `evidence`/`results`/`completedWork`: arrays of Claims — every entry carries
  an evidence label. Self-reported numbers must SAY they are self-reported in
  the claim text, with the label matching where the number lives
  (e.g. Repository evidence for a metric printed in a repo README).
- `limitations`: constraints are imposed, tradeoffs are chosen — different lists.
- `humanApprovalPoints`: at least one, always; where do humans stay accountable?
- Numbers live ONLY inside labeled claims. The rule engine flags
  achievement-shaped numbers in prose.

## Work states
Completed · Demonstrated · Tested · Planned · Unverified · Private — on
`completedWork` items and learning experiments. Planned work is publishable;
mislabeled work is not.

## Demo case studies
`demo: true`, `[DEMO]` markers on the fields a skimmer might mistake for real,
at least one `Demo only` evidence claim stating outright that it is a
demonstration. Production mode refuses to build while one is enabled.
