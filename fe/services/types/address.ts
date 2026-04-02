/**
 * User saved addresses — matches `be/address/schemas/address_schemas.py`.
 * API uses snake_case; `address_type` response values are "Home" | "Work" | "Other".
 * Create/patch may send lowercase ("home" | "work" | "other") per backend validator.
 */

export type AddressType = "Home" | "Work" | "Other";

export type AddressOut = {
  id: string;
  user_id: string;
  address_type: AddressType;
  first_name: string;
  last_name: string;
  mobile_number: string;
  email_id: string;
  pin_code: number;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  created_at: string;
  updated_at: string;
};

export type AddressListResponse = {
  data: AddressOut[];
};

/** POST /user/addresses */
export type AddressCreatePayload = {
  first_name: string;
  last_name: string;
  mobile_number: string;
  email_id: string;
  pin_code: number;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  /** Backend accepts "home" | "work" | "other" (case-insensitive) or enum labels. */
  address_type: string;
};

/** PATCH /user/addresses/{id} — only send fields to change. */
export type AddressPatchPayload = Partial<AddressCreatePayload>;
