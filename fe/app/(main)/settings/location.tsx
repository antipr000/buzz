import PageLayout from '@/components/layout/PageLayout';
import {
  LocationField,
  type PickedLocation,
} from '@/components/create-event/LocationField';
import { Text } from '@/components/ui/text';
import { getIndiaCityPreset } from '@/lib/location/india-city-presets';
import { requestAndPersistCurrentLocation } from '@/lib/location/request-and-persist-current-location';
import { persistUserLocationCoords } from '@/lib/location/user-location';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  View,
} from 'react-native';

const Location = () => {
  const [requestingGPS, setRequestingGPS] = useState(false);

  const popularCities = [
    { name: 'Bangalore', icon: require('@/assets/images/settings/location/bangalore.svg') },
    { name: 'Mumbai', icon: require('@/assets/images/settings/location/mumbai.svg') },
    { name: 'Hyderabad', icon: require('@/assets/images/settings/location/hyderabad.svg') },
    { name: 'Ahmedabad', icon: require('@/assets/images/settings/location/ahemadabad.svg') },
    { name: 'Delhi-NCR', icon: require('@/assets/images/settings/location/delhi.svg') },
    { name: 'Pune', icon: require('@/assets/images/settings/location/pune.svg') },
  ];

  const otherCities = [
    'Kolkata', 'Pune', 'Gurugram', 'Chennai', 'Kochi',
  ];

  const onAutoDetect = useCallback(async () => {
    setRequestingGPS(true);
    try {
      const result = await requestAndPersistCurrentLocation();
      if (result.ok) {
        router.replace('/(main)/(tabs)');
        return;
      }
      if (result.reason === 'denied') {
        Alert.alert(
          'Location access',
          'Permission was denied. You can enable it in system settings or enter a location manually.',
        );
        return;
      }
      Alert.alert(
        'Could not get location',
        'Something went wrong reading your position. Try again or enter a location manually.',
      );
    } finally {
      setRequestingGPS(false);
    }
  }, []);

  const onLocationChange = useCallback((picked: PickedLocation | null) => {
    if (!picked) return;
    persistUserLocationCoords({
      latitude: picked.latitude,
      longitude: picked.longitude,
      label: picked.label,
    })
      .then(() => router.replace('/(main)/(tabs)'))
      .catch((e) => {
        console.warn('Persist location error', e);
        Alert.alert(
          'Could not save location',
          'Something went wrong saving your choice. Try again.',
        );
      });
  }, []);

  const onPresetCity = useCallback((cityName: string) => {
    const preset = getIndiaCityPreset(cityName);
    if (!preset) {
      Alert.alert(
        'Location unavailable',
        'We could not use that city preset. Try search or auto detect.',
      );
      return;
    }
    persistUserLocationCoords({
      latitude: preset.latitude,
      longitude: preset.longitude,
      label: `${cityName}, India`,
    })
      .then(() => router.replace('/(main)/(tabs)'))
      .catch((e) => {
        console.warn('Persist preset city error', e);
        Alert.alert(
          'Could not save location',
          'Something went wrong saving your choice. Try again.',
        );
      });
  }, []);

  return (
    <PageLayout title="Location" keyboardShouldPersistTaps="handled">
      {/* Auto Detect & Search */}
      <View className="px-5 py-4">
        <TouchableOpacity
          activeOpacity={0.7}
          className="mb-4 flex-row items-center gap-2"
          onPress={onAutoDetect}
          disabled={requestingGPS}
        >
          <Image
            source={require('@/assets/images/settings/location/target.svg')}
            style={{ width: 16, height: 16 }}
            contentFit="contain"
          />
          {requestingGPS ? (
            <ActivityIndicator size="small" color="rgba(255,13,13,1)" />
          ) : null}
          <Text
            className={`text-xs text-[rgba(255,13,13,1)] ${requestingGPS ? 'opacity-70' : ''}`}
          >
            Auto Detect My Location
          </Text>
        </TouchableOpacity>

        <View className="gap-1">
          <Text className="text-xs font-semibold text-secondary-foreground">
            Search
          </Text>
          <View className="relative justify-center">
            <View className="pointer-events-none absolute left-3 z-10">
              <Image
                source={require('@/assets/images/create/location.svg')}
                style={{ width: 12, height: 12 }}
                contentFit="contain"
              />
            </View>
            <LocationField
              onLocationChange={onLocationChange}
              placeholder="Search for your city"
            />
          </View>
        </View>
      </View>

      {/* Popular Cities */}
      <View className="px-5 py-4">
        <Text className="text-xs font-bold text-secondary-foreground">
          POPULAR CITIES
        </Text>
      </View>

      <View className="flex-row flex-wrap bg-white px-5 py-6 gap-y-6">
        {popularCities.map((city) => (
          <TouchableOpacity
            key={city.name}
            activeOpacity={0.7}
            className="w-1/4 items-center"
            onPress={() => onPresetCity(city.name)}
          >
            <View className="mb-2 h-16 w-16 items-center justify-center rounded-full border border-[rgba(0,0,0,0.3)]">
              <Image source={city.icon} style={{ width: 45, height: 45 }} contentFit="contain" />
            </View>
            <Text className="text-center text-[12px] font-medium text-primary">{city.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Other Cities */}
      <View className="px-5 py-4">
        <Text className="text-xs font-bold text-secondary-foreground">OTHER CITIES</Text>
      </View>

      <View className="bg-white px-5 py-3">
        {otherCities.map((city) => (
          <TouchableOpacity
            key={city}
            activeOpacity={0.7}
            className="py-4"
            onPress={() => onPresetCity(city)}
          >
            <Text className="text-xs text-secondary-foreground">{city}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </PageLayout>
  );
};

export default Location;
