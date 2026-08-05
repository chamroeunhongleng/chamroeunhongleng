/**
 * POST /api/chat — the site assistant's only backend.
 *
 * A Vercel serverless function deployed ALONGSIDE the static site (the Nuxt
 * build stays `nuxt generate`; this file is the whole runtime surface).
 * Flow: validate → rate-limit → ask Claude (system prompt composed from the
 * same zod-validated content the site renders, prompt-cached, structured
 * JSON output) → validate the model's navigation target against the
 * allowlist → respond.
 *
 * Privacy contract (disclosed in the widget and on /colophon): visitor
 * messages pass through this function to Anthropic's API; nothing is stored
 * here and message content is never logged — counters only.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { loadContent } from '../scripts/lib/load-content.js'
import {
  CHAT_REPLY_JSON_SCHEMA,
  MAX_HISTORY_ENTRIES,
  MAX_HISTORY_ENTRY_LENGTH,
  MAX_MESSAGE_LENGTH,
  chatReplySchema,
  chatRequestSchema,
  type ChatReply,
  type ChatRequest
} from '../shared/chat/contract.js'
import { buildNavAllowlist, validateNavigateTo } from '../shared/chat/navigation.js'
import { buildSystemPrompt } from '../shared/chat/knowledge.js'

export const CHAT_MODEL = 'claude-haiku-4-5'
export const MAX_OUTPUT_TOKENS = 1024
const MAX_SUGGESTED = 3

/**
 * Derived from the contract rather than guessed, and counted in BYTES.
 * A Khmer character is one UTF-16 unit but three UTF-8 bytes, so a hand-picked
 * 16 KB limit measured with `.length` sat BELOW the largest legal Khmer
 * conversation this endpoint is contractually required to accept — it would
 * have started rejecting valid Khmer on a site that treats Khmer as
 * first-class. Contract maximum plus room for JSON structure.
 */
const MAX_BODY_BYTES = (MAX_MESSAGE_LENGTH + MAX_HISTORY_ENTRIES * MAX_HISTORY_ENTRY_LENGTH) * 3 + 4096

/** SDK defaults are 10 minutes and 2 retries. vercel.json caps the function at
 *  30s, so those defaults mean a slow upstream burns three billable attempts
 *  and the platform kills us before the catch block can answer — the client
 *  sees a bare 504 instead of the friendly 503. Stay inside the budget. */
const REQUEST_TIMEOUT_MS = 20_000
const MAX_RETRIES = 1

/**
 * Content is loaded once per (cold) instance. `loadContent()` resolves from
 * process.cwd(): locally that is the repo root; on Vercel it is /var/task,
 * where vercel.json's `includeFiles: "content/**"` places the JSON files.
 */
const loaded = (() => {
  try {
    const { bundle } = loadContent()
    if (!bundle) return null
    return {
      systemPrompt: buildSystemPrompt(bundle),
      allowlist: buildNavAllowlist(bundle.projects)
    }
  } catch (error) {
    // Silence here meant one bad content file took the assistant offline in
    // production with no log line to explain it. loadContent() also returns a
    // null bundle on any single schema error, so this is not a rare path.
    console.error(
      `chat startup: content failed to load — assistant will answer 503. ${
        error instanceof Error ? error.name : 'unknown error'
      }`
    )
    return null
  }
})()

if (!loaded) console.error('chat startup: loadContent() returned no bundle — assistant is offline.')

// ── Origin gate ───────────────────────────────────────────────────────────
/**
 * Soft same-origin check: browsers send Origin on cross-site POSTs, so a
 * foreign origin is an easy 403. Absent headers pass (curl, some privacy
 * setups) — this is a tripwire against casual embedding, not a wall; the
 * rate limiter and the Anthropic Console spend limit are the real bounds.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true
  let host: string
  try {
    host = new URL(origin).hostname
  } catch {
    return false
  }
  return (
    host === 'chamroeunhongleng.me'
    || host === 'www.chamroeunhongleng.me'
    // Preview deployments of THIS project only. A bare `.vercel.app` suffix
    // test trusted every Vercel deployment on the internet, which is a wide
    // door for a check whose whole job is narrowing one.
    || (host.endsWith('.vercel.app') && host.startsWith('chamroeunhongleng'))
    || host === 'localhost'
    || host === '127.0.0.1'
  )
}

// ── Rate limiting ─────────────────────────────────────────────────────────
/**
 * In-memory token buckets. On Vercel's Hobby plan each function instance has
 * its own memory, so these limits are per-instance and reset on cold starts
 * — a determined abuser can exceed them. Accepted trade-off (no KV store);
 * the hard cost ceiling is the owner's spend limit in the Anthropic Console
 * plus MAX_OUTPUT_TOKENS per request.
 */
interface Window {
  count: number
  resetAt: number
}

const MINUTE = 60_000
const DAY = 86_400_000

export interface RateLimits {
  ipPerMinute: number
  ipPerDay: number
  globalPerMinute: number
  /**
   * Per-INSTANCE daily ceiling. Vercel runs one instance per concurrent
   * request, so this bounds a single instance's spend, not the account's —
   * it is not a defence against distributed abuse and must not be described
   * as one. The account-level ceiling is the Anthropic Console spend limit.
   */
  globalPerDay: number
}

const DEFAULT_LIMITS: RateLimits = {
  ipPerMinute: 8,
  ipPerDay: 60,
  globalPerMinute: 40,
  globalPerDay: 500
}

export class RateLimiter {
  private perIpMinute = new Map<string, Window>()
  private perIpDay = new Map<string, Window>()
  private globalMinute: Window = { count: 0, resetAt: 0 }
  private globalDay: Window = { count: 0, resetAt: 0 }
  private limits: RateLimits

  constructor(
    limits: Partial<RateLimits> = {},
    private clock: () => number = Date.now
  ) {
    this.limits = { ...DEFAULT_LIMITS, ...limits }
  }

  /**
   * Returns retry-after seconds when limited, or null when allowed.
   *
   * Decide first, consume second. The previous version incremented every
   * bucket — including the two global ones — before testing any of them, so a
   * request that was ALREADY being refused still spent global quota. One
   * client ignoring its 429s could burn `globalPerDay` and take the assistant
   * offline for every legitimate visitor for the rest of the day, without ever
   * reaching the model. A refused request must cost nothing.
   */
  check(ip: string): number | null {
    const now = this.clock()
    this.prune(now)

    const minute = this.windowFor(this.perIpMinute, ip, now, MINUTE)
    const day = this.windowFor(this.perIpDay, ip, now, DAY)
    if (now >= this.globalMinute.resetAt) this.globalMinute = { count: 0, resetAt: now + MINUTE }
    if (now >= this.globalDay.resetAt) this.globalDay = { count: 0, resetAt: now + DAY }

    const refusal = this.overBudget(minute, day, now)
    if (refusal !== null) return refusal

    minute.count += 1
    day.count += 1
    this.globalMinute.count += 1
    this.globalDay.count += 1
    return null
  }

  private overBudget(minute: Window, day: Window, now: number): number | null {
    const after = (window: Window) => Math.max(1, Math.ceil((window.resetAt - now) / 1000))
    if (minute.count >= this.limits.ipPerMinute) return after(minute)
    if (this.globalMinute.count >= this.limits.globalPerMinute) return after(this.globalMinute)
    if (day.count >= this.limits.ipPerDay) return after(day)
    if (this.globalDay.count >= this.limits.globalPerDay) return after(this.globalDay)
    return null
  }

  /** The current window for an IP, created empty when absent. Never consumes. */
  private windowFor(map: Map<string, Window>, ip: string, now: number, span: number): Window {
    const current = map.get(ip)
    if (!current || now >= current.resetAt) {
      const fresh = { count: 0, resetAt: now + span }
      map.set(ip, fresh)
      return fresh
    }
    return current
  }

  /**
   * Bounded sweep. Deleting only EXPIRED entries past a threshold meant that
   * with 24h day-windows the map could never shrink, so once past the
   * threshold every request walked the whole map, forever, while it kept
   * growing. Now expired entries go first and a hard cap is enforced after,
   * dropping oldest-inserted (Map preserves insertion order) so the walk and
   * the memory are both bounded.
   */
  private prune(now: number): void {
    this.sweep(this.perIpMinute, now, 2_000)
    this.sweep(this.perIpDay, now, 10_000)
  }

  private sweep(map: Map<string, Window>, now: number, cap: number): void {
    if (map.size <= cap) return
    for (const [key, window] of map) if (now >= window.resetAt) map.delete(key)
    while (map.size > cap) {
      const oldest = map.keys().next()
      if (oldest.done) break
      map.delete(oldest.value)
    }
  }
}

/**
 * The client's address, from a header the client cannot choose.
 *
 * Taking `x-forwarded-for[0]` was wrong: proxies APPEND, so position 0 is the
 * value the caller supplied. Anyone could rotate it and get a fresh per-IP
 * budget on every request. Vercel's own `x-vercel-forwarded-for` is set by the
 * platform edge and is the value to trust; `x-real-ip` next; and if only
 * `x-forwarded-for` exists, the LAST element is the hop nearest us and the
 * only one a caller cannot forge.
 */
export function clientIp(req: VercelRequest): string {
  const header = (name: string): string | undefined => {
    const value = req.headers[name]
    return Array.isArray(value) ? value[0] : value
  }

  const trusted = header('x-vercel-forwarded-for') ?? header('x-real-ip')
  if (trusted?.trim()) return trusted.split(',')[0]!.trim()

  const chain = header('x-forwarded-for')
  if (chain?.trim()) {
    const hops = chain.split(',').map((hop) => hop.trim()).filter(Boolean)
    if (hops.length > 0) return hops[hops.length - 1]!
  }
  return 'unknown'
}

// ── Request / reply plumbing (exported for tests) ─────────────────────────
export function validateRequest(body: unknown): ChatRequest | null {
  const result = chatRequestSchema.safeParse(body)
  return result.success ? result.data : null
}

/**
 * The Messages API requires the conversation to open on a `user` turn. The
 * contract permits any role order, so a client sending an assistant-first
 * history produced an upstream 400 that surfaced as a generic 502 — after the
 * request had already passed the rate limiter and cost a round trip. Drop
 * leading assistant turns rather than rejecting: the history is a hint from
 * the client, not something to litigate with the visitor.
 */
export function buildMessages(request: ChatRequest): Anthropic.MessageParam[] {
  const history = [...request.history]
  while (history.length > 0 && history[0]!.role !== 'user') history.shift()
  return [
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    { role: 'user' as const, content: request.message }
  ]
}

/**
 * Parse and sanitize the model's structured output. Anything malformed and
 * any navigation target outside the allowlist degrades safely (null / []).
 */
export function parseModelReply(
  response: Anthropic.Message,
  allowlist: ReadonlySet<string>
): ChatReply | null {
  if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return null
  const text = response.content.find((block) => block.type === 'text')?.text
  if (!text) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  const result = chatReplySchema.safeParse(parsed)
  if (!result.success) return null
  return {
    reply: result.data.reply,
    navigateTo: validateNavigateTo(result.data.navigateTo, allowlist),
    // Filter BEFORE slicing: slicing first meant one empty suggestion in the
    // model's first three silently cost a chip that a later valid one could
    // have filled.
    suggested: result.data.suggested
      .filter((suggestion) => suggestion.length > 0 && suggestion.length <= 200)
      .slice(0, MAX_SUGGESTED)
  }
}

const FALLBACK_REPLY: ChatReply = {
  reply: 'Sorry — I could not produce a good answer to that. You can reach Chamroeun directly through the contact page.',
  navigateTo: '/contact',
  suggested: []
}

// ── Handler ───────────────────────────────────────────────────────────────
interface HandlerDeps {
  client: () => Anthropic
  limiter: RateLimiter
}

let sharedClient: Anthropic | null = null
const defaultDeps: HandlerDeps = {
  client: () => (sharedClient ??= new Anthropic({
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: MAX_RETRIES
  })),
  limiter: new RateLimiter()
}

export async function handleChat(
  req: VercelRequest,
  res: VercelResponse,
  deps: HandlerDeps = defaultDeps
): Promise<void> {
  // Conversations are transient and personal — never cache them anywhere.
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }
  if (!isAllowedOrigin(req.headers.origin as string | undefined)) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }
  // Byte length, not UTF-16 length: Khmer is 3 bytes per character.
  if (Buffer.byteLength(JSON.stringify(req.body ?? ''), 'utf8') > MAX_BODY_BYTES) {
    res.status(400).json({ error: 'Request too large.' })
    return
  }
  const request = validateRequest(req.body)
  if (!request) {
    res.status(400).json({ error: 'Invalid request.' })
    return
  }
  // Offline check BEFORE the limiter: an assistant that cannot answer should
  // not also spend the visitor's quota telling them so.
  if (!process.env.ANTHROPIC_API_KEY || !loaded) {
    res.status(503).json({ error: 'The assistant is offline right now — please email instead.' })
    return
  }
  const retryAfter = deps.limiter.check(clientIp(req))
  if (retryAfter !== null) {
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ error: 'Too many messages — please wait a moment.' })
    return
  }

  try {
    const response = await deps.client().messages.create({
      model: CHAT_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: [
        {
          type: 'text',
          text: loaded.systemPrompt,
          // 1h, not the 5-minute default. The prompt is ~15k tokens and
          // portfolio traffic does not sustain a hit every five minutes, so
          // the short TTL was paying the 1.25x write on most requests and
          // reading back on few — a surcharge dressed as an optimisation.
          // Watch `cached=` in the log line below to confirm.
          cache_control: { type: 'ephemeral', ttl: '1h' }
        }
      ],
      messages: buildMessages(request),
      output_config: { format: { type: 'json_schema', schema: CHAT_REPLY_JSON_SCHEMA } }
    })

    // Counters only — never message content (privacy promise on /colophon).
    // `stop=` matters: a max_tokens stop silently becomes FALLBACK_REPLY while
    // still costing a full generation, and used to be logged as plain "ok".
    console.log(
      `chat ok len=${request.message.length} in=${response.usage.input_tokens} out=${response.usage.output_tokens} cached=${response.usage.cache_read_input_tokens ?? 0} stop=${response.stop_reason ?? 'none'}`
    )

    res.status(200).json(parseModelReply(response, loaded.allowlist) ?? FALLBACK_REPLY)
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
      res.status(503).json({ error: 'The assistant is briefly unavailable — please try again shortly.' })
      return
    }
    console.error(`chat error: ${error instanceof Error ? error.name : 'unknown'}`)
    res.status(502).json({ error: 'The assistant could not answer — please try again or email instead.' })
  }
}

export default function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  return handleChat(req, res)
}
