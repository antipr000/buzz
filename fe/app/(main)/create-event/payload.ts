/**
 * Colocated with the create-event route: form → `POST /events/create` helpers.
 * Shared by this screen, `CreateEventDateTimeRow` (iOS/Android), and the API call.
 * Submit rules include a required event cover (`isCreateEventFormSubmittable` `hasEventCover`).
 *
 * API date/time use the device’s local calendar and clock (IST for typical
 * Indian users). Display uses `en-IN` for consistent India-first copy.
 */
import type { PickedLocation } from '@/components/LocationField';
import type { EventCategoryLabel } from '@/constants/eventCategories';
import type { CreateEventBody } from '@/services/types/events';

const DISPLAY_LOCALE = 'en-IN';

export type CreateEventFormState = {
  title: string;
  description: string;
  category: EventCategoryLabel | null;
  priceText: string;
  eventDate: Date;
  eventTime: Date;
};

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

export function buildCreateEventBody(
  form: CreateEventFormState,
  location: PickedLocation,
  options?: { eventCoverUrl?: string | null }
): CreateEventBody | null {
  const title = form.title.trim();
  const description = form.description.trim();
  if (!title || !description || !form.category) return null;
  const price = parsePriceInt(form.priceText);
  if (price === null) return null;

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
