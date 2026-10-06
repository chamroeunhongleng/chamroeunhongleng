/** POST /api/chat — the site assistant's only backend, a Vercel function beside the static site.
 *  Privacy promise (widget and /colophon): nothing is stored, message content is never logged. */
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

/** In BYTES: a Khmer character is one UTF-16 unit but three UTF-8 bytes, so a limit measured
 *  with `.length` rejects legal Khmer conversations. Contract maximum plus room for JSON. */
const MAX_BODY_BYTES = (MAX_MESSAGE_LENGTH + MAX_HISTORY_ENTRIES * MAX_HISTORY_ENTRY_LENGTH) * 3 + 4096

/** vercel.json caps the function at 30s: (MAX_RETRIES + 1) × timeout + ~1s backoff must fit
 *  inside it, or the platform kills us before the catch block answers (bare 504, not 503). */
const REQUEST_TIMEOUT_MS = 12_000
const MAX_RETRIES = 1

/** Loaded once per cold instance. loadContent() resolves from process.cwd(): on Vercel that is
 *  /var/task, where vercel.json's `includeFiles: "content/**"` places the JSON files. */
const loaded = (() => {
  try {
    const { bundle } = loadContent()
    if (!bundle) return null
    return {
      systemPrompt: buildSystemPrompt(bundle),
      allowlist: buildNavAllowlist(bundle.projects)
    }
  } catch (error) {
    // Never silent: loadContent() nulls the bundle on any single schema error.
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
/** The team slug must stay in the preview pattern: `.vercel.app` is a shared namespace, so a
 *  prefix-only match admits `chamroeunhongleng-anything.vercel.app`, which anyone can register. */
const PRODUCTION_ALIAS = 'chamroeunhongleng-portfolio.vercel.app'
const PREVIEW_HOST = /^chamroeunhongleng-portfolio-[a-z0-9]+-chnai-lab\.vercel\.app$/

/** Browsers send Origin on every POST, so a missing header means a non-browser caller: 403.
 *  A tripwire, not a wall — the rate limiter and the Console spend limit are the real bounds. */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  const { hostname, protocol } = url

  // The dev server is http on an arbitrary port: scheme and port are free here and nowhere else.
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true

  // Hostname alone would accept `http://chamroeunhongleng.me` as readily as the real origin.
  if (protocol !== 'https:') return false

  return (
    hostname === 'chamroeunhongleng.me'
    || hostname === 'www.chamroeunhongleng.me'
    || hostname === PRODUCTION_ALIAS
    || PREVIEW_HOST.test(hostname)
  )
}

// ── Rate limiting ─────────────────────────────────────────────────────────
/** In-memory, so per function instance and reset on cold starts — a determined abuser can
 *  exceed them. Accepted (no KV store); the hard ceiling is the Anthropic Console spend limit. */
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
  /** Per instance, not per account: no defence against distributed abuse, and not to be described as one. */
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

  /** Retry-after seconds when limited, or null when allowed. Decide first, consume second: a
   *  refused request must cost no quota, or one client ignoring 429s could drain globalPerDay. */
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

  private windowFor(map: Map<string, Window>, ip: string, now: number, span: number): Window {
    const current = map.get(ip)
    if (!current || now >= current.resetAt) {
      const fresh = { count: 0, resetAt: now + span }
      map.set(ip, fresh)
      return fresh
    }
    return current
  }

  /** Expired entries first, then a hard cap dropping oldest-inserted (Map keeps insertion
   *  order), so with 24h windows both the walk and the memory stay bounded. */
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

/** Proxies APPEND to x-forwarded-for, so position 0 is caller-chosen and would buy a fresh per-IP
 *  budget per request. Trust the platform header first; failing that, the LAST hop. */
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

/** The Messages API requires the first turn to be `user`; the contract permits any order.
 *  Leading assistant turns are dropped, not rejected — the history is a hint, not a contract. */
export function buildMessages(request: ChatRequest): Anthropic.MessageParam[] {
  const history = [...request.history]
  while (history.length > 0 && history[0]!.role !== 'user') history.shift()
  return [
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    { role: 'user' as const, content: request.message }
  ]
}

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
    // Filter before slicing, or an empty suggestion among the first three costs a chip.
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

/** `error.name` is "Error" for every SDK failure; status + API error type tell an expired key,
 *  an empty balance and a malformed request apart. The message is tested, never logged. */
export function describeUpstreamError(error: unknown): string {
  if (!(error instanceof Anthropic.APIError)) {
    return error instanceof Error ? `${error.name} (not an API response)` : 'unknown'
  }
  const body = error.error as { error?: { type?: unknown } } | undefined
  const type = typeof body?.error?.type === 'string' ? body.error.type : 'none'
  const credit = /credit balance/i.test(error.message) ? ' reason=credit' : ''
  return `status=${error.status ?? 'none'} type=${type}${credit}`
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
  if (Buffer.byteLength(JSON.stringify(req.body ?? ''), 'utf8') > MAX_BODY_BYTES) {
    res.status(400).json({ error: 'Request too large.' })
    return
  }
  const request = validateRequest(req.body)
  if (!request) {
    res.status(400).json({ error: 'Invalid request.' })
    return
  }
  // Before the limiter: an offline assistant must not also spend the visitor's quota.
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
          // 1h, not the 5-minute default: portfolio traffic cannot sustain a hit every five
          // minutes, so the short TTL paid the 1.25x cache write on most requests and read on few.
          cache_control: { type: 'ephemeral', ttl: '1h' }
        }
      ],
      messages: buildMessages(request),
      output_config: { format: { type: 'json_schema', schema: CHAT_REPLY_JSON_SCHEMA } }
    })

    // Counters only — never message content (privacy promise on /colophon). `stop=` shows a
    // max_tokens stop, which becomes FALLBACK_REPLY while still costing a full generation.
    console.log(
      `chat ok len=${request.message.length} in=${response.usage.input_tokens} out=${response.usage.output_tokens} cached=${response.usage.cache_read_input_tokens ?? 0} stop=${response.stop_reason ?? 'none'}`
    )

    res.status(200).json(parseModelReply(response, loaded.allowlist) ?? FALLBACK_REPLY)
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
      res.status(503).json({ error: 'The assistant is briefly unavailable — please try again shortly.' })
      return
    }
    console.error(`chat error: ${describeUpstreamError(error)}`)
    res.status(502).json({ error: 'The assistant could not answer — please try again or email instead.' })
  }
}

export default function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  return handleChat(req, res)
}
