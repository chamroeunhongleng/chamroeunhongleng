# Chat assistant — architecture & operations

The floating "Ask" widget answers visitor questions about Chamroeun and
auto-navigates to the relevant page while answering. The site itself stays
fully static; the assistant is one Vercel serverless function.

## Architecture

```
ChatWidget.vue (app/components/chat/, state in app/composables/useChat.ts)
  → POST /api/chat                        (api/chat.ts, Vercel function)
      1. method / origin / size / schema validation (shared/chat/contract.ts)
      2. in-memory rate limit
      3. Claude API call — model claude-haiku-4-5
         · system prompt composed at cold start from content/*.json via
           scripts/lib/load-content.ts + shared/chat/knowledge.ts
           (byte-stable → prompt-cached with cache_control)
         · structured output: { reply, navigateTo, suggested }
      4. navigateTo validated against the allowlist
         (shared/chat/navigation.ts — derived from content, never hardcoded)
  ← widget renders the reply, router.push(navigateTo), scrolls to the anchor
```

Grounding: the system prompt contains ONLY zod-validated site content (all
strings pass through `stripMarkers`; fields still carrying
`OWNER_INPUT_REQUIRED`/`PLACEHOLDER` markers are dropped), plus
`shared/chat/site-facts.ts`, which mirrors the Skills / "What I bring" prose
hardcoded in `app/pages/about.vue` — keep the two in sync by hand.

## Cost model

- Model: `claude-haiku-4-5` — $1 / $5 per million input/output tokens.
- The system prompt is ~15–30K tokens and is sent with
  `cache_control: {type: "ephemeral"}` (5-minute TTL):
  - cache miss (first request, or > 5 min since the last): ≈ $0.02–0.03
  - cache hit: ≈ 10× cheaper (`cache_read_input_tokens` in the function log
    confirms hits)
- Replies are capped at 1024 output tokens.
- **The hard cost ceiling is the spend limit set in the Anthropic Console**
  (console.anthropic.com → Billing → Limits). Keep one configured.

## Abuse controls & their limits

- Message ≤ 500 chars, history ≤ 6 turns, body ≤ 16 KB, POST + same-origin
  check (chamroeunhongleng.me / *.vercel.app / localhost).
- Rate limit: 8/min and 60/day per IP, 40/min per instance — **in-memory,
  per function instance** (Vercel Hobby, no KV). Cold starts reset it and
  parallel instances don't share buckets. Accepted trade-off; the spend
  limit above is the real backstop. Revisit with Upstash/Vercel KV only if
  abuse actually shows up.
- Message content is never logged — the function logs counters only.

## Key management

- `ANTHROPIC_API_KEY` is a server-only secret: Vercel env var
  (Production + Preview) via `vercel env add ANTHROPIC_API_KEY`, and in the
  gitignored `.env` only while testing locally with `vercel dev`.
- Rotate at console.anthropic.com → API keys (create new → update Vercel →
  delete old). Rotate immediately if the key ever appears in a chat log,
  screenshot, or commit.
- **Disable switch:** remove the env var and redeploy — `/api/chat` answers
  503 and the widget degrades to a friendly "email instead" message. The
  static site is unaffected.

## Local testing

`npm run verify` does not need the key (tests mock the Anthropic client).
For a real end-to-end run:

1. Run `npm run verify` FIRST — `check-structure` flags a present `.env`.
2. Create `.env` with `ANTHROPIC_API_KEY=...` (gitignored).
3. `vercel dev` → open the site, ask questions, confirm auto-navigation,
   both themes, mobile width, a Khmer question, and the 429 after spamming.
4. Delete `.env` when done.

On a preview deploy, confirm in the function logs that the second request
within 5 minutes shows `cached=` > 0 (prompt caching working).

## Constraints to preserve

- The Nuxt build stays `nuxt generate` (fully static). The function is
  deployed from root `api/` next to it; `vercel.json` gives it
  `maxDuration: 30` and `includeFiles: "content/**"` (the function reads
  content JSON from disk at cold start via `process.cwd()`).
- No CSP header exists today. If one is ever added, it must include
  `connect-src 'self'` or the widget's fetch breaks.
- Evidence discipline applies to the prompt: the assistant is instructed to
  never overstate the owner and to preserve qualifiers ("self-reported",
  "student-scale") verbatim. Spot-check replies — especially Khmer ones —
  after content changes.
