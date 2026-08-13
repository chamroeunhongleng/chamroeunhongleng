/**
 * zod-config — one global setting, applied before any schema is parsed.
 *
 * Zod decides whether to JIT-compile its validators by probing for dynamic
 * code evaluation: `new Function("")` inside a try/catch. This site's CSP
 * ships no 'unsafe-eval', so the probe is refused. Zod swallows the throw and
 * falls back to its interpreted path, and validation is completely unaffected
 * — but the browser still reports the refusal as a securitypolicyviolation,
 * which shows up in DevTools as an error on a page where nothing is wrong.
 *
 * `jitless` tells Zod not to probe at all. From Zod's own source
 * (v4/core/util.ts, `allowsEval`):
 *
 *   "Skip the probe under `jitless`: strict CSPs report the caught
 *    `new Function` as a `securitypolicyviolation` even though the throw is
 *    swallowed."
 *
 * Only the execution strategy changes; parse results, coercions and error
 * shapes are identical. In the browser this costs nothing, because the CSP
 * had already forced the interpreted path. On the server it trades a JIT
 * compile for interpretation on payloads that top out at a 500-character
 * message, which is not a tradeoff worth splitting into two configurations.
 *
 * Import this from any module that defines or parses a schema, above the
 * schema definitions — module imports evaluate first, so the setting is in
 * place before the first parse.
 */
import { z } from 'zod'

z.config({ jitless: true })
