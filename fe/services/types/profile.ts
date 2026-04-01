/** GET /user/profile/stats — matches `be/profile/schemas/stats.py`. */

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
