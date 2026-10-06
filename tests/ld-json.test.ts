import { describe, expect, it } from 'vitest'
import { ldJson } from '../shared/ld-json'

/** The two line-separator code points, built without literal characters. */
const LS = String.fromCharCode(0x2028)
const PS = String.fromCharCode(0x2029)

describe('ldJson', () => {
  it('escapes a </script> breakout attempt', () => {
    const out = ldJson({ name: 'X</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
    expect(out).toContain('\\u003c')
  })

  it('escapes every HTML-significant character', () => {
    const out = ldJson({ a: '<', b: '>', c: '&' })
    expect(out).toBe('{"a":"\\u003c","b":"\\u003e","c":"\\u0026"}')
  })

  it('escapes U+2028 and U+2029', () => {
    expect(ldJson({ a: LS, b: PS })).toBe('{"a":"\\u2028","b":"\\u2029"}')
  })

  // Why \uXXXX escapes rather than stripping: a consumer must see exactly the published object.
  it('round-trips to the identical object', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'A & B </script>',
      'sameAs': ['https://example.com/?a=1&b=2'],
      'sep': `x${LS}y`
    }
    expect(JSON.parse(ldJson(payload))).toEqual(payload)
  })

  it('leaves payloads with nothing to escape byte-identical to JSON.stringify', () => {
    const payload = { '@type': 'WebSite', 'name': 'Chamroeun Hongleng' }
    expect(ldJson(payload)).toBe(JSON.stringify(payload))
  })
})
