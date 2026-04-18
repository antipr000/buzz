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
  /** ISO 4217; omit for server default (INR). */
  currency?: string;
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
  razorpay_order_id: string | null;
  razorpay_key_id: string | null;
  currency: string;
};

/** `VerifyRazorpayPaymentBody` — POST /events/verify-razorpay-payment */
export type VerifyRazorpayPaymentBody = {
  booking_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

/** `VerifyRazorpayPaymentResponse` */
export type VerifyRazorpayPaymentResponse = {
  verified: boolean;
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

/**
 * POST /events/{event_id}/verify-booking — aligned with
 * `OrganizerVerifyBookingBody` / `OrganizerVerifyBookingResponse` in
 * `be/booking/schemas/booking_schemas.py`.
 */
export type OrganizerVerifyBookingBody = {
  booking_id: string;
};

export type OrganizerVerifyBookingOutcome =
  | "checked_in"
  | "already_attended"
  | "pending_payment"
  | "payment_failed";

export type OrganizerVerifyBookingResponse = {
  outcome: OrganizerVerifyBookingOutcome;
  booking: BookingListItem;
};
