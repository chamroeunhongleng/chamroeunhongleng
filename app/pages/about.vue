<script setup lang="ts">
import { contact, contributions, education, interests, profile } from '~/data/portfolio'

usePageMeta({
  title: 'About',
  description:
    'Who Chamroeun Hongleng is: a dual-degree student connecting AI, software, business, and governance — and honest about what that means.'
})
</script>

<template>
  <div class="about-page section">
    <div class="container">
      <SectionHeading
        as="h1"
        eyebrow="About"
        title="How I ended up working across four fields"
        text="The story behind the projects — from mathematics competitions in Kampong Cham to speech models for Khmer."
      />

      <div class="about-grid">
        <div class="about-main prose">
          <h2>From mathematics to computer science</h2>
          <p>
            I grew up in Kampong Cham and started with mathematics competitions: first in my
            province in Grade 9, national runner-up in Grade 12, and four full university
            scholarships when I left school. They taught me the habit this site is built on: an
            answer only counts when you can show that it is right.
          </p>
          <p>
            I use the same habit in my projects. I work on Khmer speech recognition because the
            language I grew up speaking barely exists in everyday tools, and on agritech because
            the bok choy farmers our team interviewed in Kang Meas plant their fields without
            knowing who will buy the harvest. In both, careful testing matters more than an
            impressive demo.
          </p>
          <p><MarkedText :text="profile.identity" /></p>
          <p>
            <NuxtLink to="/journey" class="pill">Read the full journey <Glyph name="arrow-right" /></NuxtLink>
          </p>

          <h2>Why these interests connect</h2>
          <p><MarkedText :text="interests.connection" /></p>
          <p>
            In practice, each project gets three questions instead of one: does the model work,
            would anyone pay for it, and what do the contracts, terms, and policies allow it to do?
            The projects here are student-scale attempts to answer all three, labeled honestly.
          </p>

          <h2>What I can contribute</h2>
          <!-- content/contributions.json — shared with the homepage and the chat assistant. -->
          <ul class="skills-list" role="list">
            <li v-for="item in contributions.items" :key="item.title">
              <strong>{{ item.title }}</strong> — <MarkedText :text="item.text" />
              <EvidenceLabel :evidence="item.evidence" :link="item.link" />
            </li>
          </ul>

          <h2>Skills</h2>
          <ul class="skills-grid" role="list">
            <li>
              <strong>Software</strong> — TypeScript, Vue/Nuxt, Next.js, Python, unit testing and
              CI, schema-validated content architectures, and AI-native development: leading
              coding agents with explicit human review gates. Current tooling: GitHub, GitLab,
              and AWS.
            </li>
            <li>
              <strong>Machine learning</strong> — PyTorch, Hugging Face Transformers, Whisper
              fine-tuning, CER/WER evaluation design, dataset and manifest discipline; currently
              studying classic ML fundamentals and C++.
            </li>
            <li>
              <strong>Product &amp; business</strong> — structured field research, buyer-first
              validation, bilingual English/Khmer product design, digital marketing and
              short-form technical video (CapCut).
            </li>
            <li>
              <strong>Languages</strong> — Khmer (native), English (professional working).
            </li>
          </ul>

          <h2>How I work with AI</h2>
          <p><MarkedText :text="profile.aiWorkingStyle" /></p>
          <p>
            The full policy — what AI assists with and what stays human — lives on the
            <NuxtLink to="/colophon">colophon page</NuxtLink>.
          </p>
        </div>

        <aside class="about-side">
          <figure class="portrait">
            <img
              v-if="profile.photo"
              :src="profile.photo.src"
              :alt="profile.photo.alt"
              class="portrait-img"
              width="480"
              height="560"
            >
            <div v-else class="portrait-placeholder" aria-hidden="true">
              <span class="portrait-monogram">{{ profile.monogram }}</span>
            </div>
            <figcaption class="portrait-caption mono">
              <template v-if="profile.photo && profile.photo.caption">{{ profile.photo.caption }}</template>
              <template v-else-if="profile.photo">{{ profile.name }} · {{ profile.location.text }}</template>
              <MarkedText v-else text="[OWNER_INPUT_REQUIRED: Add your portrait — drop a photo at public/images/profile.jpg]" />
            </figcaption>
          </figure>

          <section class="side-card" aria-labelledby="education-title">
            <h2 id="education-title">Education</h2>
            <p class="side-summary"><MarkedText :text="education.summary" /></p>
            <ul role="list" class="education-list">
              <li v-for="entry in education.entries" :key="entry.program" class="education-entry">
                <InstitutionMark :institution="entry.institution" class="edu-mark" />
                <div class="edu-body">
                  <p class="edu-program">
                    <MarkedText :text="`${entry.credential} in ${entry.program}`" />
                  </p>
                  <p class="edu-institution"><MarkedText :text="entry.institution" /></p>
                  <p v-if="entry.specialization" class="edu-specialization">
                    <MarkedText :text="entry.specialization" />
                  </p>
                  <p v-if="entry.scholarship" class="edu-scholarship">
                    <MarkedText :text="entry.scholarship" />
                  </p>
                  <p class="edu-meta mono">
                    <MarkedText :text="entry.period" />
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section class="side-card" aria-labelledby="links-title">
            <h2 id="links-title">Profiles</h2>
            <ul role="list" class="profile-links">
              <li v-for="link in profile.links" :key="link.url">
                <SocialProfileLink :label="link.label" :url="link.url" icon-only />
              </li>
            </ul>
            <p class="side-email-line">
              <a :href="`mailto:${contact.email}`" class="mono">{{ contact.email }}</a>
            </p>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-grid {
  display: grid;
  /* minmax(0, …) rather than a bare 3fr/2fr: `Nfr` means `minmax(auto, Nfr)`,
     and that `auto` floor refuses to shrink below the content's min-content
     width — so one long token inside can push the track wider than the page.
     See the stacked rule below, where it was doing exactly that. */
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--space-10);
  align-items: start;
}

.about-main h2 {
  margin-top: var(--space-10);
  font-size: var(--text-3xl);
}

.about-main h2:first-child {
  margin-top: 0;
}

/* What I can contribute — a dash list, each point with its receipt. */
.skills-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-4);
}

.skills-list li {
  position: relative;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  padding-inline-start: var(--space-5);
  max-width: var(--prose-max);
}

.skills-list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-accent-2);
}

.skills-list strong,
.skills-grid strong {
  color: var(--color-text);
}

/* Skills — four cards, the group name leading each. */
.skills-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.skills-grid li {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--space-5);
}

.skills-grid strong {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-base);
}

@media (max-width: 760px) {
  .skills-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.about-side {
  display: grid;
  /* An implicit grid track is auto-sized, and `auto` will not shrink below its
     items' min-content — so .side-card's padding + border + content floor
     (302px) pushed this track past its own 280px box on a 320px phone. */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
  position: sticky;
  top: 5.5rem;
}

/* Portrait — editorial frame: hairline border, warm mat, mono caption */
.portrait {
  margin: 0;
  display: grid;
  gap: var(--space-3);
}

.portrait-img,
.portrait-placeholder {
  width: 100%;
  aspect-ratio: 6 / 7;
  object-fit: cover;
  border-radius: var(--radius-hero);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-raised);
}

.portrait-placeholder {
  display: grid;
  place-items: center;
  background:
    linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-sunken) 100%);
  border-style: dashed;
  box-shadow: none;
}

.portrait-monogram {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 600;
  color: var(--color-border-strong);
}

.portrait-caption {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.side-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  padding: var(--space-5);
  display: grid;
  /* Same reason as .about-side — the implicit auto track must be allowed to
     shrink, or long content inside the card widens the card itself. */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

.side-card h2 {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: var(--tracking-eyebrow);
  font-weight: var(--weight-strong);
  color: var(--color-accent);
}

.side-summary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* 18px tall otherwise, and it is how a recruiter reaches him from this page.
   Inline padding grows the hit box without changing the card's spacing —
   same treatment as .footer-email. */
@media (pointer: coarse) {
  .side-email-line a {
    padding-block: 0.85rem;
  }
}

.education-list {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Institution plaque beside the degree, in place of a school logo. */
.education-entry {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-3);
  align-items: start;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.edu-mark {
  margin-top: 0.1rem;
}

.edu-body {
  display: grid;
  gap: var(--space-1);
  justify-items: start;
  min-width: 0;
}

.edu-program {
  font-weight: 620;
}

.edu-institution {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Named major inside a programme — accented so it reads as a track, not
   a second institution line. */
.edu-specialization {
  font-size: var(--text-sm);
  color: var(--color-accent-2);
}

/* The funding award is the strongest signal in this card — a school chose to
   pay for the place — so it carries the accent and the only added weight. */
.edu-scholarship {
  font-size: var(--text-sm);
  font-weight: 560;
  color: var(--color-accent);
}

.edu-meta {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.profile-links {
  display: flex;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 1040px) {
  .about-grid {
    /* minmax(0, 1fr), not 1fr — stacked at 320px the auto floor let content
       force the column to 302px inside a 280px container, scrolling the page
       sideways by 2px. */
    grid-template-columns: minmax(0, 1fr);
  }

  .about-side {
    position: static;
  }

  /* Stacked, the aside spans the full width — the portrait must not follow it
     up to a 950px-wide headshot on an iPad. */
  .portrait {
    max-width: 20rem;
  }
}
</style>
