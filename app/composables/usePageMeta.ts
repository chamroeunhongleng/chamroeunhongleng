/**
 * Per-page SEO metadata: title + description, mirrored into Open Graph.
 * Site-wide defaults (og:image, og:type, twitter:card, JSON-LD) live in
 * app.vue; this keeps every page's og:title/og:description in sync.
 */
export function usePageMeta(input: { title: string; description: string }) {
  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description
  })
}
