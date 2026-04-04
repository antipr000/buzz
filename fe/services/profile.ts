import { apiClient } from "@/lib/api/client";
import type {
  ProfileAvatarUploadResponse,
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

const AVATAR_FILENAME: Partial<Record<string, string>> = {
  "image/png": "avatar.png",
  "image/webp": "avatar.webp",
  "image/jpeg": "avatar.jpg",
  "image/jpg": "avatar.jpg",
};

function resolveAvatarContentType(
  uri: string,
  mimeType: string | null | undefined
): string {
  const m = mimeType?.trim();
  if (m) return m;
  const u = uri.toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** Multipart upload of a local image URI (React Native). Requires auth. */
export async function uploadProfileAvatar(
  uri: string,
  mimeType: string | null | undefined
): Promise<ProfileAvatarUploadResponse> {
  const type = resolveAvatarContentType(uri, mimeType);
  const name = AVATAR_FILENAME[type] ?? "avatar.jpg";
  const form = new FormData();
  form.append("file", { uri, type, name } as unknown as Blob);

  // Expo Go + axios: keep multipart/form-data + transformRequest (axios#4885);
  const { data } = await apiClient.post<ProfileAvatarUploadResponse>(
    `${profileRoot}/profile/avatar`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (payload) => payload,
    }
  );
  return data;
}
