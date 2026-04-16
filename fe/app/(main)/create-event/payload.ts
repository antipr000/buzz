/**
 * Colocated with the create-event route: form → `POST /events/create` helpers.
 * Shared by this screen, `CreateEventDateTimeRow` (iOS/Android), and the API call.
 * Submit rules include a required event cover (`isCreateEventFormSubmittable` `hasEventCover`)
 * and event date on or after local today (`isCreateEventDateAllowed`), matching the API.
 *
 * API date/time use the device’s local calendar and clock (IST for typical
 * Indian users). Display uses `en-IN` for consistent India-first copy.
 */
import type { PickedLocation } from '@/components/create-event/LocationField';
import type { EventCategoryLabel } from '@/constants/eventCategories';
import { TICKET_TIER_VALUES, type TicketTierValue } from '@/constants/ticketTiers';
import type { CreateEventBody } from '@/services/types/events';

const DISPLAY_LOCALE = 'en-IN';

export type CreateEventPricingMode = 'single' | 'tiered';

export type CreateEventFormState = {
  title: string;
  description: string;
  category: EventCategoryLabel | null;
  pricingMode: CreateEventPricingMode;
  /** Used when `pricingMode === 'single'`. */
  priceText: string;
  /** Single-price: multiline amenities; one line per item (matches API `amenities`). */
  singleAmenitiesText: string;
  /** Tiered: price inputs per fixed tier (Standard / Premium / VIP). */
  tierPriceText: Record<TicketTierValue, string>;
  /** Tiered: multiline amenities; one line per bullet on the event page. */
  tierAmenitiesText: Record<TicketTierValue, string>;
  eventDate: Date;
  eventTime: Date;
};

/**
 * Split tier amenities textarea into separate items: each newline starts the next bullet.
 * Trims each line and drops blank lines so stray Enter keys do not create empty bullets.
 */
export function linesToAmenityArray(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Event day (local calendar) must be today or later — matches server `date >= today`. */
export function isCreateEventDateAllowed(eventDate: Date): boolean {
  const day = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  day.setHours(0, 0, 0, 0);
  return day.getTime() >= today.getTime();
}

/** Local calendar date → API `date` (YYYY-MM-DD). */
export function formatLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local time → API `time` (HH:MM:SS). */
export function formatLocalTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${min}:${s}`;
}

export function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString(DISPLAY_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDisplayTime(d: Date): string {
  return d.toLocaleTimeString(DISPLAY_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Non-negative integer; empty is invalid for submit (use "0" for free). */
export function parsePriceInt(text: string): number | null {
  const t = text.trim();
  if (t === '') return null;
  if (!/^\d+$/.test(t)) return null;
  const n = Number.parseInt(t, 10);
  if (n < 0) return null;
  return n;
}

/**
 * Pricing must match the selected mode: single → one valid ticket price and at least one amenity
 * line; tiered → valid integer price for Standard, Premium, and VIP (use 0 for a free tier),
 * and at least one amenity line per tier (non-empty after trim; blank lines do not count).
 */
export function isPricingCompleteForSubmit(form: CreateEventFormState): boolean {
  if (form.pricingMode === 'single') {
    if (parsePriceInt(form.priceText) === null) return false;
    return linesToAmenityArray(form.singleAmenitiesText).length > 0;
  }
  const pricesOk = TICKET_TIER_VALUES.every(
    (tier) => parsePriceInt(form.tierPriceText[tier]) !== null
  );
  if (!pricesOk) return false;
  return TICKET_TIER_VALUES.every(
    (tier) => linesToAmenityArray(form.tierAmenitiesText[tier]).length > 0
  );
}

function tierDetailsFromForm(form: CreateEventFormState): CreateEventBody['tier_details'] | null {
  const Standard = parsePriceInt(form.tierPriceText.Standard);
  const Premium = parsePriceInt(form.tierPriceText.Premium);
  const VIP = parsePriceInt(form.tierPriceText.VIP);
  if (Standard === null || Premium === null || VIP === null) return null;
  return {
    Standard: {
      price: Standard,
      amenities: linesToAmenityArray(form.tierAmenitiesText.Standard),
    },
    Premium: {
      price: Premium,
      amenities: linesToAmenityArray(form.tierAmenitiesText.Premium),
    },
    VIP: {
      price: VIP,
      amenities: linesToAmenityArray(form.tierAmenitiesText.VIP),
    },
  };
}

export function buildCreateEventBody(
  form: CreateEventFormState,
  location: PickedLocation,
  options?: { eventCoverUrl?: string | null }
): CreateEventBody | null {
  const title = form.title.trim();
  const description = form.description.trim();
  if (!title || !description || !form.category) return null;
  if (!isCreateEventDateAllowed(form.eventDate)) return null;
  if (!isPricingCompleteForSubmit(form)) return null;

  if (form.pricingMode === 'single') {
    const price = parsePriceInt(form.priceText);
    if (price === null) return null;
    const amenities = linesToAmenityArray(form.singleAmenitiesText);
    if (amenities.length === 0) return null;
    return {
      event_cover: options?.eventCoverUrl ?? null,
      title,
      description,
      category: form.category.toLowerCase(),
      date: formatLocalDateString(form.eventDate),
      time: formatLocalTimeString(form.eventTime),
      location: location.address,
      price,
      latitude: location.latitude,
      longitude: location.longitude,
      language: null,
      amenities,
    };
  }

  const details = tierDetailsFromForm(form);
  if (!details) return null;
  const price = details.Standard.price;

  return {
    event_cover: options?.eventCoverUrl ?? null,
    title,
    description,
    category: form.category.toLowerCase(),
    date: formatLocalDateString(form.eventDate),
    time: formatLocalTimeString(form.eventTime),
    location: location.address,
    price,
    latitude: location.latitude,
    longitude: location.longitude,
    language: null,
    tier_details: details,
  };
}

/** `hasEventCover` — create flow requires a picked cover image before submit. */
export function isCreateEventFormSubmittable(
  form: CreateEventFormState,
  location: PickedLocation | null,
  hasEventCover: boolean
): boolean {
  if (!location || !hasEventCover) return false;
  return buildCreateEventBody(form, location) !== null;
}
