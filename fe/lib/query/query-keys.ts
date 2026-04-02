/**
 * Query keys for TanStack Query — aligned with backend routers under `/api/v1`.
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

  profile: {
    all: ["profile"] as const,
    /** GET /user/profile */
    me: () => [...queryKeys.profile.all, "me"] as const,
    /** GET /user/profile/stats */
    stats: () => [...queryKeys.profile.all, "stats"] as const,
  },

  /** GET/PATCH /user/addresses — same `/user` prefix as profile. */
  addresses: {
    all: ["user", "addresses"] as const,
    list: () => [...queryKeys.addresses.all, "list"] as const,
    /** `null` when the hook is disabled (no id yet). */
    detail: (id: string | null) => [...queryKeys.addresses.all, "detail", id] as const,
  },
} as const;
