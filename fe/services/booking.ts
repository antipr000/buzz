import { apiClient } from "@/lib/api/client";
import type {
  BookingListResponse,
  OrganizerVerifyBookingBody,
  OrganizerVerifyBookingResponse,
  PurchaseBody,
  PurchaseResponse,
  VerifyRazorpayPaymentBody,
  VerifyRazorpayPaymentResponse,
} from "@/services/types/booking";

/** POST /events/purchase — requires auth. */
export async function postPurchase(
  body: PurchaseBody
): Promise<PurchaseResponse> {
  const { data } = await apiClient.post<PurchaseResponse>(
    "/events/purchase",
    body
  );
  return data;
}

/** POST /events/verify-razorpay-payment — requires auth. */
export async function postVerifyRazorpayPayment(
  body: VerifyRazorpayPaymentBody
): Promise<VerifyRazorpayPaymentResponse> {
  const { data } = await apiClient.post<VerifyRazorpayPaymentResponse>(
    "/events/verify-razorpay-payment",
    body
  );
  return data;
}

/** POST /events/bookings — requires auth. */
export async function postListBookings(): Promise<BookingListResponse> {
  const { data } = await apiClient.post<BookingListResponse>(
    "/events/bookings",
    {}
  );
  return data;
}

/** POST /events/{event_id}/verify-booking — requires auth; organizer only. */
export async function postVerifyBooking(
  eventId: string,
  body: OrganizerVerifyBookingBody
): Promise<OrganizerVerifyBookingResponse> {
  const path = `/events/${encodeURIComponent(eventId.trim())}/verify-booking`;
  const { data } = await apiClient.post<OrganizerVerifyBookingResponse>(
    path,
    body
  );
  return data;
}
