// JSON-LD for a <script> block: JSON.stringify leaves `<` alone, so `</script>` inside content
// would end the block early. Escapes are JSON \uXXXX, so consumers parse the identical value.

// A string, not a regex literal: U+2028/U+2029 are invisible line terminators that would break
// the literal. Output is not CSP-hashed (application/ld+json is a DATA_TYPE in scripts/lib/csp.ts).
const UNSAFE_IN_HTML = new RegExp('[<>&\\u2028\\u2029]', 'g')

export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(
    UNSAFE_IN_HTML,
    (char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
  )
}
