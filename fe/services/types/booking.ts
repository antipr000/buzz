/**
 * POST /events/purchase — aligned with `be/booking/schemas/booking_schemas.py` (snake_case JSON).
 */

import type { TicketTierValue } from "@/constants/ticketTiers";
import type { PurchasePaymentMethod } from "@/constants/paymentMethods";
import type { AddressCreatePayload } from "@/services/types/address";

export type { PurchasePaymentMethod } from "@/constants/paymentMethods";

/** `TicketLineIn` — `ticket_tier` matches `be/ticket/models/ticket.py` TicketTier */
export type PurchaseTicketLine = {
  ticket_tier: TicketTierValue;
  price: number;
  quantity: number;
};

/** `AddressIn` — same field set as saved-address create payload */
export type PurchaseAddressIn = AddressCreatePayload;

/** `PurchaseBody` */
export type PurchaseBody = {
  event_id: string;
  tickets: PurchaseTicketLine[];
  address: PurchaseAddressIn;
  payment_method: PurchasePaymentMethod;
};

/** `PurchaseResponse` */
export type PurchaseResponse = {
  booking_id: string;
  payment_id: string;
  amount: number;
  payment_status: string;
};
