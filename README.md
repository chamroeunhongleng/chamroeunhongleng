# Chamroeun Hongleng

Software Engineering Intern at **Angkor Byte** · computer science student in Phnom Penh

I build web systems, decision engines, and bilingual product tooling, and I fine-tune Khmer speech models when a product needs one.

[Portfolio](https://chamroeunhongleng.me) · [CV](https://chamroeunhongleng.me/cv/chamroeun-hongleng.pdf) · [Hugging Face](https://huggingface.co/Hongleng) · [LinkedIn](https://www.linkedin.com/in/chamroeun-hongleng-73b249375) · [Email](mailto:chamroeunhongleng825@gmail.com)

## Projects

| Project | What it is | Status |
| --- | --- | --- |
| [Kaskor ASR](https://github.com/chamroeunhongleng/kaskor-asr) | Khmer speech-to-text | Prototype · public code and [weights](https://huggingface.co/Hongleng/kasekor-asr-v0.0) · 3.74% CER, speaker-dependent¹ |
| [PhsarOS](https://phsaros.vercel.app) | Daily operations for small Cambodian shops | Public demo · no business results claimed |
| [Chomkar Decision Grid](https://github.com/chamroeunhongleng/chomkar-decision-grid) | Auditable allocation of farm lots to a buyer order | Prototype · 62 unit tests, CI-gated |
| [Chomkar OrderLoop](https://chomkar.com) | Pre-harvest market access for smallholder farmers | Pre-pilot · around 30 farmer interviews · Top 2, Turing Hackathon Cycle 10 |
| [Bilingual LMS](https://lms-for-education-nine.vercel.app) | Courses and assessment in English and Khmer | Prototype |
| [chamroeunhongleng.me](https://chamroeunhongleng.me) | A portfolio where every claim carries an evidence label | Deployed · this repository |

¹ Measured on a validation split whose speakers were also in training, so it does not estimate accuracy on a new speaker. It replaced an earlier 17.48% caused by a decoding bug in my own evaluation. Details: [case study](https://chamroeunhongleng.me/projects/kaskor-asr).

PhsarOS is my own build. Chomkar is team work at [CHNAI LAB](https://github.com/chnai-lab), a six-member student studio.

## Background

- Dual degree: Computer Science at Fort Hays State University and IT Management at AUPP · B.A. English for Work Skills at IFL, Royal University of Phnom Penh
- National runner-up in mathematics, Cambodia, 2025 · Grade A, Bac II 2025
- Silver Award, Hong Kong International Mathematical Olympiad 2024 ([official results](https://www.hongkongimo.com/uploads/2/8/9/2/28923219/hkimo_2024_heat_round_ss.pdf))
- Two full (100%) university scholarships: AUPP, and a four-year Ministry of Justice award for RUPP
- Author of six bilingual mathematics books, about 1,780 pages ([free download](https://github.com/chamroeunhongleng/chamroeunhongleng/releases/tag/scholar-series-2026))
- Lead of the FounderOS Professional Circle, a small reading and practice group

## This repository

[![Quality](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/quality.yml/badge.svg)](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/quality.yml)
[![Production gate](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/production-gate.yml/badge.svg)](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/production-gate.yml)
[![CodeQL](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/codeql.yml/badge.svg)](https://github.com/chamroeunhongleng/chamroeunhongleng/actions/workflows/codeql.yml)

The source of [chamroeunhongleng.me](https://chamroeunhongleng.me), a Nuxt site. Content is JSON checked against schemas: a claim without an evidence label fails the build.

```bash
npm ci
npm run verify
```

More in [docs/repository.md](docs/repository.md). Code is [MIT](LICENSE); personal content is all rights reserved ([NOTICE](NOTICE)).
