/**
 * Normalizes Expo Router `useLocalSearchParams` values, which may be `string | string[]`.
 * Returns a single trimmed string, or `undefined` if missing or blank after trim.
 */
export function firstParamString(
    v: string | string[] | undefined | null
): string | undefined {
    if (v == null) return undefined
    const raw = Array.isArray(v) ? v[0] : v
    if (typeof raw !== 'string') return undefined
    const t = raw.trim()
    return t !== '' ? t : undefined
}
