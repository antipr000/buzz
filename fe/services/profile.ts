import { apiClient } from "@/lib/api/client";
import type {
  ProfileMeResponse,
  ProfilePatchPayload,
  ProfileStatsResponse,
} from "@/services/types/profile";

/** Profile domain API — backend prefix is `/user`. */
export const profileRoot = "/user";

/** GET /user/profile — requires auth. */
export async function getProfileMe(): Promise<ProfileMeResponse> {
  const { data } = await apiClient.get<ProfileMeResponse>(
    `${profileRoot}/profile`
  );
  return data;
}

/**
 * PATCH /user/profile — partial update; only keys present in `patch` are sent.
 * Use `null` to clear nullable profile fields.
 */
export async function patchProfileMe(
  patch: ProfilePatchPayload
): Promise<ProfileMeResponse> {
  const body = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as ProfilePatchPayload;
  const { data } = await apiClient.patch<ProfileMeResponse>(
    `${profileRoot}/profile`,
    body
  );
  return data;
}

/** GET /user/profile/stats — requires auth. */
export async function getProfileStats(): Promise<ProfileStatsResponse> {
  const { data } = await apiClient.get<ProfileStatsResponse>(
    `${profileRoot}/profile/stats`
  );
  return data;
}
