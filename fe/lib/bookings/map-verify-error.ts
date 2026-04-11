import { isAxiosError } from 'axios'

const FALLBACK = 'Something went wrong. Please try again.'

/** FastAPI `HTTPException` → `{ detail: string }`. Other shapes use fallback. */
export function mapVerifyBookingError(err: unknown): string {
    if (!isAxiosError(err)) return FALLBACK

    const d = (err.response?.data as { detail?: unknown } | undefined)?.detail
    if (typeof d === 'string' && d.trim()) return d

    return FALLBACK
}
