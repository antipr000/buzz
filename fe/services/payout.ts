import { apiClient } from "@/lib/api/client";
import type {
  PayoutCreatePayload,
  PayoutListResponse,
  PayoutOut,
  PayoutPatchPayload,
} from "@/services/types/payout";

/** GET /user/payouts */
export async function getPayouts(): Promise<PayoutOut[]> {
  const { data } = await apiClient.get<PayoutListResponse>("/user/payouts");
  return data.data;
}

/** GET /user/payouts/{id} */
export async function getPayout(payoutId: string): Promise<PayoutOut> {
  const { data } = await apiClient.get<PayoutOut>(
    `/user/payouts/${encodeURIComponent(payoutId)}`
  );
  return data;
}

/** POST /user/payouts */
export async function createPayout(body: PayoutCreatePayload): Promise<PayoutOut> {
  const { data } = await apiClient.post<PayoutOut>("/user/payouts", body);
  return data;
}

/** PATCH /user/payouts/{id} */
export async function patchPayout(
  payoutId: string,
  patch: PayoutPatchPayload
): Promise<PayoutOut> {
  const body = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as PayoutPatchPayload;
  const { data } = await apiClient.patch<PayoutOut>(
    `/user/payouts/${encodeURIComponent(payoutId)}`,
    body
  );
  return data;
}

/** DELETE /user/payouts/{id} */
export async function deletePayout(payoutId: string): Promise<void> {
  await apiClient.delete(`/user/payouts/${encodeURIComponent(payoutId)}`);
}
