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
- [ ] Hero: name in display type, verbatim headline, CTAs, portrait with location
      pill; no numbers strip (removed 2026-10-05)
- [ ] Header: one line at 821–1040px with all six links; round GitHub, theme, and
      menu buttons have names
- [ ] About shows the verbatim intro + identity line; three principle cards
- [ ] Now: availability pill; Now cards are dated with their evidence word
- [ ] Mascot opens the site assistant; the hero stamp and the mascot are still
      under reduced motion; handwritten notes read cleanly in both themes
- [ ] Phone (≤760px): the dock sits beside the chat button and both take taps;
      the header scrolls away; card groups swipe sideways with the next card
      peeking in
- [ ] Technologies: marquee pauses on hover and wraps still under reduced motion;
      every chip has a name, icons only where a real mark exists
- [ ] Selected work: status AND deployment badges on every card; arrows scroll one
      card; the square button opens the live site or repository
- [ ] Journey timeline, education cards, contribution cards, contact form — the
      availability sentence appears once on the page

## Projects + case studies
- [ ] Pillar filter, status filter, and search work together; result count announces
- [ ] Empty state appears for impossible filter combos
- [ ] Case study: sticky section nav jumps correctly; anchors not hidden by header
- [ ] All 28 fields render; limitations split into Constraints / Tradeoffs
- [ ] Demo case study is unmistakably labeled (dashed card, Demo chips, Demo-only labels)
- [ ] Governance demo renders its model-card artifact as a table
- [ ] Repository tree draws correct connectors, aligns its notes column, scrolls in place, and takes keyboard focus
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
