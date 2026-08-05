# Chamroeun Hongleng

Computer science student in Phnom Penh. I build web systems, decision engines, and bilingual product tooling, and I fine-tune Khmer speech models when a product needs one. Most of my work starts from a problem I can watch happen here: a farmer selling before harvest, a shop owner counting stock by hand, a student studying in two languages.

I am early in my career, so I am training the habits I want to keep: ship working systems, write down the tradeoffs, publish the caveat next to the number, and use AI agents as engineering leverage rather than as a replacement for judgment.

**Actively looking for a software engineering internship — full-stack, backend, or data and ML tooling — remote or Phnom Penh.**

Dual degree: Computer Science at Fort Hays State University + Information Technology Management at AUPP · B.A. English for Work Skills at IFL, Royal University of Phnom Penh

[Portfolio](https://chamroeunhongleng.me) · [CV (PDF)](https://chamroeunhongleng.me/cv/chamroeun-hongleng.pdf) · [Hugging Face](https://huggingface.co/Hongleng) · [LinkedIn](https://www.linkedin.com/in/chamroeun-hongleng-73b249375) · [Email](mailto:chamroeunhongleng825@gmail.com)

---

## Current Direction

- Building software end to end in TypeScript and Python, and adding a machine learning layer only where a product genuinely needs one
- Working on Khmer-language ML, where public data is scarce and the evaluation has to stay honest
- Turning problems I can observe in Cambodia — smallholder agriculture, small retail, bilingual education — into small systems that can be tested
- Practising AI-native engineering: written specs, agent-assisted implementation, test loops, and human review before anything ships
- Building at CHNAI LAB, a six-member student studio in Phnom Penh, where I work most closely with one teammate

## Public Proof of Work

- **Portfolio case studies:** [chamroeunhongleng.me](https://chamroeunhongleng.me) documents the architecture, results, and limits of each project. Every claim carries an evidence label — public document, repository, live demo, or plainly "stated by me" — and the build refuses to publish a claim that has none.
- **Khmer speech model:** [`Hongleng/kasekor-asr-v0.0`](https://huggingface.co/Hongleng/kasekor-asr-v0.0) — released weights on the Hub, with the training and evaluation code public in [kaskor-asr](https://github.com/chamroeunhongleng/kaskor-asr). The raw audio stays private; everything needed to read the method does not.
- **Shop operations platform:** [phsaros.vercel.app](https://phsaros.vercel.app) — a running Next.js application for Cambodian shops, cafés, and marts, open for self-serve signup. No business results are claimed: no shop's daily operation is documented on it yet.
- **Agritech:** [chomkar.com](https://chomkar.com) is the Khmer-first product site for pre-harvest market access; the [Chomkar Decision Grid](https://github.com/chamroeunhongleng/chomkar-decision-grid) is the deterministic engine underneath that work.
- **Studio:** [github.com/chnai-lab](https://github.com/chnai-lab) — CHNAI LAB, the student studio I build in. Products are divided between members. PhsarOS is my own build; on Chomkar I contributed the API it runs on from my account, the farmer interviews, and the business analysis.

## Open-Source Proof

[kaskor-asr](https://github.com/chamroeunhongleng/kaskor-asr) is a complete Khmer speech-to-text pipeline for a low-resource language: raw audio → manifests → fine-tuning Whisper-small → evaluation → released weights → a pip-installable CLI. Its CI fails the build if the released model id stops resolving on the Hub, so the install path cannot quietly break.

Best checkpoint: **3.74% CER** — validation split, fixed-seed 800-utterance subsample, greedy decoding.

That number replaced the 17.48% I had published for the same weights, and how it changed is the part I would rather show than hide. Decoding was capped at 225 tokens — about 102 Khmer characters — while more than half of the references are longer, so complete references were being scored against hypotheses truncated mid-word. The cap was a bug in my evaluation and in the shipped CLI, not a property of the model. Both are fixed, the old number is marked as corrected in the repository, and the caveat that matters still stands: the splits are stratified by speaker and every training voice is female, so this does not estimate accuracy on a speaker the model has never heard. A speaker-held-out evaluation is the next version. The full limitations are in the [case study](https://chamroeunhongleng.me/projects/kaskor-asr).

## Runnable Verification

This profile is also a live Nuxt application, not only a narrative README. Site content is JSON validated by zod schemas, and structure, claim labels, links, accessibility, SEO, and secrets are all checked by a 12-phase pipeline with a unit, end-to-end, and model-behaviour test suite behind it.

```bash
npm ci
npm run verify
```

A production build **fails** while any claim is unlabelled or any placeholder is still in the content — the honesty rule is enforced by the build, not by good intentions. The same pipeline runs in GitHub Actions on every push. Repository documentation: [docs/repository.md](docs/repository.md).

## Selected Work

| Project | Problem space | Where it stands |
| --- | --- | --- |
| [Kaskor ASR](https://github.com/chamroeunhongleng/kaskor-asr) | Khmer speech-to-text for a low-resource language | Prototype · public code, released weights, 3.74% CER on a speaker-dependent validation split |
| [PhsarOS](https://phsaros.vercel.app) | Daily operations for small Cambodian shops, cafés, and marts | Public demo · deployed with self-serve signup, no business results claimed |
| [Chomkar Decision Grid](https://github.com/chamroeunhongleng/chomkar-decision-grid) | Auditable allocation of farm lots against a buyer order | Prototype · 62 unit tests, CI-gated, bilingual audit reports, a human approves every recommendation |
| [Chomkar OrderLoop](https://chomkar.com) | Pre-harvest market access for smallholder farmers | Pre-pilot · around 30 farmer interviews in Kampong Cham; Top 2, Turing Hackathon Cycle 10 |
| [Bilingual LMS](https://lms-for-education-nine.vercel.app) | Course delivery and assessment in English and Khmer | Prototype · public walkthrough |
| [chamroeunhongleng.me](https://github.com/chamroeunhongleng/chamroeunhongleng) | Proving claims instead of asserting them | Deployed · this repository: schema-validated content and a build that gates publication |

Read more:

- [Kaskor ASR case study](https://chamroeunhongleng.me/projects/kaskor-asr)
- [PhsarOS case study](https://chamroeunhongleng.me/projects/phsaros)
- [Chomkar OrderLoop case study](https://chamroeunhongleng.me/projects/chomkar-orderloop)
- [How this site is built](https://chamroeunhongleng.me/projects/portfolio-site) and its [colophon](https://chamroeunhongleng.me/colophon)
- [Journey — competitions, scholarships, and community work](https://chamroeunhongleng.me/journey)

## Engineering Stack

TypeScript, JavaScript, Vue, Nuxt, React, Next.js, Node.js, Python, PyTorch, Hugging Face, Whisper, Prisma, PostgreSQL, Supabase, Neon, Vercel, GitHub Actions, the Claude API, and agent-assisted development workflows.

## Background

I was a mathematics competitor before I was a builder, and that is where the habit of checking my own work came from.

- **National runner-up in mathematics**, Cambodia (Ministry of Education national examination, 2025) · Grade A, Bac II 2025
- **Silver Award, Hong Kong International Mathematical Olympiad 2024** — [named in the organiser's official results](https://www.hongkongimo.com/uploads/2/8/9/2/28923219/hkimo_2024_heat_round_ss.pdf)
- Ranked first in mathematics at school, district, and provincial level in Kampong Cham · around 30 medals across SASMO, HKIMO, AMO, SEAMO, WMO, and Math Kangaroo
- **Two full (100%) university scholarships** — AUPP, as second-place laureate in mathematics, and a four-year Ministry of Justice award for study at RUPP
- **Author of six bilingual mathematics books** (~1,780 pages, First Editions 2026) — [free to download](https://github.com/chamroeunhongleng/chamroeunhongleng/releases/tag/scholar-series-2026)
- **Lead of the FounderOS Professional Circle** — a small reading and practice group with a written handbook, rotating roles, and five binding rules on how members may use AI

## How I Work

- **Product first.** Start from a real user, a real workflow, and the way it currently fails.
- **Evidence over hype.** Say what is shipped, what is still a prototype, and what has not been validated yet. Where a metric flatters me, say why.
- **AI-native, not AI-blind.** Agents help with research, drafting, and implementation; decisions, evidence labels, and anything that ships stay under my review.
- **Bounded authority.** Give an agent the minimum context and permission it needs, and keep deployment, security, financial, and public-claim decisions with a human.
- **Private where it should stay private.** Field data, personal records, and other people's information stay out of public repositories and off the site.
- **Readable systems.** Small commits, written tradeoffs, and architecture a future teammate can follow.

## Contact

Portfolio: [chamroeunhongleng.me](https://chamroeunhongleng.me) · GitHub: [@chamroeunhongleng](https://github.com/chamroeunhongleng) · LinkedIn: [Chamroeun Hongleng](https://www.linkedin.com/in/chamroeun-hongleng-73b249375) · Email: [chamroeunhongleng825@gmail.com](mailto:chamroeunhongleng825@gmail.com)

## Licence

The site's source code is [MIT](LICENSE). The personal content — biography, project descriptions, case studies, images, and everything under `content/` — is all rights reserved; see [NOTICE](NOTICE).

<sub>From Kampong Cham, based in Phnom Penh · Studio: <a href="https://github.com/chnai-lab">@chnai-lab</a></sub>
