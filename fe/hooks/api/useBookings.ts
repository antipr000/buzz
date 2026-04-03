import { queryKeys } from "@/lib/query/query-keys";
import { useAuth } from "@/providers/AuthProvider";
import { postListBookings } from "@/services/booking";
import { useQuery } from "@tanstack/react-query";

/** POST /events/bookings — list current user's bookings. */
export function useBookings() {
  const { session, isLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.events.bookings(),
    queryFn: () => postListBookings(),
    enabled: !isLoading && Boolean(session),
  });
}
