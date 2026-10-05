<script setup lang="ts">
import { stack } from '~/data/portfolio'
</script>

<template>
  <section id="stack" class="section stack-section" aria-labelledby="stack-title">
    <div class="container">
      <SectionHeading
        id="stack-title"
        eyebrow="Toolbox"
        title="Tools I actually use"
        mark="actually use"
        :text="stack.intro"
      />
      <StackMarquee :groups="stack.groups" data-reveal />
    </div>
  </section>
</template>

<style scoped>
/* A soft arc of sunken paper behind the panel. */
.stack-section {
  position: relative;
  isolation: isolate;
}

.stack-section::before {
  content: '';
  position: absolute;
  inset: 40% 0 0;
  z-index: -1;
  background: radial-gradient(70% 100% at 50% 100%, var(--color-surface-sunken), transparent 70%);
  pointer-events: none;
}
</style>
