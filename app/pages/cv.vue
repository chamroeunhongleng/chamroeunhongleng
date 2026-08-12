<script setup lang="ts">
/**
 * The CV — one source, two outputs.
 *
 * On screen this is a responsive page styled from the design tokens through
 * Tailwind utilities. In print it is the A4 document that scripts/cv/render.mjs
 * turns into public/cv/chamroeun-hongleng.pdf: the @media print block below
 * restores the exact pt/mm geometry the standalone template used, so the PDF
 * did not change when the template became a page.
 *
 * Content is deliberately literal here rather than in content/*.json — a CV is
 * one document with one shape, and every line already appears on the site under
 * its own evidence label. See app/pages/about.vue for the same precedent.
 */
interface CvEntry {
  title: string
  sub?: string
  dates: string
  points: string[]
}

usePageMeta({
  title: 'CV',
  description:
    'Curriculum vitae of Chamroeun Hongleng — computer science and IT management student in Phnom Penh: education, projects, experience, and awards.'
})

const education: CvEntry[] = [
  {
    title: 'American University of Phnom Penh',
    sub: '— B.S. Information Technology Management',
    dates: 'Oct 2025 — present',
    points: [
      "100% bachelor's-degree scholarship as second-place laureate in mathematics (rector-signed certificate, 30 Apr 2025)."
    ]
  },
  {
    title: 'Fort Hays State University',
    sub: '— B.S. Computer Science',
    dates: 'Oct 2025 — present',
    points: ['Studied through the accredited AUPP–FHSU dual-degree partnership, alongside the ITM degree.']
  },
  {
    title: 'Institute of Foreign Languages, RUPP',
    sub: '— B.A. English for Work Skills',
    dates: 'Jan 2026 — present',
    points: [
      "100% four-year scholarship from Cambodia's Ministry of Justice on a Grade A national Bac II result (2025) — one of twenty named recipients.",
      'Declared direction: English for International Business major (Year IV).'
    ]
  }
]

const projects: CvEntry[] = [
  {
    title: 'Kaskor ASR',
    sub: '— Khmer speech recognition (sole builder · public repo + weights)',
    dates: '2026 — present',
    points: [
      'Public Whisper-small fine-tuning pipeline for Khmer: 11 scripts from raw-audio inspection through training, evaluation, export, and a pip-installable transcription CLI (raw audio private).',
      "Best checkpoint 3.74% character error rate on the project's validation split (self-reported; 86,550 training samples, stratified by speaker, so the same voices appear in every split and the figure does not estimate accuracy on a new speaker).",
      "Corrected that number down from a published 17.48% after tracing it to a 225-token decode cap that had been truncating the model's own output during evaluation; the correction is documented in the repository rather than quietly swapped.",
      'Evaluation designed around Khmer script: character-level metrics, because space-free script makes word-level ones misleading. Weights public on Hugging Face.'
    ]
  },
  {
    title: 'PhsarOS',
    sub: '— operations platform for Cambodian SMEs (deployed)',
    dates: '2026 — present',
    points: [
      'Point of sale, inventory, customers, and expenses on one screen for small shops, cafés, and restaurants — multi-tenant Next.js, Prisma, Postgres.'
    ]
  },
  {
    title: 'Chomkar Decision Grid',
    sub: '— auditable farm-lot decision engine (public repo)',
    dates: '2026 — present',
    points: [
      'Deterministic engine assembling smallholder farm lots with human-approval gates: 62 unit tests, CI, bilingual Khmer/English audit reports — synthetic data by design.'
    ]
  },
  {
    title: 'Chomkar OrderLoop',
    sub: '— buyer-first agritech coordination (team project)',
    dates: '2026 — present',
    points: [
      'Runner-Up (Top 2), Turing Hackathon Cycle 10 (Techo Startup Center), Market Access for Farmers track.',
      'Ran the interview design and analysis for structured field research with ~30 bok choy farmers in Kang Meas, Kampong Cham; next step is one documented recurring-buyer pilot.'
    ]
  },
  {
    title: 'Bilingual LMS',
    sub: '— learning management walkthrough prototype (sole builder)',
    dates: '2026',
    points: [
      'English/Khmer course delivery, assessment, and academic analytics across teacher, student, and administrator roles — deployed as a public clickable prototype on sample data.'
    ]
  }
]

const experience: CvEntry[] = [
  {
    title: 'CHNAI LAB',
    sub: '— Technology strategy & business',
    dates: '2026 — present',
    points: [
      'Product direction, applied-ML planning, field validation, and evidence standards in a six-member student studio, working most closely with one teammate on Cambodia-first product experiments.'
    ]
  },
  {
    title: 'FounderOS Professional Circle',
    sub: '— Lead',
    dates: 'Jul 2026 — present',
    points: [
      'Lead a professional reading circle governed by a 42-page handbook I wrote and maintain — constitution, reading method, AI-use policy, working templates, and a twelve-month pipeline. Leadership rotates through weekly offices; progress is measured by member output, not pages read.'
    ]
  },
  {
    title: 'Bilingual mathematics titles',
    sub: '— Author & editor, CHNAI LAB · Phnom Penh',
    dates: '2026',
    points: [
      'Wrote and self-published six bilingual English–Khmer mathematics titles (First Editions, ~1,780 pages): Grade 6 and Grade 7 sets of a dictionary, an exercise book (595 and 572 original questions), and full worked-solution answer books.'
    ]
  },
  {
    title: 'CIMOC 2025',
    sub: '— Volunteer, competition organization & examination writing',
    dates: '2025',
    points: ['Organized the national final at SCIA Phnom Penh and wrote the Grade 11 examination paper.']
  }
]

const awards: string[] = [
  'National runner-up in mathematics, Ministry of Education national examination (2025); first in Grade 12 mathematics at school, district, and provincial level, Kampong Cham.',
  "Silver Award, Hong Kong International Mathematical Olympiad 2024, Senior Secondary group — named on the organizer's official results list.",
  'Grade A, national Bac II examination, Cambodia (2025).',
  'Second-place mathematics laureate — basis of the AUPP 100% scholarship (2025).',
  '1st place, Angkor Mathematics Competition 2024 (Global Round) and AMC Mathematics Competition (2024).',
  'Runner-Up (Top 2), Turing Hackathon Cycle 10 (2026) · medals across SEAMO, SASMO, Copernicus, PhIMO, and Math Kangaroo Cambodia.'
]

const sections: { id: string; heading: string; entries: CvEntry[] }[] = [
  { id: 'education', heading: 'Education', entries: education },
  { id: 'projects', heading: 'Selected projects', entries: projects },
  { id: 'experience', heading: 'Experience & leadership', entries: experience }
]
</script>

<template>
  <div class="cv-page container section">
    <p class="cv-actions mb-6 flex flex-wrap items-center gap-3 print:hidden">
      <a class="btn btn-primary" href="/cv/chamroeun-hongleng.pdf" download>Download PDF</a>
      <a class="btn btn-secondary" href="/cv/chamroeun-hongleng-full.pdf" download>Long version</a>
    </p>

    <article class="cv max-w-[65rem]">
      <h1 class="cv-name font-title text-3xl font-bold tracking-tight text-ink">Chamroeun Hongleng</h1>
      <p class="cv-tagline mt-2 font-title text-lg italic text-brand">
        Software engineering student building web and data systems in TypeScript and Python — with applied-ML work in
        Khmer speech and field-tested product judgment.
      </p>
      <p class="cv-contact mt-3 font-code text-xs leading-relaxed text-ink-muted">
        Phnom Penh, Cambodia ·
        <a href="mailto:chamroeunhongleng825@gmail.com">chamroeunhongleng825@gmail.com</a> ·
        <a href="https://chamroeunhongleng.me">chamroeunhongleng.me</a><br >
        <a href="https://github.com/chamroeunhongleng">github.com/chamroeunhongleng</a> ·
        <a href="https://huggingface.co/Hongleng">huggingface.co/Hongleng</a> ·
        <a href="https://t.me/honglenggg">t.me/honglenggg</a> ·
        <a href="https://www.linkedin.com/in/chamroeun-hongleng-73b249375">linkedin.com/in/chamroeun-hongleng-73b249375</a>
      </p>
      <hr class="cv-rule mt-4 border-0 border-t-2 border-ink" >

      <section v-for="section in sections" :key="section.id" :aria-labelledby="`${section.id}-title`">
        <h2
          :id="`${section.id}-title`"
          class="cv-heading mt-8 border-b border-line pb-1 font-code text-xs font-semibold uppercase tracking-[0.14em] text-brand"
        >
          {{ section.heading }}
        </h2>

        <div v-for="entry in section.entries" :key="entry.title" class="cv-entry mt-4">
          <div class="cv-entry-head flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
            <h3 class="cv-entry-title flex-1 text-base font-bold text-ink">
              {{ entry.title }}
              <span v-if="entry.sub" class="cv-sub font-normal text-sm text-ink-muted">{{ entry.sub }}</span>
            </h3>
            <p class="cv-dates font-code text-xs text-ink-faint md:whitespace-nowrap">{{ entry.dates }}</p>
          </div>
          <ul class="cv-points mt-1 list-none p-0">
            <li
              v-for="point in entry.points"
              :key="point"
              class="relative mt-1 pl-5 text-ink before:absolute before:left-0 before:text-clay before:content-['—']"
            >
              {{ point }}
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="awards-title">
        <h2
          id="awards-title"
          class="cv-heading mt-8 border-b border-line pb-1 font-code text-xs font-semibold uppercase tracking-[0.14em] text-brand"
        >
          Awards &amp; distinctions
        </h2>
        <ul class="cv-awards mt-2 list-none p-0 md:columns-2 md:gap-7">
          <li
            v-for="award in awards"
            :key="award"
            class="cv-award relative mb-2 break-inside-avoid pl-5 text-ink before:absolute before:left-0 before:text-clay before:content-['—']"
          >
            {{ award }}
          </li>
        </ul>
      </section>

      <section aria-labelledby="skills-title">
        <h2
          id="skills-title"
          class="cv-heading mt-8 border-b border-line pb-1 font-code text-xs font-semibold uppercase tracking-[0.14em] text-brand"
        >
          Skills &amp; working style
        </h2>
        <div class="cv-skills mt-2">
          <p class="text-ink">
            <b>Software:</b> TypeScript, Vue/Nuxt, Next.js, Python, Prisma/Postgres, schema-validated content systems,
            unit testing, CI · <b>ML &amp; speech:</b> PyTorch, Hugging Face, Whisper fine-tuning, dataset design,
            evaluation &amp; error analysis · <b>Business &amp; governance:</b> field research, unit economics,
            contracts/terms/policy coursework · <b>Languages:</b> Khmer, English.
          </p>
          <p class="cv-closing mt-3 text-sm text-ink-muted">
            I work AI-natively: AI tools support research, drafting, and implementation; decisions, evidence standards,
            and anything that ships stay under my review. Every claim on my portfolio carries an evidence label —
            <a href="https://chamroeunhongleng.me">chamroeunhongleng.me</a>.
          </p>
        </div>
      </section>
    </article>
  </div>
</template>

<style>
/*
 * Print: the A4 document. These rules are the standalone template's rules,
 * unchanged — pt sizes, mm rhythm, and the page-break guards that keep a
 * heading off the foot of a page and an entry from splitting across one.
 * Unscoped on purpose: it has to reach the layout chrome it hides.
 *
 * Colours are hardcoded rather than tokenised so a visitor printing in dark
 * mode still gets ink on white.
 */
@page {
  size: A4;
  margin: 14mm 15mm 12mm;
}

@media print {
  .skip-link,
  .mode-banner,
  .site-header,
  .site-footer,
  .chat-widget {
    display: none !important;
  }

  /* @page owns the page geometry; the site's container must not add to it. */
  html,
  body,
  .layout,
  main {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  .cv-page {
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .cv {
    max-width: none !important;
    font-family: georgia, 'Times New Roman', serif;
    font-size: 9.6pt;
    line-height: 1.42;
    color: #16161a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* typography.css caps every <p> at the 65ch prose measure, which is right for
     reading on screen and wrong for a document whose width is the A4 text
     block: it re-wrapped the tagline, contact line, and skills paragraph. */
  .cv p {
    max-width: none;
  }

  .cv-name {
    font-family: georgia, 'Times New Roman', serif;
    font-size: 25pt;
    font-weight: 700;
    letter-spacing: -0.015em;
    margin: 0 0 2mm;
  }

  .cv-tagline {
    font-family: georgia, 'Times New Roman', serif;
    font-size: 10.5pt;
    font-style: italic;
    color: #4338ca;
    margin: 0 0 2.5mm;
    line-height: 1.35;
  }

  .cv-contact {
    font-family: consolas, 'Cascadia Mono', ui-monospace, monospace;
    font-size: 7.6pt;
    color: #55555f;
    line-height: 1.6;
    margin: 0 0 4mm;
  }

  .cv-contact a {
    color: #55555f;
    text-decoration: none;
  }

  .cv-rule {
    border: 0;
    border-top: 1.6pt solid #16161a;
    margin: 0 0 4mm;
  }

  .cv-heading {
    font-family: consolas, 'Cascadia Mono', ui-monospace, monospace;
    font-size: 7.8pt;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #4338ca;
    margin: 5mm 0 0;
    padding-bottom: 1.2mm;
    border-bottom: 0.6pt solid #d8d8e0;
    break-after: avoid-page;
    page-break-after: avoid;
  }

  .cv section:first-of-type .cv-heading {
    margin-top: 0;
  }

  .cv-entry {
    margin-top: 3mm;
    break-inside: avoid-page;
    page-break-inside: avoid;
  }

  .cv-entry-head {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 3mm;
  }

  .cv-entry-title {
    font-size: 10pt;
    font-weight: 700;
    flex: 1;
    color: #16161a;
  }

  .cv-sub {
    font-weight: 400;
    font-size: 8.8pt;
    color: #55555f;
  }

  .cv-dates {
    font-family: consolas, 'Cascadia Mono', ui-monospace, monospace;
    font-size: 7.4pt;
    color: #77777f;
    white-space: nowrap;
  }

  .cv-points {
    list-style: none;
    margin: 1mm 0 0;
    padding: 0;
  }

  .cv-points li {
    position: relative;
    padding-left: 4.2mm;
    margin-top: 0.9mm;
    color: #16161a;
    break-inside: avoid-page;
    page-break-inside: avoid;
  }

  .cv-points li::before,
  .cv-award::before {
    content: '—';
    position: absolute;
    left: 0;
    color: #a14d28;
  }

  .cv-awards {
    columns: 2;
    column-gap: 7mm;
    margin-top: 2mm;
    list-style: none;
    padding: 0;
  }

  .cv-award {
    break-inside: avoid-page;
    page-break-inside: avoid;
    -webkit-column-break-inside: avoid;
    position: relative;
    padding-left: 4.2mm;
    margin-bottom: 1.6mm;
    color: #16161a;
  }

  .cv-skills {
    margin-top: 2mm;
    break-inside: avoid-page;
  }

  .cv-skills p {
    margin: 0 0 1.5mm;
    color: #16161a;
  }

  .cv-skills b {
    font-weight: 700;
  }

  .cv-closing {
    margin-top: 2.5mm;
    color: #55555f;
    font-size: 9pt;
    line-height: 1.45;
  }

  .cv-closing a {
    color: #4338ca;
    text-decoration: none;
  }
}
</style>
