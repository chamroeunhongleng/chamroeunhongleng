import type { VercelRequest, VercelResponse } from '@vercel/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import { RateLimiter, handleChat } from '../../api/chat'

// ── Test doubles ──────────────────────────────────────────────────────────
function makeReq(overrides: {
  method?: string
  origin?: string
  body?: unknown
  ip?: string
} = {}): VercelRequest {
  return {
    method: overrides.method ?? 'POST',
    headers: {
      ...(overrides.origin ? { origin: overrides.origin } : {}),
      ...(overrides.ip ? { 'x-forwarded-for': overrides.ip } : {})
    },
    body: overrides.body ?? { message: 'What are his skills?', history: [] }
  } as unknown as VercelRequest
}

interface ResCapture {
  res: VercelResponse
  status: () => number
  body: () => unknown
  headers: Record<string, string>
}

function makeRes(): ResCapture {
  let statusCode = 0
  let payload: unknown
  const headers: Record<string, string> = {}
  const res = {
    status(code: number) {
      statusCode = code
      return res
    },
    json(value: unknown) {
      payload = value
      return res
    },
    setHeader(key: string, value: string) {
      headers[key] = value
      return res
    }
  } as unknown as VercelResponse
  return { res, status: () => statusCode, body: () => payload, headers }
}

function modelResponse(overrides: {
  text?: string
  stopReason?: string
} = {}): unknown {
  return {
    stop_reason: overrides.stopReason ?? 'end_turn',
    content:
      overrides.text === undefined
        ? [
            {
              type: 'text',
              text: JSON.stringify({
                reply: 'He works on Khmer speech recognition.',
                navigateTo: '/projects/kaskor-asr',
                suggested: ['What are his skills?']
              })
            }
          ]
        : [{ type: 'text', text: overrides.text }],
    usage: { input_tokens: 10, output_tokens: 10, cache_read_input_tokens: 0 }
  }
}

function makeDeps(create: ReturnType<typeof vi.fn>) {
  return {
    client: () => ({ messages: { create } }) as unknown as Anthropic,
    limiter: new RateLimiter()
  }
}

beforeEach(() => {
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key-not-real')
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────
describe('handleChat request gate', () => {
  it('rejects non-POST methods', async () => {
    const capture = makeRes()
    await handleChat(makeReq({ method: 'GET' }), capture.res, makeDeps(vi.fn()))
    expect(capture.status()).toBe(405)
  })

  it('rejects foreign origins', async () => {
    const capture = makeRes()
    await handleChat(makeReq({ origin: 'https://evil.example' }), capture.res, makeDeps(vi.fn()))
    expect(capture.status()).toBe(403)
  })

  it('accepts the production origin and localhost', async () => {
    for (const origin of ['https://chamroeunhongleng.me', 'http://localhost:3000']) {
      const create = vi.fn().mockResolvedValue(modelResponse())
      const capture = makeRes()
      await handleChat(makeReq({ origin }), capture.res, makeDeps(create))
      expect(capture.status()).toBe(200)
    }
  })

  it('rejects an over-long message', async () => {
    const capture = makeRes()
    await handleChat(
      makeReq({ body: { message: 'x'.repeat(501), history: [] } }),
      capture.res,
      makeDeps(vi.fn())
    )
    expect(capture.status()).toBe(400)
  })

  it('rejects too much history', async () => {
    const capture = makeRes()
    await handleChat(
      makeReq({
        body: {
          message: 'hi',
          history: Array.from({ length: 7 }, () => ({ role: 'user', content: 'x' }))
        }
      }),
      capture.res,
      makeDeps(vi.fn())
    )
    expect(capture.status()).toBe(400)
  })

  it('rate limits after the per-IP minute budget', async () => {
    const create = vi.fn().mockResolvedValue(modelResponse())
    const deps = makeDeps(create)
    let lastStatus = 0
    for (let i = 0; i < 9; i++) {
      const capture = makeRes()
      await handleChat(makeReq({ ip: '203.0.113.7' }), capture.res, deps)
      lastStatus = capture.status()
    }
    expect(lastStatus).toBe(429)
    expect(create).toHaveBeenCalledTimes(8)
  })

  it('answers 503 with a friendly error when the key is missing', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    const capture = makeRes()
    await handleChat(makeReq(), capture.res, makeDeps(vi.fn()))
    expect(capture.status()).toBe(503)
  })
})

describe('handleChat model round-trip', () => {
  it('returns the parsed reply and passes an allowlisted navigateTo through', async () => {
    const create = vi.fn().mockResolvedValue(modelResponse())
    const capture = makeRes()
    await handleChat(makeReq(), capture.res, makeDeps(create))
    expect(capture.status()).toBe(200)
    expect(capture.body()).toMatchObject({
      reply: 'He works on Khmer speech recognition.',
      navigateTo: '/projects/kaskor-asr'
    })
  })

  it('nulls a navigateTo outside the allowlist', async () => {
    const create = vi.fn().mockResolvedValue(
      modelResponse({
        text: JSON.stringify({ reply: 'Sure.', navigateTo: '/admin', suggested: [] })
      })
    )
    const capture = makeRes()
    await handleChat(makeReq(), capture.res, makeDeps(create))
    expect(capture.status()).toBe(200)
    expect((capture.body() as { navigateTo: unknown }).navigateTo).toBeNull()
  })

  it('degrades to the canned fallback on a refusal', async () => {
    const create = vi.fn().mockResolvedValue(modelResponse({ stopReason: 'refusal' }))
    const capture = makeRes()
    await handleChat(makeReq(), capture.res, makeDeps(create))
    expect(capture.status()).toBe(200)
    expect((capture.body() as { navigateTo: unknown }).navigateTo).toBe('/contact')
  })

  it('degrades to the canned fallback on malformed model JSON', async () => {
    const create = vi.fn().mockResolvedValue(modelResponse({ text: 'not json at all' }))
    const capture = makeRes()
    await handleChat(makeReq(), capture.res, makeDeps(create))
    expect(capture.status()).toBe(200)
    expect((capture.body() as { navigateTo: unknown }).navigateTo).toBe('/contact')
  })

  it('answers 502 when the API call fails outright', async () => {
    const create = vi.fn().mockRejectedValue(new Error('boom'))
    const capture = makeRes()
    await handleChat(makeReq(), capture.res, makeDeps(create))
    expect(capture.status()).toBe(502)
  })

  it('sends a byte-identical cached system prompt on every call', async () => {
    const create = vi.fn().mockResolvedValue(modelResponse())
    const deps = makeDeps(create)
    await handleChat(makeReq(), makeRes().res, deps)
    await handleChat(makeReq(), makeRes().res, deps)
    const [first, second] = create.mock.calls.map(
      (call) => (call[0] as { system: Array<{ text: string, cache_control: unknown }> }).system[0]
    )
    expect(first!.text).toBe(second!.text)
    expect(first!.cache_control).toEqual({ type: 'ephemeral' })
  })
})

describe('RateLimiter', () => {
  it('separates IPs and recovers after the window', () => {
    let now = 0
    const limiter = new RateLimiter({ ipPerMinute: 2, ipPerDay: 100, globalPerMinute: 100 }, () => now)
    expect(limiter.check('a')).toBeNull()
    expect(limiter.check('a')).toBeNull()
    expect(limiter.check('a')).not.toBeNull()
    expect(limiter.check('b')).toBeNull()
    now += 61_000
    expect(limiter.check('a')).toBeNull()
  })
})
