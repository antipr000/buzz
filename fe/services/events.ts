import { apiClient } from "@/lib/api-client";
import type { DiscoverResponse } from "@/services/types/events";

export type DiscoverRequestParams = {
  lat: number;
  lng: number;
  radius?: number;
  category?: string | null;
  cursor?: string | null;
  limit?: number;
};

export async function getDiscoverEvents(
  params: DiscoverRequestParams
): Promise<DiscoverResponse> {
  const { data } = await apiClient.get<DiscoverResponse>(
    "/events/discover",
    {
      params: {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius,
        category: params.category ?? undefined,
        cursor: params.cursor ?? undefined,
        limit: params.limit,
      },
    }
  );
  return data;
}
