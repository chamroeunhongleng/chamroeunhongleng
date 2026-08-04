# UI review checklist

Work through this against `npm run dev` or a preview URL. Check both themes
for every item (toggle in the header).

## Every page (Home, Projects, 6 case studies, Journey, Learning, About, Contact, Colophon, 404)
- [ ] Renders without console errors; no layout shift after load
- [ ] Light AND dark theme: readable, no unstyled patches, no invisible text
- [ ] 360px, 760px, 1040px, 1440px: no horizontal scroll, grids collapse sensibly
- [ ] Keyboard only: every interactive element reachable, visible focus, logical order
- [ ] Placeholder chips (Owner input required / Placeholder / Demo) render as
      chips — never raw `[BRACKET]` text

## Home
- [ ] Hero shows the verbatim intro + hero statement; identity line reads as a clause
- [ ] Pillar band reads as one connected system (numbered 01–04)
- [ ] Featured grid shows status AND deployment badges on every card
- [ ] "Now" entries are dated; process timeline marks the three human gates
- [ ] Evidence strip: every claim has a visible label; links open the receipts

## Projects + case studies
- [ ] Pillar filter, status filter, and search work together; result count announces
- [ ] Empty state appears for impossible filter combos
- [ ] Case study: sticky section nav jumps correctly; anchors not hidden by header
- [ ] All 28 fields render; limitations split into Constraints / Tradeoffs
- [ ] Demo case study is unmistakably labeled (dashed card, Demo chips, Demo-only labels)
- [ ] Governance demo renders its model-card artifact as a table
- [ ] Next-project link cycles; 404 for `/projects/nonexistent`

## Journey / Learning / About / Contact / Colophon
- [ ] Journey groups render in their layouts (timeline / rows / cards); current roles marked
- [ ] Learning: experiments link to case studies; roadmap items all read as Planned
- [ ] About: education entries show evidence labels; "what I am not" section present
- [ ] Contact: with unconfirmed email, GitHub fallback shows (no broken mailto);
      copy button announces via screen reader when email is live
- [ ] Colophon: AI policy columns render; note-for-agents block present

## Print / misc
- [ ] Reduced motion (OS setting): nothing essential disappears
- [ ] Zoom 200%: content reflows, nothing clipped
- [ ] Favicon + OG image correct (paste a URL into an OG preview tool)
