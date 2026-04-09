/**
 * Aligned with be/event/schemas/event_schemas.py (snake_case JSON).
 */

export type OrganizerOut = {
  name: string;
  logo: string | null;
};

export type EventCard = {
  id: string;
  category: string;
  title: string;
  description: string;
  /** ISO date string from API */
  date: string;
  /** ISO time string from API */
  time: string;
  location: string;
  price: number;
  is_featured: boolean;
  is_popular: boolean;
  organizer: OrganizerOut;
  event_cover: string | null;
  participants: number;
  is_saved: boolean;
  latitude: number | null;
  longitude: number | null;
};

/** GET /events/{id} — extends card with tier prices and purchase hints */
export type TicketTierPriceOut = {
  tier: string;
  price: number;
  amenities: string[];
};

export type EventDetailOut = EventCard & {
  ticket_tiers: TicketTierPriceOut[];
  /** GET /events/{id} — whether the current user is the organizer */
  is_organizer: boolean;
};

export type PaginationOut = {
  next_cursor: string | null;
  has_more: boolean;
};

export type DiscoverResponse = {
  user_location: string | null;
  trending_events: EventCard[];
  pagination: PaginationOut;
};

export type SavedListResponse = {
  saved_events: EventCard[];
  pagination: PaginationOut;
};

export type CreatedListResponse = {
  created_events: EventCard[];
  pagination: PaginationOut;
};

/** PATCH /events/{id} — snake_case JSON; send only fields to change */
export type PatchEventBody = {
  title?: string;
  description?: string;
  event_cover?: string;
};

/** One tier inside POST /events/create `tier_details` (keys: Standard, Premium, VIP). */
export type CreateEventTierRow = {
  price: number;
  amenities: string[];
};

/** POST /events/create body (snake_case), matches be/event/schemas/event_schemas.py */
export type CreateEventBody = {
  event_cover?: string | null;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  /** Single-ticket price, or Standard tier price when `tier_details` is set (must match). */
  price: number;
  latitude: number;
  longitude: number;
  language?: string | null;
  /** When set, must include Standard, Premium, and VIP. Omit or null for single-price events. */
  tier_details?: {
    Standard: CreateEventTierRow;
    Premium: CreateEventTierRow;
    VIP: CreateEventTierRow;
  } | null;
};

export type CreateEventResponse = {
  id: string;
};

/** POST /events/cover response */
export type EventCoverUploadResponse = {
  public_url: string;
};
