const MINOR_WORDS = new Set(['of', 'the', 'for', 'and', 'at', 'in'])

/** A stated "(AUPP)" wins; otherwise initials of the leading clause ("Fort Hays State University" → FHSU). */
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
