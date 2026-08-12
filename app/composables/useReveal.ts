// Scroll-reveal, as progressive enhancement only. The prerendered HTML never
// contains a hidden state: elements are hidden (reveal-pending) on the client,
// after hydration, and only when every gate below allows it — so no-JS
// visitors, reduced-motion users, and automated runs (Playwright e2e and
// screenshots set navigator.webdriver) all see the page fully visible.
//
// Motion contract (motion.css): opacity/transform only, 150–250ms, reducible.
export function useReveal(selector = '[data-reveal]') {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (navigator.webdriver) return
    if (!('IntersectionObserver' in window)) return

    const all = Array.from(document.querySelectorAll<HTMLElement>(selector))
    // Anything already on screen at mount stays put — hiding it after paint
    // would flash. Only content below the fold gets the treatment.
    const below = all.filter((el) => el.getBoundingClientRect().top > window.innerHeight)
    if (below.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Elements entering in the same frame stagger by 45ms, capped so a
        // dense batch never keeps late items waiting.
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
