import { apiClient } from "@/lib/api/client";
import type {
  AddressCreatePayload,
  AddressListResponse,
  AddressOut,
  AddressPatchPayload,
} from "@/services/types/address";

/** GET /user/addresses — requires auth. */
export async function getAddresses(): Promise<AddressOut[]> {
  const { data } = await apiClient.get<AddressListResponse>("/user/addresses");
  return data.data;
}

/** GET /user/addresses/{addressId} — requires auth. */
export async function getAddress(addressId: string): Promise<AddressOut> {
  const { data } = await apiClient.get<AddressOut>(
    `/user/addresses/${encodeURIComponent(addressId)}`
  );
  return data;
}

/** POST /user/addresses — requires auth. */
export async function createAddress(
  body: AddressCreatePayload
): Promise<AddressOut> {
  const { data } = await apiClient.post<AddressOut>("/user/addresses", body);
  return data;
}

/**
 * PATCH /user/addresses/{addressId} — partial update; omit keys you do not change.
 * `undefined` values are stripped so axios does not send them.
 */
export async function patchAddress(
  addressId: string,
  patch: AddressPatchPayload
): Promise<AddressOut> {
  const body = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as AddressPatchPayload;
  const { data } = await apiClient.patch<AddressOut>(
    `/user/addresses/${encodeURIComponent(addressId)}`,
    body
  );
  return data;
}
