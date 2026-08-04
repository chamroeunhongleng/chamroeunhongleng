---
name: seo-review
description: SEO conventions of this site and what npm run check:seo enforces
---

# SEO review

## Conventions
- Per-page `usePageMeta({ title, description })` — mirrors into og:title /
  og:description. The case-study page derives both from project content.
- Site-wide defaults in `app.vue`: og:type, og:site_name, og:image (`/og.png`,
  1200×630), og:url, twitter:card, canonical, JSON-LD Person.
- `titleTemplate` appends "· Chamroeun Hongleng"; descriptions 50–170 chars.
- Sitemap comes from @nuxtjs/sitemap over the prerendered routes; robots.txt
  references it. Routes derive from content — never hand-edit a route list.
- `NUXT_PUBLIC_SITE_URL` drives canonical/OG absolute URLs. The default domain
  is not serving yet; production must set the real URL (the rule engine makes a
  placeholder site URL production-fatal).

## `npm run check:seo` enforces (on generated output)
Unique titles; description presence + length; https canonical; og:title/
description/image/type/url; twitter:card; JSON-LD parses; robots.txt references
sitemap; og.png exists at exactly 1200×630 (reads IHDR bytes); sitemap URL set
equals the derived route set exactly.

## Manual judgment
Do titles/descriptions read like a human wrote them for THIS page? Does the OG
card render well (test with a preview tool)? Is new content reachable within
two clicks of the homepage?
