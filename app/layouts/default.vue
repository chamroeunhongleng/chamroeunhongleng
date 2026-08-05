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
</style>
