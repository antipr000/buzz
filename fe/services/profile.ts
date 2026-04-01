import { apiClient } from "@/lib/api/client";
import type { ProfileStatsResponse } from "@/services/types/profile";

/** Profile domain API — backend prefix is `/user`. */
export const profileRoot = "/user";

/** GET /user/profile/stats — requires auth. */
export async function getProfileStats(): Promise<ProfileStatsResponse> {
  const { data } = await apiClient.get<ProfileStatsResponse>(
    `${profileRoot}/profile/stats`
  );
  return data;
}
