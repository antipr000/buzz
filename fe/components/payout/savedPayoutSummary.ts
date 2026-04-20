import type { PayoutOut } from "@/services/types/payout";

/** One-line description for lists and delete confirmations. */
export function savedPayoutSummary(row: PayoutOut): string {
  const bank = row.bank_name?.trim();
  const tail = `${row.ifsc_code} · ****${row.account_number_last4}`;
  if (bank) return `${bank} · ${tail}`;
  return `${row.account_holder_name} · ${tail}`;
}
