// Progressive enhancement only: the prerendered HTML never contains a hidden state,
// and reduced-motion users and automated runs (navigator.webdriver) see everything.
export function useReveal(selector = '[data-reveal]') {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (navigator.webdriver) return
    if (!('IntersectionObserver' in window)) return

    const all = Array.from(document.querySelectorAll<HTMLElement>(selector))
    // Hiding anything already on screen after paint would flash.
    const below = all.filter((el) => el.getBoundingClientRect().top > window.innerHeight)
    if (below.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // The stagger is capped so a dense batch never keeps late items waiting.
        let order = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          el.style.transitionDelay = `${Math.min(order * 45, 180)}ms`
          el.classList.add('reveal-in')
          observer.unobserve(el)
          order += 1
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )

    for (const el of below) {
      el.classList.add('reveal-pending')
      observer.observe(el)
    }

    onBeforeUnmount(() => observer.disconnect())
  })
}
