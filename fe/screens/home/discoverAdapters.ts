import type { FeaturedEventCardProps } from "@/components/FeaturedEventCard";
import { CATEGORY_COLORS } from "@/constants/categoryColors";
import {
  EVENT_CATEGORY_ICONS,
  eventCategoryFromApiValue,
  type EventCategoryLabel,
} from "@/constants/eventCategories";
import {
  displayEventDescription,
  displayEventTitle,
} from "@/lib/events/display-event-title";
import type { EventCard } from "@/services/types/events";
import type { ImageSource } from "expo-image";

const FALLBACK_ORGANIZER_LOGO = require("@/assets/images/home/logo1.svg");
const FALLBACK_BG = require("@/assets/images/home/bg_hackathon.png");

const M = {
  calendar: require("@/assets/images/events/music/calender.svg"),
  time: require("@/assets/images/events/music/time.svg"),
  location: require("@/assets/images/events/music/location.svg"),
};
const T = {
  calendar: require("@/assets/images/events/tech/calender.svg"),
  time: require("@/assets/images/events/tech/time.svg"),
  location: require("@/assets/images/events/tech/location.svg"),
};
const F = {
  calendar: require("@/assets/images/events/food/calender.svg"),
  time: require("@/assets/images/events/food/time.svg"),
  location: require("@/assets/images/events/food/location.svg"),
};

const DETAIL_ICONS: Record<
  EventCategoryLabel,
  { calendar: ImageSource; time: ImageSource; location: ImageSource }
> = {
  Music: M,
  Tech: T,
  Food: F,
  Art: M,
  Fitness: M,
  Gaming: M,
  Sports: M,
  Nightlife: M,
  Workshop: M,
  Network: M,
};

const DEFAULT_BG: Partial<Record<EventCategoryLabel, ImageSource>> = {
  Music: require("@/assets/images/home/bg_music.png"),
  Tech: require("@/assets/images/home/bg_hackathon.png"),
  Food: require("@/assets/images/home/bg_streetfood.png"),
};

function labelFromApi(card: EventCard): EventCategoryLabel {
  return eventCategoryFromApiValue(card.category);
}

function localHeroBackground(label: EventCategoryLabel): ImageSource {
  return DEFAULT_BG[label] ?? FALLBACK_BG;
}

/** Prefer API `event_cover` when set; otherwise category hero asset. */
function eventCardBackground(
  card: EventCard,
  label: EventCategoryLabel
): ImageSource {
  if (card.event_cover?.trim()) return { uri: card.event_cover.trim() };
  return localHeroBackground(label);
}

function formatPrice(amount: number): string {
  if (amount === 0) return "Free";
  return String(amount);
}

function formatLongDate(isoDate: string): string {
  const d = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeOfDay(isoTime: string): string {
  const m = isoTime.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return isoTime;
  const dt = new Date(2000, 0, 1, parseInt(m[1], 10), parseInt(m[2], 10));
  return dt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Matches previous mock: "Thu, Jan 15 | 8 PM" (no year on the strip). */
function formatCompactWhen(isoDate: string, isoTime: string): string {
  const d = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  const dateStr = Number.isNaN(d.getTime())
    ? isoDate
    : d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  return `${dateStr} | ${formatTimeOfDay(isoTime)}`;
}

export type HomeTrendingCardProps = {
  id: string;
  category: string;
  categoryIcon: ImageSource;
  title: string;
  description: string;
  date: string;
  location: string;
  bg: ImageSource;
  eventColor: string;
};

export function toHomeTrendingCardProps(
  card: EventCard
): HomeTrendingCardProps {
  const label = labelFromApi(card);
  return {
    id: card.id,
    category: label,
    categoryIcon: EVENT_CATEGORY_ICONS[label],
    title: displayEventTitle(card.title),
    description: displayEventDescription(card.description),
    date: formatCompactWhen(card.date, card.time),
    location: card.location,
    bg: eventCardBackground(card, label),
    eventColor: CATEGORY_COLORS[label],
  };
}

export function toFeaturedDiscoverProps(
  card: EventCard
): FeaturedEventCardProps {
  const label = labelFromApi(card);
  const icons = DETAIL_ICONS[label];
  const logo = card.organizer.logo
    ? { uri: card.organizer.logo }
    : FALLBACK_ORGANIZER_LOGO;

  return {
    eventId: card.id,
    isSavedInitially: card.is_saved,
    category: label,
    categoryIcon: EVENT_CATEGORY_ICONS[label],
    calendarIcon: icons.calendar,
    timeIcon: icons.time,
    locationIcon: icons.location,
    title: displayEventTitle(card.title),
    description: displayEventDescription(card.description),
    date: formatLongDate(card.date),
    time: formatTimeOfDay(card.time),
    location: card.location,
    bg: eventCardBackground(card, label),
    eventColor: CATEGORY_COLORS[label],
    price: formatPrice(card.price),
    attendees: card.participants,
    organizer: card.organizer.name,
    organizerLogo: logo,
    isFeatured: true,
    isPopular: card.is_popular,
  };
}
