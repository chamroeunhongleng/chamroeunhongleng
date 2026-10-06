<script setup lang="ts">
usePageMeta({
  title: 'Software Engineering & Applied ML',
  description:
    'Chamroeun Hongleng — software engineering student in Phnom Penh building web and data systems, with applied-ML work in Khmer speech. Interning at Angkor Byte.'
})

// Child sections mount before this page, so every [data-reveal] element exists by now.
useReveal()
</script>

<template>
  <!-- Section order is the homepage narrative defined in .claude/skills/portfolio-ia. -->
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
