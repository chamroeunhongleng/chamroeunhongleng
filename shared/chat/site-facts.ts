/**
 * KEEP IN SYNC with app/pages/about.vue — the "Skills" section and the
 * background story are owner-approved prose hardcoded in that template, not
 * content JSON, so the chat assistant mirrors them here. When the About page
 * skills change, change this file in the same commit (and vice versa). A regex
 * sync-check over the .vue source is deliberately NOT added — CLAUDE.md
 * rule 3 bans regex-over-source validation.
 *
 * "What I can contribute" is no longer mirrored here: since 2026-09-14 it lives
 * in content/contributions.json and knowledge.ts reads it from the bundle.
 */

export const SITE_FACTS = `SKILLS
- Software: TypeScript, Vue/Nuxt, Next.js, Python, unit testing and CI, schema-validated content architectures, and AI-native development — leading coding agents with explicit human review gates. Current tooling: GitHub, GitLab, and AWS.
- Machine learning: PyTorch, Hugging Face Transformers, Whisper fine-tuning, CER/WER evaluation design, dataset and manifest discipline; currently studying classic ML fundamentals and C++.
- Product & business: structured field research, buyer-first validation, bilingual English/Khmer product design, digital marketing and short-form technical video (CapCut).
- Languages: Khmer (native), English (professional working).

BACKGROUND STORY — how he ended up working across four fields (from the About page)
He grew up in Kampong Cham and started with mathematics competitions: first in his province in Grade 9, national runner-up in Grade 12, and four full university scholarships when he left school. He works on Khmer speech recognition because the language he grew up speaking barely exists in everyday tools, and on agritech because the bok choy farmers his team interviewed in Kang Meas plant their fields without knowing who will buy the harvest. In both, careful testing matters more than an impressive demo.`
