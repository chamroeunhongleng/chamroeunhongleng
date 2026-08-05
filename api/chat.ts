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
  chatReplySchema,
  chatRequestSchema,
  type ChatReply,
  type ChatRequest
} from '../shared/chat/contract.js'
import { buildNavAllowlist, validateNavigateTo } from '../shared/chat/navigation.js'
import { buildSystemPrompt } from '../shared/chat/knowledge.js'

export const CHAT_MODEL = 'claude-haiku-4-5'
const MAX_OUTPUT_TOKENS = 1024
const MAX_BODY_BYTES = 16 * 1024
const MAX_SUGGESTED = 3

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
  } catch {
    return null
  }
})()

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
    || host.endsWith('.vercel.app')
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
  /** Instance-wide daily budget brake against distributed abuse. */
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

  /** Returns retry-after seconds when limited, or null when allowed. */
  check(ip: string): number | null {
    const now = this.clock()
    this.prune(now)
    const minute = this.bump(this.perIpMinute, ip, now, MINUTE)
    const day = this.bump(this.perIpDay, ip, now, DAY)
    if (now >= this.globalMinute.resetAt) this.globalMinute = { count: 0, resetAt: now + MINUTE }
    this.globalMinute.count += 1
    if (now >= this.globalDay.resetAt) this.globalDay = { count: 0, resetAt: now + DAY }
    this.globalDay.count += 1

    if (minute.count > this.limits.ipPerMinute || this.globalMinute.count > this.limits.globalPerMinute) {
      return Math.ceil((minute.resetAt - now) / 1000)
    }
    if (day.count > this.limits.ipPerDay || this.globalDay.count > this.limits.globalPerDay) {
      return Math.ceil((day.resetAt - now) / 1000)
    }
    return null
  }

  private bump(map: Map<string, Window>, ip: string, now: number, span: number): Window {
    const current = map.get(ip)
    if (!current || now >= current.resetAt) {
      const fresh = { count: 1, resetAt: now + span }
      map.set(ip, fresh)
      return fresh
    }
    current.count += 1
    return current
  }

  private prune(now: number): void {
    if (this.perIpMinute.size > 1000) {
      for (const [key, win] of this.perIpMinute) if (now >= win.resetAt) this.perIpMinute.delete(key)
    }
    if (this.perIpDay.size > 5000) {
      for (const [key, win] of this.perIpDay) if (now >= win.resetAt) this.perIpDay.delete(key)
    }
  }
}

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return first?.split(',')[0]?.trim() || 'unknown'
}

// ── Request / reply plumbing (exported for tests) ─────────────────────────
export function validateRequest(body: unknown): ChatRequest | null {
  const result = chatRequestSchema.safeParse(body)
  return result.success ? result.data : null
}

export function buildMessages(request: ChatRequest): Anthropic.MessageParam[] {
  return [
    ...request.history.map((h) => ({ role: h.role, content: h.content })),
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
    suggested: result.data.suggested.slice(0, MAX_SUGGESTED).filter((s) => s.length > 0 && s.length <= 200)
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
  client: () => (sharedClient ??= new Anthropic()),
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
  if (JSON.stringify(req.body ?? '').length > MAX_BODY_BYTES) {
    res.status(400).json({ error: 'Request too large.' })
    return
  }
  const request = validateRequest(req.body)
  if (!request) {
    res.status(400).json({ error: 'Invalid request.' })
    return
  }
  const retryAfter = deps.limiter.check(clientIp(req))
  if (retryAfter !== null) {
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ error: 'Too many messages — please wait a moment.' })
    return
  }
  if (!process.env.ANTHROPIC_API_KEY || !loaded) {
    res.status(503).json({ error: 'The assistant is offline right now — please email instead.' })
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
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: buildMessages(request),
      output_config: { format: { type: 'json_schema', schema: CHAT_REPLY_JSON_SCHEMA } }
    } as Anthropic.MessageCreateParamsNonStreaming)

    // Counters only — never message content (privacy promise on /colophon).
    console.log(
      `chat ok len=${request.message.length} in=${response.usage.input_tokens} out=${response.usage.output_tokens} cached=${response.usage.cache_read_input_tokens ?? 0}`
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
