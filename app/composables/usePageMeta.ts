export function usePageMeta(input: { title: string; description: string }) {
  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description
  })
}
