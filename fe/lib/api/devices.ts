import { apiClient } from "@/lib/api/client";

export type DeviceRow = {
  id: string;
  device_key: string;
  device_name: string;
  last_used_at: string | null;
};

export type RegisterDevicePayload = {
  device_key: string;
  device_name: string;
};

export type MessageResponse = {
  message: string;
};

/** Upsert this install; server sets `last_used_at`. */
export async function registerDevice(
  payload: RegisterDevicePayload
): Promise<DeviceRow> {
  const { data } = await apiClient.post<DeviceRow>("devices/register", payload);
  return data;
}

/** All devices for the authenticated user. */
export async function listDevices(): Promise<DeviceRow[]> {
  const { data } = await apiClient.get<DeviceRow[]>("devices/");
  return data;
}

/** Delete every row except the one matching `device_key` (must be current device). */
export async function removeOtherDevices(deviceKey: string): Promise<MessageResponse> {
  const { data } = await apiClient.delete<MessageResponse>("devices/others", {
    data: { device_key: deviceKey },
  });
  return data;
}
