import { apiClient } from "@/lib/api-client";
import type {
  CreateEventBody,
  CreateEventResponse,
  DiscoverResponse,
  EventCoverUploadResponse,
  SavedListResponse,
} from "@/services/types/events";

export async function saveEvent(eventId: string): Promise<void> {
  await apiClient.post("/events/save", { event_id: eventId });
}

export async function unsaveEvent(eventId: string): Promise<void> {
  await apiClient.delete(
    `/events/saved/${encodeURIComponent(eventId)}`
  );
}

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

export type SavedEventsRequestParams = {
  cursor?: string | null;
  limit?: number;
};

export async function getSavedEvents(
  params: SavedEventsRequestParams = {}
): Promise<SavedListResponse> {
  const { data } = await apiClient.get<SavedListResponse>("/events/saved", {
    params: {
      cursor: params.cursor ?? undefined,
      limit: params.limit,
    },
  });
  return data;
}

export async function createEvent(
  body: CreateEventBody
): Promise<CreateEventResponse> {
  const { data } = await apiClient.post<CreateEventResponse>(
    "/events/create",
    body
  );
  return data;
}

const COVER_FILENAME: Partial<Record<string, string>> = {
  "image/png": "cover.png",
  "image/webp": "cover.webp",
  "image/jpeg": "cover.jpg",
  "image/jpg": "cover.jpg",
};

function resolveContentType(
  uri: string,
  mimeType: string | null | undefined
): string {
  const m = mimeType?.trim();
  if (m) return m;
  // Fallback to file extension
  const u = uri.toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** Multipart upload of a local image URI (React Native). Requires auth. */
export async function uploadEventCover(
  uri: string,
  mimeType: string | null | undefined
): Promise<EventCoverUploadResponse> {
  const type = resolveContentType(uri, mimeType);
  const name = COVER_FILENAME[type] ?? "cover.jpg";
  const form = new FormData();
  form.append("file", { uri, type, name } as unknown as Blob);  // converts it in to a file object maybe

  // RN + axios: default transform can break multipart; see axios#4885
  const { data } = await apiClient.post<EventCoverUploadResponse>(
    "/events/cover",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (payload) => payload,  
    }
  );
  return data;
}
