# Chamroeun Hongleng

Computer science student in Phnom Penh. I build web systems, decision engines, and bilingual product tooling, and I fine-tune Khmer speech models when a product needs one.

**Software Engineering Intern at Angkor Byte** · since September 2026

[Portfolio](https://chamroeunhongleng.me) · [CV (PDF)](https://chamroeunhongleng.me/cv/chamroeun-hongleng.pdf) · [Hugging Face](https://huggingface.co/Hongleng) · [LinkedIn](https://www.linkedin.com/in/chamroeun-hongleng-73b249375) · [Email](mailto:chamroeunhongleng825@gmail.com)

## Now

- Interning at Angkor Byte — day-to-day tools: GitHub, GitLab, and AWS
- Building at [CHNAI LAB](https://github.com/chnai-lab), a six-member student studio in Phnom Penh
- Working on Khmer-language ML, where public data is scarce and the evaluation has to stay honest
- Studying a dual degree: Computer Science at Fort Hays State University and Information Technology Management at AUPP, plus a B.A. in English for Work Skills at IFL, Royal University of Phnom Penh

## Projects

| Project | What it is | Where it stands |
| --- | --- | --- |
| [Kaskor ASR](https://github.com/chamroeunhongleng/kaskor-asr) | Khmer speech-to-text for a low-resource language | Prototype · public code, [released weights](https://huggingface.co/Hongleng/kasekor-asr-v0.0), 3.74% CER on a speaker-dependent validation split |
| [PhsarOS](https://phsaros.vercel.app) | Daily operations for small Cambodian shops, cafés, and marts | Public demo · deployed with self-serve signup, no business results claimed |
| [Chomkar Decision Grid](https://github.com/chamroeunhongleng/chomkar-decision-grid) | Auditable allocation of farm lots against a buyer order | Prototype · 62 unit tests, CI-gated, bilingual audit reports, a human approves every recommendation |
| [Chomkar OrderLoop](https://chomkar.com) | Pre-harvest market access for smallholder farmers | Pre-pilot · around 30 farmer interviews in Kampong Cham; Top 2, Turing Hackathon Cycle 10 |
| [Bilingual LMS](https://lms-for-education-nine.vercel.app) | Course delivery and assessment in English and Khmer | Prototype · public walkthrough |
| [chamroeunhongleng.me](https://github.com/chamroeunhongleng/chamroeunhongleng) | A portfolio that proves its claims instead of asserting them | Deployed · this repository |

PhsarOS is my own build. Chomkar is team work at CHNAI LAB: I provide the Khmer voice-intake model (Kaskor ASR), the farmer interviews, and the business analysis. Every project has a case study on the [portfolio](https://chamroeunhongleng.me/projects) with its architecture, results, and limits.

### About the 3.74% CER

Measured on the validation split: fixed-seed 800-utterance subsample, greedy decoding. Two caveats belong next to the number:

- **It is speaker-dependent.** The splits are stratified by speaker and every training voice is female, so it does not estimate accuracy on a speaker the model has never heard. A speaker-held-out evaluation is the next version.
- **It replaced a wrong 17.48%.** My evaluation capped decoding at 225 tokens, which cut long hypotheses mid-word. The bug was mine, not the model's; it is fixed, and the old number is marked as corrected in the repository.

Full limitations: [Kaskor ASR case study](https://chamroeunhongleng.me/projects/kaskor-asr).

## This repository

[![Quality](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/quality.yml/badge.svg)](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/quality.yml)
[![Production gate](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/production-gate.yml/badge.svg)](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/production-gate.yml)
[![CodeQL](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/codeql.yml/badge.svg)](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/codeql.yml)

This profile is also the source of [chamroeunhongleng.me](https://chamroeunhongleng.me), a Nuxt application.

- Content is JSON validated by zod schemas. A claim cannot parse without an evidence label.
- A production build fails while any placeholder or unresolved marker remains.
- A 14-phase pipeline checks structure, claim labels, links, accessibility, SEO, and secrets. Unit tests run in CI and back the badges above; the Playwright suite and the assistant's eval suite run on demand.

```bash
npm ci
npm run verify
```

The build enforces that every claim has a label and a source. Whether a labelled claim is true is still my judgement, not the pipeline's. More: [docs/repository.md](docs/repository.md).

**Built with:** TypeScript · Nuxt · Vue · Tailwind CSS · Zod · Vitest · Playwright · Vercel · GitHub Actions · Claude API

## Background

I was a mathematics competitor before I was a builder, and that is where the habit of checking my own work came from.

- **National runner-up in mathematics**, Cambodia (Ministry of Education national examination, 2025) · Grade A, Bac II 2025
- **Silver Award, Hong Kong International Mathematical Olympiad 2024** — [named in the organiser's official results](https://www.hongkongimo.com/uploads/2/8/9/2/28923219/hkimo_2024_heat_round_ss.pdf)
- First in mathematics at school, district, and provincial level in Kampong Cham · around 30 medals across SASMO, HKIMO, AMO, SEAMO, WMO, and Math Kangaroo
- **Two full (100%) university scholarships** — AUPP, as second-place laureate in mathematics, and a four-year Ministry of Justice award for study at RUPP
- **Author of six bilingual mathematics books** (~1,780 pages, First Editions 2026) — [free to download](https://github.com/chamroeunhongleng/chamroeunhongleng/releases/tag/scholar-series-2026)
- **Lead of the FounderOS Professional Circle** — a small reading and practice group with a written handbook, rotating roles, and five binding rules on how members may use AI

## How I work

- **Product first.** Start from a real user, a real workflow, and the way it currently fails.
- **Evidence over hype.** Say what is shipped, what is a prototype, and what has not been validated. Where a metric flatters me, say why.
- **AI-native, not AI-blind.** Agents help with research, drafting, and implementation; decisions, evidence labels, and anything that ships stay under my review.
- **Private where it should stay private.** Field data, personal records, and other people's information stay out of public repositories.

## Licence

The site's source code is [MIT](LICENSE). The personal content — biography, project descriptions, case studies, images, and everything under `content/` — is all rights reserved; see [NOTICE](NOTICE).

<sub>From Kampong Cham, based in Phnom Penh · Studio: <a href="https://github.com/chnai-lab">@chnai-lab</a></sub>
