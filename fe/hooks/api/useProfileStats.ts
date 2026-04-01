import { queryKeys } from "@/lib/query/query-keys";
import { getProfileStats } from "@/services/profile";
import { useQuery } from "@tanstack/react-query";

export function useProfileStats() {
  return useQuery({
    queryKey: queryKeys.profile.stats(),
    queryFn: getProfileStats,
  });
}
