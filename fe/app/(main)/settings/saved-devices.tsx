import { LogOutOtherDevicesDialog } from "@/components/account/LogOutOtherDevicesDialog";
import PageLayout from "@/components/layout/PageLayout";
import { Text } from "@/components/ui/text";
import { useDevices } from "@/hooks/api/useDevices";
import { getOrCreateDeviceKey } from "@/lib/device/device-key";
import Constants from "expo-constants";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";

function formatLastUsedDay(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function SavedDevices() {
  const { data, isPending, isError, isFetching, refetch } = useDevices();
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  const hasLoadedSuccessfully = data !== undefined;
  const devices = data ?? [];
  const showFullError = isError && !hasLoadedSuccessfully;
  const showStaleErrorBanner = isError && hasLoadedSuccessfully;
  const showInitialSpinner = isPending && !hasLoadedSuccessfully;

  useEffect(() => {
    void getOrCreateDeviceKey()
      .then(setCurrentKey)
      .catch(() => setCurrentKey(null));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const otherCount =
    currentKey != null
      ? devices.filter((d) => d.device_key !== currentKey).length
      : 0;

  const appVersion = Constants.expoConfig?.version;

  const countLabel = showInitialSpinner
    ? "…"
    : showFullError
      ? "—"
      : `${devices.length} saved device${devices.length === 1 ? "" : "s"}`;

  return (
    <PageLayout title="Saved Devices" contentContainerStyle={{ padding: 20 }}>
      <Text className="font-semibold text-xs text-secondary-foreground mb-4">
        {countLabel}
      </Text>

      {showInitialSpinner ? (
        <View className="py-12 items-center">
          <ActivityIndicator />
        </View>
      ) : showFullError ? (
        <View className="bg-white rounded-md p-5 shadow-sm border border-[rgba(0,0,0,0.06)] items-center gap-4">
          <Text className="text-center text-xs text-secondary-foreground">
            Could not load devices. Check your connection and try again.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isFetching}
            onPress={() => void refetch()}
            className="py-2.5 px-5 rounded-md border border-border bg-background"
          >
            {isFetching ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-xs font-semibold text-foreground">Retry</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {showStaleErrorBanner ? (
            <View className="mb-3 rounded-md border border-[rgba(255,43,23,0.25)] bg-[rgba(255,43,23,0.06)] px-3 py-2.5 flex-row items-center justify-between gap-2 flex-wrap">
              <Text className="text-[11px] text-[rgba(15,23,42,0.75)] flex-1 min-w-[140px]">
                Could not refresh the list.
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isFetching}
                onPress={() => void refetch()}
                className="py-1 px-2 rounded border border-[rgba(255,43,23,0.35)]"
              >
                {isFetching ? (
                  <ActivityIndicator size="small" color="#ff2b17" />
                ) : (
                  <Text className="text-[10px] font-semibold text-[rgba(255,43,23,1)]">
                    Retry
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          <View className="bg-white rounded-md p-5 shadow-sm border border-[rgba(0,0,0,0.03)]">
            {devices.length === 0 ? (
              <Text className="text-xs text-secondary-foreground">
                No devices registered yet. They appear here after you sign in on
                a device.
              </Text>
            ) : (
              devices.map((d, index) => {
                const isCurrent = currentKey != null && d.device_key === currentKey;
                return (
                  <View
                    key={d.id}
                    className={
                      index < devices.length - 1 ? "mb-6" : ""
                    }
                  >
                    <View className="flex-row items-center gap-2 mb-2 flex-wrap">
                      <Text className="font-medium text-xs text-secondary-foreground">
                        {d.device_name}
                      </Text>
                      {isCurrent ? (
                        <View className="bg-[rgba(220,255,198,1)] px-2 py-0.5 rounded-md">
                          <Text className="text-[rgba(19,158,1,1)] text-[10px] font-medium">
                            Current device
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {isCurrent && appVersion ? (
                      <Text className="text-[rgba(15,23,42,0.5)] text-[11px] mb-0.5">
                        Version {appVersion}
                      </Text>
                    ) : null}
                    <Text className="text-[rgba(15,23,42,0.5)] text-[11px]">
                      Last used: {formatLastUsedDay(d.last_used_at)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {currentKey != null && otherCount > 0 ? (
            <LogOutOtherDevicesDialog
              deviceKey={currentKey}
              onSuccess={() => {
                void refetch();
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-5 py-3 px-4 rounded-md border border-[rgba(255,43,23,0.35)] items-center"
              >
                <Text className="text-[rgba(255,43,23,1)] text-xs font-semibold">
                  Log out other devices
                </Text>
              </TouchableOpacity>
            </LogOutOtherDevicesDialog>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              disabled
              className="mt-5 py-3 px-4 rounded-md border border-[rgba(0,0,0,0.08)] opacity-50 items-center"
            >
              <Text className="text-[rgba(255,43,23,1)] text-xs font-semibold">
                Log out other devices
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </PageLayout>
  );
}
