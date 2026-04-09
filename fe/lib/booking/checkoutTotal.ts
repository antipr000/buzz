import type { PurchaseTicketLine } from '@/services/types/booking';

/** Sum of `price * quantity` for each line — same rule as `POST /events/purchase` server total. */
export function checkoutTotal(lines: PurchaseTicketLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
