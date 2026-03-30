import FeaturedEventCard from "@/components/FeaturedEventCard";
import { Text } from "@/components/ui/text";
import { useInfiniteDiscoverEvents } from "@/hooks/api";
import { readUserLocation, type StoredUserLocation } from "@/lib/user-location";
import { toFeaturedDiscoverProps } from "@/screens/home/discoverAdapters";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;
    readUserLocation().then((loc) => {
      if (!cancelled) setStored(loc);
    });
    return () => { cancelled = true; };
  }, []);

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
        <View className="px-5 py-3 bg-[rgba(238,237,255,1)]">
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

          <View className="flex-row items-center gap-2">
            <Text className="text-secondary-foreground text-base font-bold tracking-tight">
              Trending now - feel it, reel it
            </Text>
            <Image
              source={require("@/assets/images/home/fire.gif")}
              style={{ width: 30, height: 30, borderRadius: 999 }}
            />
          </View>
        </View>

        {/* States */}
        {hydrating || (isLoading && events.length === 0) ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : noLocation ? (
          <View className="flex-1 items-center justify-center px-10">
            <Text className="text-primary text-sm text-center">
              Allow location access to see events near you.
            </Text>
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
              No events found nearby.
            </Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link href={`/event/${item.id}`} asChild>
                <TouchableOpacity activeOpacity={0.8}>
                  <FeaturedEventCard {...toFeaturedDiscoverProps(item)} />
                </TouchableOpacity>
              </Link>
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
