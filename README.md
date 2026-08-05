# Chamroeun Hongleng

**Applied ML & software — building Khmer-first systems for Cambodia.**

Phnom Penh 🇰🇭 · Dual degree: Information Technology Management @ AUPP + Computer Science @ Fort Hays State University · B.A. English for Work Skills @ IFL, Royal University of Phnom Penh

🔎 **Open to applied-ML and software engineering internships — research or product, remote or Phnom Penh, from 2026.**

[Portfolio](https://chamroeunhongleng.me) · [CV (PDF)](https://chamroeunhongleng.me/cv/chamroeun-hongleng.pdf) · [Hugging Face](https://huggingface.co/Hongleng) · [LinkedIn](https://www.linkedin.com/in/chamroeun-hongleng-73b249375) · [Email](mailto:chamroeunhongleng825@gmail.com)

---

## Selected work

**[Kaskor ASR](https://github.com/chamroeunhongleng/kaskor-asr)** — Khmer speech-to-text
`Python` `PyTorch` `Whisper` `Hugging Face`

`whisper-small` fine-tuned for Khmer across a complete public pipeline: raw audio → manifest → training → evaluation → released weights → a pip-installable CLI. Weights are on the Hub as [`Hongleng/kasekor-asr-v0.0`](https://huggingface.co/Hongleng/kasekor-asr-v0.0).

Best checkpoint: **17.48% CER**. The repository states plainly why that number is optimistic — the split is stratified by speaker, so 99.96% of test utterances come from voices the model trained on, and the training data is female-only. A speaker-independent evaluation is the stated next step. I would rather publish the caveat than the headline alone.

**[Chomkar Decision Grid](https://github.com/chamroeunhongleng/chomkar-decision-grid)** — auditable farm-lot decision engine
`Python` `Decision intelligence` `CI` `Agritech`

Assembles multi-farm produce lots against a buyer order and explains every number. Deterministic, stdlib-only code owns the arithmetic; the AI layer cites it and is forbidden by a CI linter from computing money in prose. **62 unit tests**, an independent audit gate that re-derives every recommendation from raw data, designed-to-fail test orders, and bilingual Khmer/English reports ending in a human approval checklist.

**Chomkar OrderLoop** — pre-harvest market coordination
`Field research` `Product strategy`

Coordinating buyer demand and smallholder commitments into one documented pre-harvest lot. Validated through ~30 farmer interviews in Kampong Cham. **Top 2, Turing Hackathon Cycle 10** (Techo Startup Center) · [case study](https://chamroeunhongleng.me/projects/chomkar-orderloop)

**[chamroeunhongleng.me](https://github.com/chamroeunhongleng/chamroeunhongleng)** — this repository
`Nuxt 4` `TypeScript` `Zod` `CI`

My portfolio, and the enforcement mechanism behind it: content is schema-validated, every claim carries an evidence label, and a production build aborts if a claim is unlabelled or a placeholder remains. See [docs/repository.md](docs/repository.md).

## What I do

Applied ML and the software around it: Khmer speech and language modelling, evaluation and data pipelines for a low-resource language, and decision systems for agriculture and informal commerce. I build end to end and add the ML layer when a product genuinely needs one.

**Python** · **TypeScript** · PyTorch · Hugging Face · Whisper · Nuxt · Next.js · Claude API · PostgreSQL · Supabase · Prisma

I work AI-natively — Claude supports research, drafting, and implementation — while decisions, evidence labels, and anything that ships stay under my review.

## Background

Mathematics competitor before I was a builder. That is where the habit of checking my own work came from.

- **National runner-up in mathematics**, Cambodia (Ministry of Education national examination, 2025) · Grade A, Bac II 2025
- **Silver Award, Hong Kong International Mathematical Olympiad 2024** — [named in the organiser's official results](https://www.hongkongimo.com/uploads/2/8/9/2/28923219/hkimo_2024_heat_round_ss.pdf)
- Ranked No. 1 in mathematics at school, district, and provincial level (Kampong Cham) · ~30 medals across SASMO, HKIMO, AMO, SEAMO, WMO, Math Kangaroo and others
- **Two full (100%) university scholarships** — AUPP (second-place laureate in mathematics) and a four-year Ministry of Justice award for study at RUPP
- **Author of six bilingual mathematics books** (~1,780 pages, First Editions 2026) — [free to download](https://github.com/chamroeunhongleng/chamroeunhongleng/releases/tag/scholar-series-2026)

## How I work

Every claim I publish carries an evidence label — public document, repository, or plainly "stated by me". I would rather ship something small and honest than something impressive-sounding and unverified. Where a metric flatters me, I say why.

That rule is enforced by code, not by good intentions: this repository is the source of [chamroeunhongleng.me](https://chamroeunhongleng.me), where an unlabelled claim fails to parse and a production build aborts while any placeholder remains.

## Licence

The site's source code is [MIT](LICENSE). The personal content — biography, project descriptions, case studies, images, and everything under `content/` — is all rights reserved; see [NOTICE](NOTICE).

<sub>From Kampong Cham, based in Phnom Penh · Studio: <a href="https://github.com/CHNAI-LAB">@CHNAI-LAB</a></sub>
