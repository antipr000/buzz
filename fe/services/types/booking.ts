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

/** `PurchaseBody` — send exactly one of `address_id` (saved) or `address` (new). */
export type PurchaseBody = {
  event_id: string;
  tickets: PurchaseTicketLine[];
  payment_method: PurchasePaymentMethod;
} & (
  | { address_id: string; address?: never }
  | { address: PurchaseAddressIn; address_id?: never }
);

/** `PurchaseResponse` */
export type PurchaseResponse = {
  booking_id: string;
  payment_id: string;
  amount: number;
  payment_status: string;
};

/**
 * POST /events/bookings — aligned with `be/booking/schemas/booking_schemas.py`.
 * Datetimes are ISO strings in JSON.
 */

/** `TicketLineOut` */
export type BookingTicketLineOut = {
  ticket_tier: string;
  price: number;
  quantity: number;
  seats: string[];
};

/** `BookingListItem` */
export type BookingListItem = {
  id: string;
  event_id: string;
  booking_date: string;
  title: string;
  language: string | null;
  date: string;
  location: string;
  tickets: BookingTicketLineOut[];
  event_image: string | null;
  status: string;
};

/** `BookingListResponse` */
export type BookingListResponse = {
  data: BookingListItem[];
};
