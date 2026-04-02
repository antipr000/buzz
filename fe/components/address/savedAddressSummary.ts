import type { AddressOut } from "@/services/types/address";

export function savedAddressSummary(row: AddressOut): string {
  return `${row.address_type} · ${row.city} · ${row.pin_code}`;
}
