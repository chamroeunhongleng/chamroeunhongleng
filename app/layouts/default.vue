<script setup lang="ts">
const mode = usePortfolioMode()
</script>

<template>
  <div class="layout">
    <SkipLink />
    <ModeBanner :mode="mode" />
    <SiteHeader />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
    <MobileDock />
    <ChatWidget />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

main {
  flex: 1;
}

/* Phones: the page ends above the dock, so the last line of the footer is
   never hidden behind it. */
@media (max-width: 760px) {
  .layout {
    padding-bottom: calc(var(--dock-h) + var(--space-5) + env(safe-area-inset-bottom, 0px));
  }
}

@media print {
  .layout {
    padding-bottom: 0;
  }
}
</style>
