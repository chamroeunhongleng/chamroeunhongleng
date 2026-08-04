import { describe, expect, it } from 'vitest'
import { collectMarkers, findMarkers, segmentText, stripMarkers } from '../shared/markers'

describe('marker grammar', () => {
  it('finds typed markers with notes', () => {
    const markers = findMarkers('Intro [OWNER_INPUT_REQUIRED: Confirm email] outro')
    expect(markers).toEqual([{ type: 'OWNER_INPUT_REQUIRED', note: 'Confirm email' }])
  })

  it('finds bare DEMO markers', () => {
    expect(findMarkers('[DEMO] Sample text')).toEqual([{ type: 'DEMO', note: '' }])
  })

  it('ignores non-marker brackets', () => {
    expect(findMarkers('See [RFC 2119] and [citation needed]')).toEqual([])
  })

  it('strips DEMO markers and substitutes placeholder notes', () => {
    expect(stripMarkers('[DEMO] Hello')).toBe('Hello')
    expect(stripMarkers('Start [PLACEHOLDER: middle bit] end')).toBe('Start middle bit end')
  })

  it('segments text around markers for safe rendering', () => {
    const segments = segmentText('Before [PLACEHOLDER: thing] after')
    expect(segments).toHaveLength(3)
    expect(segments[0]).toEqual({ kind: 'text', text: 'Before ' })
    expect(segments[1]).toMatchObject({ kind: 'marker', marker: { type: 'PLACEHOLDER' } })
    expect(segments[2]).toEqual({ kind: 'text', text: ' after' })
  })

  it('collects markers recursively with JSON paths', () => {
    const found = collectMarkers(
      { a: '[DEMO] x', b: { c: ['clean', '[PLACEHOLDER: y]'] } },
      'root'
    )
    expect(found.map((f) => f.path)).toEqual(['root.a', 'root.b.c[1]'])
  })
})
