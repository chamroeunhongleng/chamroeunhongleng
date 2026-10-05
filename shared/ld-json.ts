/**
 * ld-json — serialize a JSON-LD payload for embedding inside <script>.
 *
 * `JSON.stringify` alone is NOT safe to drop into an HTML document: it leaves
 * `<` untouched, so a content string containing `</script>` would close the
 * block early and everything after it would be parsed as markup. Nothing in
 * `content/*.json` does that today and the zod schemas do not forbid it
 * either — which is exactly why the escaping belongs at the sink rather than
 * in a content rule.
 *
 * Each replacement is a JSON `\uXXXX` escape, so the value a JSON-LD consumer
 * parses is identical to the unescaped one: Google's structured-data parser,
 * `check:seo`, and the browser all see the same object.
 *
 * The pattern is built from a string rather than written as a regex literal
 * so U+2028/U+2029 stay as escape sequences — as literal characters they are
 * invisible in source and, being line terminators, would break a regex
 * literal outright. They are legal inside JSON strings but terminate a line
 * for older JS parsers, so they are escaped alongside the HTML-significant
 * characters.
 *
 * Not hashed by the CSP: `application/ld+json` is a DATA_TYPE in
 * scripts/lib/csp.ts, so changing this output moves no script-src hash.
 */
const UNSAFE_IN_HTML = new RegExp('[<>&\\u2028\\u2029]', 'g')

export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(
    UNSAFE_IN_HTML,
    (char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
  )
}
