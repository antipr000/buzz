import { apiClient } from "@/lib/api/client";
import type {
  BookingListResponse,
  PurchaseBody,
  PurchaseResponse,
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

/** POST /events/bookings — requires auth. */
export async function postListBookings(): Promise<BookingListResponse> {
  const { data } = await apiClient.post<BookingListResponse>(
    "/events/bookings",
    {}
  );
  return data;
}
