// Explicit Vue imports: leaf components using this must mount in vitest without Nuxt.
import { onMounted, ref, type Ref } from 'vue'

export type MotionState = 'unknown' | 'allowed' | 'static'

// navigator.webdriver is gated too, so Playwright e2e and screenshot runs see a
// still, deterministic page. Decided after mount: prerendered HTML never animates.
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
