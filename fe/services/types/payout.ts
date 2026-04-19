/**
 * Payout bank accounts — aligned with `be/payouts/schemas/payout_schemas.py`.
 * API uses snake_case; `account_type` is `SAVINGS` | `CURRENT`.
 */

export type PayoutAccountTypeApi = "SAVINGS" | "CURRENT";

export type PayoutOut = {
  id: string;
  user_id: string;
  account_holder_name: string;
  bank_name: string | null;
  account_number_last4: string;
  ifsc_code: string;
  account_type: PayoutAccountTypeApi;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type PayoutListResponse = {
  data: PayoutOut[];
};

/** POST /user/payouts */
export type PayoutCreatePayload = {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: PayoutAccountTypeApi;
  bank_name?: string | null;
  is_primary?: boolean | null;
};

/** PATCH /user/payouts/{id} */
export type PayoutPatchPayload = Partial<PayoutCreatePayload>;
