---
name: owner-content-replacement
description: Mapping OWNER_INPUT.md answers into content files without inventing anything
---

# Owner-content replacement

## The map
| OWNER_INPUT.md section | Content file · field |
|---|---|
| Identity & headline | `profile.json` · name, preferredName, headline, identity |
| Education | `education.json` · entries (periods, third entry entirely) |
| Interests per pillar | `interests.json` · pillars[].topics, groundedIn |
| Experience & roles | `experience.json` · groups (community group is placeholder) |
| Courses & learning | `learning.json` · disciplines, readingNotes |
| Projects & roles | `content/projects/*.json` · teamContributions, evidence upgrades |
| Contact | `contact.json` · email, responseExpectation |
| Privacy boundaries | remove/adjust anything the owner marks private |

## Method
1. Take answers verbatim from the owner; tighten grammar, never meaning.
2. Missing answer → marker stays. Never fabricate to make a page look finished.
3. Label every replaced claim honestly (see `evidence-verification` skill).
4. Convert relative dates the owner gives into absolute ones.
5. One file at a time, then `npm run check:owner-content` — the marker count
   must only decrease.
6. Contact email and anything the owner flagged private require their explicit
   go-ahead before publishing; those are human gates.

## Done means
`npm run check:owner-content -- --mode=production` reports zero errors for the
replaced sections, and the owner has seen the rendered result in review mode.
