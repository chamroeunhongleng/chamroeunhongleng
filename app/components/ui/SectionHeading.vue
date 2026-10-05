<script setup lang="ts">
import { computed } from 'vue'
import MarkedText from './MarkedText.vue'
import Scribble from './Scribble.vue'

/**
 * Section heading: a mono eyebrow over a bold heading, with the supporting
 * paragraph (and anything in the `aside` slot, such as a call to action) in a
 * right-hand column on wide screens. The `below` slot sits under the heading
 * in the left column.
 *
 * Pass as="h1" for the page-level heading so every page has exactly one h1
 * with no skipped levels below it. layout="stack" keeps the paragraph under
 * the heading — for headings followed directly by a form or a long list.
 *
 * `mark` underlines one phrase of the title with a pen stroke. It must be an
 * exact substring; when it is not found the title renders plain.
 */
const props = withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    text?: string
    as?: 'h1' | 'h2'
    id?: string
    layout?: 'split' | 'stack'
    mark?: string
  }>(),
  { text: undefined, as: 'h2', id: undefined, layout: 'split', mark: undefined }
)

const parts = computed(() => {
  if (!props.mark) return null
  const at = props.title.indexOf(props.mark)
  if (at < 0) return null
  return {
    before: props.title.slice(0, at),
    mark: props.mark,
    after: props.title.slice(at + props.mark.length)
  }
})
</script>

<template>
  <header
    class="section-head section-heading"
    :data-layout="text || $slots.aside ? layout : 'stack'"
    :data-level="as"
  >
    <div class="section-head-title">
      <p class="eyebrow">{{ eyebrow }}</p>
      <component :is="as" :id="id" class="heading-title">
        <template v-if="parts">{{ parts.before }}<span class="heading-mark">{{ parts.mark }}<Scribble variant="underline" /></span>{{ parts.after }}</template>
        <MarkedText v-else :text="title" />
      </component>
      <slot name="below" />
    </div>
    <div v-if="text || $slots.aside" class="section-head-aside">
      <p v-if="text" class="lede"><MarkedText :text="text" /></p>
      <slot name="aside" />
    </div>
  </header>
</template>

<style scoped>
/* The underlined phrase stays on one line so the stroke never breaks, and
   forms its own stacking context so the stroke can sit behind the letters. */
.heading-mark {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  isolation: isolate;
}

.heading-mark .scribble {
  position: absolute;
  left: -2%;
  bottom: -0.2em;
  z-index: -1;
  width: 104%;
  height: 0.34em;
  color: var(--color-accent-2);
  --scribble-width: 3px;
}
</style>
