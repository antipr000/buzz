import type { EventCategoryLabel } from '@/constants/eventCategories';

/** Brand tint per category — keys must match `EventCategoryLabel` only. */
export const CATEGORY_COLORS: Record<EventCategoryLabel, string> = {
  Music: '#EC4899',
  Art: '#E49B0F',
  Food: '#F97316',
  Fitness: '#EF4444',
  Tech: '#2563EB',
  Gaming: '#8B5CF6',
  Sports: '#22C55E',
  Nightlife: '#DB2777',
  Workshop: '#FACC15',
  Network: '#1D4ED8',
};
