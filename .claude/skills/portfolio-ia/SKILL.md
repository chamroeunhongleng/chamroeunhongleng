---
name: portfolio-ia
description: The portfolio's information architecture and the rules that hold it together
---

# Portfolio information architecture

## Pages
Home · Projects (+ `/projects/<slug>` case studies) · Journey · Learning ·
About · Contact · CV · Colophon.
Header nav (six items, the most one line holds): Projects · Now (`/#now`) ·
About · Journey · CV · Contact. The footer lists every page, Learning included;
the colophon sits in the footer meta line. On phones (760px and below) a bottom
dock carries Home · Projects · About · Contact and the header scrolls away.

## Homepage narrative arc (owner decision 2026-09-14, after studying kavatana.me)
1. **Hero** — eyebrow, name in display type with the mascot (a button that
   opens the assistant), role line, the owner-approved headline verbatim, CTAs
   (work · CV · email), and the portrait with a location pill and a stamp
   naming the current role. Profile links show on phones only; on phones the
   portrait becomes a profile row that leads the hero. No numbers strip: the
   owner had the three hero metrics (CER, tests, hackathon placing) removed on
   2026-10-05 — the same facts stay in the case studies and `proofPoints`.
2. **About** (`#about`) — the verbatim intro and identity line, a pull-quote of
   the opening of `experience.story` (quoted, never rewritten, linking to
   /journey), then three working principles (`#process`) and the four-pillar
   sentence.
3. **Now** (`#now`) — the availability statement and the dated Now entries as
   cards. (An interactive map sat here briefly; the owner had it removed on
   2026-10-05 — do not bring it back without asking.)
4. **Technologies** (`#stack`) — three marquee rows from `content/stack.json`;
   every item traces to a project's tags or the About skills list.
5. **Selected work** (`#work`) — featured projects, flagship first, in a
   scroll-snap row; both honesty labels on every card.
6. **Journey** (`#journey`) — current roles, the competition, and community work
   on a timeline rail; the full record stays on /journey.
7. **Education** (`#education`) — three degree cards; no logos, no status chips,
   no graduation years.
8. **What I can contribute** (`#contribute`) — `content/contributions.json`,
   each point an evidence-labeled claim.
9. **Contact** (`#contact`) — the shared `ContactForm` and a three-step "what
   happens next".

This supersedes the 2026-08-05 HR trim for the sections the owner asked to bring
back: the technology/skills section, focus cards, contribution cards, and the
contact form. Still out, unless the owner asks again: the selected-evidence
ClaimList and a free-standing "direction" section. A sentence appears once on
the page — the `profile.availability` sentence lives in Now only (the hero
stamp and the phone label carry a shorter form of it).

Since September 2026 the owner is a Software Engineering Intern at Angkor Byte
and is **not looking** for a role (owner decision 2026-10-05). The site no
longer says "open to internships" anywhere — hero, Now, contact, meta
description, or share image. Do not bring that message back, and do not add
detail about the Angkor Byte work (products, clients, repositories) beyond
what he has stated: the title, the start month, and the tools (GitHub, GitLab,
AWS).

Section headings are conversational and first person ("A bit about me", "What
I'm up to these days", "Tools I actually use", "What I've been building", "How
I got here", "Where I'm studying", "How I can help", "Say hello") — owner
request 2026-10-05 for a more human voice. Keep them modest: no slogans.

## Non-negotiable rules
1. The intro paragraphs and the hero statement keep their approved meaning.
2. The four pillars always read as ONE system: CS/ITM degree grounds 01–02,
   international business + contracts/terms work grounds 03–04. Every project
   maps to at least one pillar via `pillars[]`.
3. Positioning is learner-honest: never lawyer, legal expert, senior engineer,
   or ML expert.
4. Two-axis honesty: lifecycle `status` and `deployment` reality are separate
   labels, rendered separately, everywhere a project appears.
5. Content lives in `content/*.json` validated by `shared/schemas/`; pages
   consume `app/data/portfolio.ts`. No content in components.
6. Routes derive from content (nuxt.config reads `content/projects/`);
   never hardcode a route list.
7. Homepage anchors that the header, in-page buttons, or the chat assistant
   (`shared/chat/navigation.ts`) point at — `#now`, `#process`, `#stack`,
   `#work`, `#contact` — are contracts: rename them in the same change as every
   pointer, or `check:links` fails.
