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
