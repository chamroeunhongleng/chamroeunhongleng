import { onMounted, ref, type Ref } from 'vue'

export type MotionState = 'unknown' | 'allowed' | 'static'

/**
 * Whether ambient motion (the technology marquee, the mascot float) may run.
 *
 * The same gates as useReveal: prefers-reduced-motion, and navigator.webdriver
 * so Playwright e2e and screenshot runs see a still, deterministic page. The
 * answer arrives after mount — prerendered HTML is identical for everyone and
 * never ships a mid-animation state, so there is nothing to mismatch on
 * hydration. Components render their static layout for 'unknown' and 'static'.
 *
 * Vue APIs are imported explicitly so leaf components using this still mount
 * in vitest without Nuxt.
 */
export function useMotionAllowed(): Ref<MotionState> {
  const state = ref<MotionState>('unknown')

  onMounted(() => {
    const reduced
      = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    state.value = reduced || navigator.webdriver ? 'static' : 'allowed'
  })

  return state
}
