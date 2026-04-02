import { apiClient } from "@/lib/api/client";
import type { PurchaseBody, PurchaseResponse } from "@/services/types/booking";

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
