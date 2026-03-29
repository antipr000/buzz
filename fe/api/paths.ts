/**
 * Path segments relative to the API base URL (set EXPO_PUBLIC_API_URL to include /api/v1).
 * Matches FastAPI routers mounted in be/main.py.
 */
export const apiPaths = {
  events: "/events",
  users: "/users",
  /** Backend profile router uses prefix /user */
  profile: "/user",
  payments: "/payments",
} as const;
