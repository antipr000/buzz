/** GET /user/profile/stats — matches `be/profile/schemas/stats.py`. */

/** GET/PATCH /user/profile — matches `be/profile/schemas/detail.py` (enums as JSON strings). */
export type ProfileIdentify = "Man" | "Woman" | "Other";
export type MaritalStatus = "Single" | "Married";

/** GET /user/profile response; `birthday` is ISO date `YYYY-MM-DD` or null. */
export type ProfileMeResponse = {
  id: string;
  email: string;
  full_name: string;
  birthday: string | null;
  identify: ProfileIdentify | null;
  marital_status: MaritalStatus | null;
  mobile_number: string | null;
  profile_image: string | null;
  whatsapp_notifications_enabled: boolean;
};

/** POST /user/profile/avatar — matches `be/profile/schemas/detail.py`. */
export type ProfileAvatarUploadResponse = {
  public_url: string;
};

/** PATCH /user/profile body — only include keys you want to change; omit others (partial update). */
export type ProfilePatchPayload = Partial<{
  full_name: string;
  birthday: string | null;
  identify: ProfileIdentify | null;
  marital_status: MaritalStatus | null;
  mobile_number: string | null;
  profile_image: string | null;
  whatsapp_notifications_enabled: boolean;
}>;

export type UserBriefOut = {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
};

export type StatsOut = {
  events_attended: number;
  saved_events: number;
  events_created: number;
};

export type ProfileStatsResponse = {
  user: UserBriefOut;
  stats: StatsOut;
};
