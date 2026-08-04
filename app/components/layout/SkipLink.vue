<template>
  <a class="skip-link" href="#main">Skip to main content</a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  z-index: 100;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  padding: var(--space-2) var(--space-4);
  border-radius: 0 0 var(--radius-m) var(--radius-m);
  text-decoration: none;
  font-weight: 560;
}

.skip-link:focus-visible {
  top: 0;
}
</style>
