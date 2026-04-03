import type { AddressOut } from "@/services/types/address";
import type { PurchaseAddressIn } from "@/services/types/booking";

/** Map saved profile address → `POST /events/purchase` `address` body. */
export function addressOutToPurchasePayload(row: AddressOut): PurchaseAddressIn {
  return {
    first_name: row.first_name,
    last_name: row.last_name,
    mobile_number: row.mobile_number,
    email_id: row.email_id,
    pin_code: row.pin_code,
    address_line1: row.address_line1,
    address_line2: row.address_line2 ?? undefined,
    landmark: row.landmark ?? undefined,
    city: row.city,
    state: row.state,
    country: row.country,
    address_type: row.address_type.toLowerCase(),
  };
}
