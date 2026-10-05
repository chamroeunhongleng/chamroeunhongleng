// Words that carry no identity in an institution name.
const MINOR_WORDS = new Set(['of', 'the', 'for', 'and', 'at', 'in'])

/**
 * The short form of an institution name, e.g. "AUPP" or "FHSU".
 *
 * Prefers an abbreviation the content already states ("… (AUPP)"); otherwise
 * builds initials from the significant words of the leading clause, so
 * "Fort Hays State University" reads FHSU. Used by InstitutionMark, the
 * typographic plaque that stands in for a school logo.
 */
export function institutionAbbreviation(institution: string): string {
  const stated = institution.match(/\(([A-Za-z]{2,6})\)/)
  if (stated?.[1]) return stated[1].toUpperCase()

  const leadClause = institution.split(',')[0] ?? institution
  return leadClause
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !MINOR_WORDS.has(word.toLowerCase()))
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4)
}
