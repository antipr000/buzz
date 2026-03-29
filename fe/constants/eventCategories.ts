import type { ImageSource } from 'expo-image';

/**
 * Single source of truth: matches `be/event/models/event.py` EventCategory values
 * and `fe/assets/images/common/category/*.svg` basenames (Title Case).
 */
export const EVENT_CATEGORY_LABELS = [
  'Music',
  'Art',
  'Food',
  'Fitness',
  'Tech',
  'Gaming',
  'Sports',
  'Nightlife',
  'Workshop',
  'Network',
] as const;

export type EventCategoryLabel = (typeof EVENT_CATEGORY_LABELS)[number];

export const EVENT_CATEGORY_ICONS = {
  Music: require('@/assets/images/common/category/music.svg'),
  Art: require('@/assets/images/common/category/art.svg'),
  Food: require('@/assets/images/common/category/food.svg'),
  Fitness: require('@/assets/images/common/category/fitness.svg'),
  Tech: require('@/assets/images/common/category/tech.svg'),
  Gaming: require('@/assets/images/common/category/gaming.svg'),
  Sports: require('@/assets/images/common/category/sports.svg'),
  Nightlife: require('@/assets/images/common/category/nightlife.svg'),
  Workshop: require('@/assets/images/common/category/workshop.svg'),
  Network: require('@/assets/images/common/category/network.svg'),
} as const satisfies Record<EventCategoryLabel, ImageSource>;

export function isEventCategoryLabel(s: string): s is EventCategoryLabel {
  return (EVENT_CATEGORY_LABELS as readonly string[]).includes(s);
}

/** API / filter sends lowercase enum value, e.g. `music` → `Music`. */
export function eventCategoryFromApiValue(raw: string): EventCategoryLabel {
  const t = raw.trim();
  if (!t) return 'Tech';
  const label =
    t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  return isEventCategoryLabel(label) ? label : 'Tech';
}
