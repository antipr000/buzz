import FeaturedEventCard from "@/components/events/FeaturedEventCard";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useInfiniteDiscoverEvents } from "@/hooks/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { readUserLocation, type StoredUserLocation } from "@/lib/location/user-location";
import { toFeaturedDiscoverProps } from "@/screens/home/discoverAdapters";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllEventsScreen() {
  const router = useRouter();
  const [stored, setStored] = useState<StoredUserLocation | null | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      readUserLocation().then((loc) => {
        if (cancelled) return;
        setStored(loc);
        if (loc === null) {
          router.replace("/settings/location");
        }
      });
      return () => {
        cancelled = true;
      };
    }, [router])
  );

  const debouncedSearch = useDebouncedValue(searchQuery, 400);
  const discoverQ = debouncedSearch.trim() || undefined;

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteDiscoverEvents({
    lat: stored === undefined ? undefined : stored?.latitude,
    lng: stored === undefined ? undefined : stored?.longitude,
    q: discoverQ,
  });

  const events = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.trending_events),
    [data]
  );

  const hydrating = stored === undefined;
  const noLocation = stored === null;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 py-3 ">
          <View className="flex-row justify-end mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="flex-row items-center gap-1"
            >
              <Image
                source={require("@/assets/images/arrow_back.svg")}
                style={{ width: 8, height: 8 }}
                contentFit="contain"
              />
              <Text className="text-secondary-foreground text-xs font-medium">
                Back Home
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-1 flex-row items-center gap-2 rounded-lg bg-surface px-3">
            <Image
              source={require("@/assets/images/home/search.svg")}
              style={{ width: 14, height: 14 }}
              contentFit="contain"
            />
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by events, activities, venues, artists..."
              className="flex-1 text-xs border-0 font-medium placeholder:text-[rgba(15,23,42,0.5)] px-0"
            />
          </View>
        </View>

        {/* States */}
        {hydrating || (isLoading && events.length === 0) ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : noLocation ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-10">
            <Text className="text-primary text-sm text-center">
              Could not load events. Pull to retry.
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10">
            <Text className="text-primary text-sm text-center">
              {discoverQ
                ? "Nothing matches your search."
                : "No events found nearby."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FeaturedEventCard {...toFeaturedDiscoverProps(item)} />
            )}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
