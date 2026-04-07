import { listDevices } from "@/lib/api/devices";
import { queryKeys } from "@/lib/query/query-keys";
import { useQuery } from "@tanstack/react-query";

/** GET /devices/ */
export function useDevices() {
  return useQuery({
    queryKey: queryKeys.devices.list(),
    queryFn: listDevices,
  });
}
