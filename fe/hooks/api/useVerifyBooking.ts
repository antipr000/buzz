import { queryKeys } from "@/lib/query/query-keys";
import { postVerifyBooking } from "@/services/booking";
import type { OrganizerVerifyBookingResponse } from "@/services/types/booking";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type VerifyBookingVariables = {
  eventId: string;
  booking_id: string;
};

/** POST /events/{event_id}/verify-booking */
export function useVerifyBooking() {
  const queryClient = useQueryClient();

  return useMutation<
    OrganizerVerifyBookingResponse,
    unknown,
    VerifyBookingVariables
  >({
    mutationFn: ({ eventId, booking_id }) =>
      postVerifyBooking(eventId, { booking_id: booking_id.trim() }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.events.organizerVerifyPreview(
          variables.eventId,
          data.booking.id
        ),
        data
      );
    },
  });
}
