<script setup lang="ts">
usePageMeta({
  title: 'Software Engineering & Applied ML',
  description:
    'Chamroeun Hongleng — software engineering student in Phnom Penh building web and data systems, with applied-ML work in Khmer speech. Interning at Angkor Byte.'
})

// Below-fold cards fade in as they enter the viewport (no-op for no-JS,
// reduced-motion, and automated runs — see useReveal). Child sections mount
// before this page, so every [data-reveal] element exists by then.
useReveal()
</script>

<template>
  <!-- Every section renders content/*.json through app/data/portfolio.ts;
       the order is the homepage narrative (see .claude/skills/portfolio-ia). -->
  <div class="home">
    <HomeHero />
    <HomeAbout />
    <HomeNow />
    <HomeStack />
    <HomeWork />
    <HomeJourney />
    <HomeEducation />
    <HomeContribute />
    <HomeContact />
  </div>
</template>
