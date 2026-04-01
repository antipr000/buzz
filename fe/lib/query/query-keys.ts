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

/** Stable key for GET /events/saved infinite query (cursor is pageParam, not in key). */
export type SavedQueryKeyInput = {
  limit: number;
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

    /** GET /events/saved */
    saved: (p: SavedQueryKeyInput) =>
      [...queryKeys.events.all, "saved", p.limit] as const,

    /** POST /events/bookings — include body filters when you use them */
    bookings: (body: Record<string, unknown>) =>
      [...queryKeys.events.all, "bookings", body] as const,

    /** Prefix for GET /events/{id} keys */
    details: () => [...queryKeys.events.all, "detail"] as const,
    /** GET /events/{id} */
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },
} as const;
