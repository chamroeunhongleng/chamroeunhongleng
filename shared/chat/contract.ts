/**
 * The chat assistant's wire contract — shared by the serverless function
 * (api/chat.ts), the widget composable, and the tests, so the three can
 * never disagree about what travels over POST /api/chat.
 */
import { z } from 'zod'

/** Hard input caps — mirrored client-side so honest visitors never hit 400. */
export const MAX_MESSAGE_LENGTH = 500
export const MAX_HISTORY_ENTRIES = 6
export const MAX_HISTORY_ENTRY_LENGTH = 1000

export const chatRequestSchema = z.strictObject({
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  history: z
    .array(
      z.strictObject({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(MAX_HISTORY_ENTRY_LENGTH)
      })
    )
    .max(MAX_HISTORY_ENTRIES)
    .default([])
})
export type ChatRequest = z.infer<typeof chatRequestSchema>

export const chatReplySchema = z.object({
  reply: z.string().min(1),
  navigateTo: z.string().nullable(),
  suggested: z.array(z.string()).default([])
})
export type ChatReply = z.infer<typeof chatReplySchema>

/**
 * The structured-output JSON Schema sent to the Claude API. Must stay in
 * agreement with chatReplySchema above. Kept free of unsupported keywords
 * (minLength/maxItems) — soft limits ride in the descriptions and the
 * server truncates on the way out.
 */
export const CHAT_REPLY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description:
        "Answer in the visitor's language, 2-5 short sentences, grounded only in the FACTS section."
    },
    navigateTo: {
      type: ['string', 'null'],
      description:
        'Exactly one path copied verbatim from ALLOWED DESTINATIONS that best supports the answer, or null if none clearly applies.'
    },
    suggested: {
      type: 'array',
      items: { type: 'string' },
      description: '0-3 short follow-up questions the visitor might ask next.'
    }
  },
  required: ['reply', 'navigateTo', 'suggested'],
  additionalProperties: false
} as const
