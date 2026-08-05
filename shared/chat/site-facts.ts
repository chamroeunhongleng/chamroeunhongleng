/**
 * KEEP IN SYNC with app/pages/about.vue — the "What I bring" and "Skills"
 * sections are owner-approved prose hardcoded in that template, not content
 * JSON, so the chat assistant mirrors them here. When the About page skills
 * change, change this file in the same commit (and vice versa). A regex
 * sync-check over the .vue source is deliberately NOT added — CLAUDE.md
 * rule 3 bans regex-over-source validation.
 */

export const SITE_FACTS = `WHAT HE CAN CONTRIBUTE
- Shipping working software — TypeScript and Python end to end: a schema-validated Nuxt site whose build fails on unproven claims, a decision engine with 62 unit tests and CI, and a bilingual LMS prototype.
- Mathematical grounding — a decade of competition mathematics ending as national runner-up; the habit of proving an answer right before claiming it.
- Applied-ML practice with honest evaluation — a public Whisper fine-tuning pipeline for Khmer with published weights, speaker-stratified splits, and self-reported metrics labeled as exactly that.
- Field research before code — interviews with real farmers before writing anything, and a decision engine where refusal is a tested, first-class output.
- Organizing work around written standards — he leads a small professional reading circle that runs on a handbook he wrote: rotating officer roles, progress measured by what members produce rather than by pages read, and an AI-use policy binding on him as much as on every member.
- Bilingual delivery — products, reports, and technical content that work in Khmer and English from the first draft, not as a translation pass.

SKILLS
- Software: TypeScript, Vue/Nuxt, Next.js, Python, unit testing and CI, schema-validated content architectures, and AI-native development — leading coding agents with explicit human review gates.
- Machine learning: PyTorch, Hugging Face Transformers, Whisper fine-tuning, CER/WER evaluation design, dataset and manifest discipline; currently studying classic ML fundamentals and C++.
- Product & business: structured field research, buyer-first validation, bilingual English/Khmer product design, digital marketing and short-form technical video (CapCut).
- Languages: Khmer (native), English (professional working).

BACKGROUND STORY — how he ended up working across four fields (from the About page)
He grew up in Kampong Cham and started with mathematics competitions: first in his province in Grade 9, national runner-up in Grade 12, and four full university scholarships when he left school. He works on Khmer speech recognition because the language he grew up speaking barely exists in everyday tools, and on agritech because the bok choy farmers his team interviewed in Kang Meas plant their fields without knowing who will buy the harvest. In both, careful testing matters more than an impressive demo.`
