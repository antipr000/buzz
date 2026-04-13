/**
 * API hooks (TanStack Query + @/services). Add a file per hook, re-export here.
 */

export { useAddress } from "./useAddress";
export { useBookings } from "./useBookings";
export { useAddresses } from "./useAddresses";
export { useCreateAddress } from "./useCreateAddress";
export { useDeactivateAccount } from "./useDeactivateAccount";
export { useDeleteAddress } from "./useDeleteAddress";
export { usePatchAddress } from "./usePatchAddress";
export { useDiscoverEvents, type UseDiscoverEventsArgs } from "./useDiscoverEvents";
export { useInfiniteDiscoverEvents, type UseInfiniteDiscoverEventsArgs } from "./useInfiniteDiscoverEvents";
export { useInfiniteSavedEvents, type UseInfiniteSavedEventsArgs } from "./useInfiniteSavedEvents";
export {
  useInfiniteCreatedEvents,
  type UseInfiniteCreatedEventsArgs,
} from "./useInfiniteCreatedEvents";
export { useEventDetail } from "./useEventDetail";
export { usePatchEvent, type PatchEventVariables } from "./usePatchEvent";
export { usePatchProfile } from "./usePatchProfile";
export { usePatchWhatsAppNotifications } from "./usePatchWhatsAppNotifications";
export { useProfileMe } from "./useProfileMe";
export { useProfileStats } from "./useProfileStats";
export { usePurchaseTickets } from "./usePurchaseTickets";
export { useVerifyBooking, type VerifyBookingVariables } from "./useVerifyBooking";
