/**
 * Query keys for TanStack Query — events only for now (matches be/event/routes).
 */

/** Primitive tuple for stable GET /events/discover cache identity */
export type DiscoverQueryKeyInput = {
  lat: number;
  lng: number;
  radius: number;
  category?: string | null;
  cursor?: string | null;
  limit?: number;
};

export const queryKeys = {
  events: {
    all: ["events"] as const,

    /** GET /events/discover */
    discover: (p: DiscoverQueryKeyInput) =>
      [
        ...queryKeys.events.all,
        "discover",
        p.lat,
        p.lng,
        p.radius,
        p.category ?? null,
        p.cursor ?? null,
        p.limit ?? 20,
      ] as const,

    /** GET /events/saved — include cursor, limit */
    saved: (params: Record<string, unknown>) =>
      [...queryKeys.events.all, "saved", params] as const,

    /** POST /events/bookings — include body filters when you use them */
    bookings: (body: Record<string, unknown>) =>
      [...queryKeys.events.all, "bookings", body] as const,

    details: () => [...queryKeys.events.all, "detail"] as const,
    /** Reserved for a future GET-by-id or hydrated card */
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },
} as const;
