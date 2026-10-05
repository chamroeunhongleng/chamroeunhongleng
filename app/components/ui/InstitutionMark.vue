<script setup lang="ts">
import { computed } from 'vue'
import { institutionAbbreviation } from '../../utils/institution'

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

const abbreviation = computed(() => institutionAbbreviation(props.institution))
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
