/**
 * Placeholder-marker grammar — the single definition used by UI components,
 * the content rule engine, the build gate, and tests.
 *
 * Markers live INSIDE content string values so they cannot drift from the
 * text they annotate:
 *
 *   [DEMO] free text                        demonstration-only content
 *   [PLACEHOLDER: what belongs here]        structural placeholder
 *   [OWNER_INPUT_REQUIRED: question]        owner must answer (see OWNER_INPUT.md)
 *   [REPLACE_BEFORE_PRODUCTION: note]       allowed in review, fatal in production
 *
 * Detection always walks PARSED content values — never raw source text.
 */

export const MARKER_TYPES = [
  'DEMO',
  'PLACEHOLDER',
  'OWNER_INPUT_REQUIRED',
  'REPLACE_BEFORE_PRODUCTION'
] as const
export type MarkerType = (typeof MARKER_TYPES)[number]

export interface Marker {
  type: MarkerType
  /** The note inside the marker, if any. */
  note: string
}

const MARKER_RE = /\[(DEMO|PLACEHOLDER|OWNER_INPUT_REQUIRED|REPLACE_BEFORE_PRODUCTION)(?::\s*([^\]]*))?\]/g

/** Find every marker in a string value. */
export function findMarkers(value: string): Marker[] {
  const found: Marker[] = []
  for (const m of value.matchAll(MARKER_RE)) {
    found.push({ type: m[1] as MarkerType, note: (m[2] ?? '').trim() })
  }
  return found
}

export function hasMarker(value: string, type?: MarkerType): boolean {
  const markers = findMarkers(value)
  return type ? markers.some((m) => m.type === type) : markers.length > 0
}

/**
 * Remove markers from a string for display. Placeholder-style markers are
 * replaced by their note text (the UI renders the marker itself as a chip).
 */
export function stripMarkers(value: string): string {
  return value
    .replace(MARKER_RE, (_all, type: string, note?: string) =>
      type === 'DEMO' ? '' : (note ?? '').trim()
    )
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Split a string into renderable segments so components can show marker
 * chips inline without dangerous HTML injection.
 */
export type TextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'marker'; marker: Marker }

export function segmentText(value: string): TextSegment[] {
  const segments: TextSegment[] = []
  let last = 0
  for (const m of value.matchAll(MARKER_RE)) {
    const index = m.index ?? 0
    if (index > last) segments.push({ kind: 'text', text: value.slice(last, index) })
    segments.push({
      kind: 'marker',
      marker: { type: m[1] as MarkerType, note: (m[2] ?? '').trim() }
    })
    last = index + m[0].length
  }
  if (last < value.length) segments.push({ kind: 'text', text: value.slice(last) })
  return segments
}

/** Recursively collect markers from parsed JSON, with JSON-path locations. */
export function collectMarkers(
  value: unknown,
  path = '$'
): Array<{ path: string; marker: Marker }> {
  const found: Array<{ path: string; marker: Marker }> = []
  if (typeof value === 'string') {
    for (const marker of findMarkers(value)) found.push({ path, marker })
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => found.push(...collectMarkers(item, `${path}[${i}]`)))
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      found.push(...collectMarkers(child, `${path}.${key}`))
    }
  }
  return found
}
