<script setup lang="ts">
import { computed } from 'vue'

/**
 * Typographic stand-in for an institutional logo: the school's abbreviation
 * set in this site's own display face inside a hairline plaque, matching the
 * header monogram.
 *
 * Deliberately NOT the institution's logo. Naming where you study is a fact;
 * reproducing a trademarked mark on a personal site reads as endorsement, and
 * a borrowed-authority graphic would undercut a portfolio whose whole argument
 * is evidence over titles. The plaque gives the visual anchor without either
 * problem — and it renders correctly in both themes.
 *
 * Decorative by design: the full institution name sits beside it in the
 * markup, so screen readers should not spell the abbreviation out twice.
 */
const props = defineProps<{ institution: string }>()

// Words that carry no identity in an institution name.
const MINOR_WORDS = new Set(['of', 'the', 'for', 'and', 'at', 'in'])

const abbreviation = computed(() => {
  // Prefer an abbreviation the content already states: "… (AUPP)".
  const stated = props.institution.match(/\(([A-Za-z]{2,6})\)/)
  if (stated?.[1]) return stated[1].toUpperCase()

  // Otherwise build initials from the significant words of the leading clause,
  // so "Fort Hays State University" reads FHSU.
  const leadClause = props.institution.split(',')[0] ?? props.institution
  return leadClause
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !MINOR_WORDS.has(word.toLowerCase()))
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4)
})
</script>

<template>
  <span class="institution-mark" aria-hidden="true">{{ abbreviation }}</span>
</template>

<style scoped>
.institution-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.9rem;
  height: 2.9rem;
  padding-inline: var(--space-2);
  border: 1.5px solid var(--color-text);
  border-radius: var(--radius-s);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  line-height: 1;
  white-space: nowrap;
}
</style>
