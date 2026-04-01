import { queryKeys } from "@/lib/query/query-keys";
import { getProfileMe } from "@/services/profile";
import { useQuery } from "@tanstack/react-query";

export function useProfileMe() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: getProfileMe,
  });
}
