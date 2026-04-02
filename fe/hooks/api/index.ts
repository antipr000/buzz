/**
 * API hooks (TanStack Query + @/services). Add a file per hook, re-export here.
 */

export { useAddress } from "./useAddress";
export { useAddresses } from "./useAddresses";
export { useCreateAddress } from "./useCreateAddress";
export { useDeleteAddress } from "./useDeleteAddress";
export { usePatchAddress } from "./usePatchAddress";
export { useDiscoverEvents, type UseDiscoverEventsArgs } from "./useDiscoverEvents";
export { useInfiniteDiscoverEvents, type UseInfiniteDiscoverEventsArgs } from "./useInfiniteDiscoverEvents";
export { useInfiniteSavedEvents, type UseInfiniteSavedEventsArgs } from "./useInfiniteSavedEvents";
export { usePatchProfile } from "./usePatchProfile";
export { useProfileMe } from "./useProfileMe";
export { useProfileStats } from "./useProfileStats";
export { usePurchaseTickets } from "./usePurchaseTickets";
