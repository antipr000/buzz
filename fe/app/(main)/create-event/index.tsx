import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ArrowLeft, ImageIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateEventDateTimeRow } from '@/components/CreateEventDateTimeRow';
import { LocationField, type PickedLocation } from '@/components/LocationField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  EVENT_CATEGORY_ICONS,
  EVENT_CATEGORY_LABELS,
  type EventCategoryLabel,
} from '@/constants/eventCategories';
import { queryKeys } from '@/lib/query-keys';
import { createEvent, uploadEventCover } from '@/services/events';
import type { CreateEventBody } from '@/services/types/events';

import {
  type CreateEventFormState,
  buildCreateEventBody,
  isCreateEventFormSubmittable,
} from './payload';

const CATEGORIES: EventCategoryLabel[] = [...EVENT_CATEGORY_LABELS];

export default function CreateEventScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [coverAsset, setCoverAsset] = useState<{
    uri: string;
    mimeType?: string | null;
  } | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryLabel | null>(null);
  const [eventDate, setEventDate] = useState(() => new Date());
  const [eventTime, setEventTime] = useState(() => new Date());
  const [priceText, setPriceText] = useState('0');
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);

  const form: CreateEventFormState = useMemo(
    () => ({
      title,
      description,
      category: selectedCategory,
      priceText,
      eventDate,
      eventTime,
    }),
    [title, description, selectedCategory, priceText, eventDate, eventTime]
  );

  const canSubmit = isCreateEventFormSubmittable(
    form,
    pickedLocation,
    coverAsset !== null
  );

  const createMutation = useMutation({
    mutationFn: (body: CreateEventBody) => createEvent(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.events.all, 'discover'],
      });
      router.push({
        pathname: '/event-created',
        params: { id: data.id },
      });
    },
  });

  const isBusy = createMutation.isPending || isUploadingCover;

  const onSubmitCreate = async () => {
    if (!pickedLocation || !coverAsset || isBusy) return;
    if (!buildCreateEventBody(form, pickedLocation)) return;

    try {
      setIsUploadingCover(true);
      let publicUrl: string;
      try {
        const { public_url } = await uploadEventCover(
          coverAsset.uri,
          coverAsset.mimeType ?? null
        );
        publicUrl = public_url;
      } finally {
        setIsUploadingCover(false);
      }
      const body = buildCreateEventBody(form, pickedLocation, {
        eventCoverUrl: publicUrl,
      });
      if (!body) return;
      await createMutation.mutateAsync(body);
    } catch {
      Alert.alert('Could not create event', 'Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      //legacy support
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      console.log('ImagePicker Result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const a = result.assets[0];
        setCoverAsset({ uri: a.uri, mimeType: a.mimeType });
      } else {
        console.log('Image selection was canceled or no assets returned.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View
        className="pb-4 px-4 bg-secondary flex-row items-center gap-4"
        style={{ paddingTop: Math.max(insets.top, 40) }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="rgba(249, 250, 251, 1)" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-[#F97316]">Create Event</Text>
      </View>

      <ScrollView
        contentContainerClassName="p-5 pb-10 gap-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* Event Cover */}
        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">
            Event Cover <Text className="text-destructive">*</Text>
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            className="h-48 w-full rounded-2xl border-2 border-dashed border-primary/20 bg-[rgba(240,239,255,1)] items-center justify-center overflow-hidden"
          >
            {coverAsset ? (
              <Image
                source={{ uri: coverAsset.uri }}
                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center gap-2">
                <ImageIcon size={18} color="rgba(79, 70, 229, 0.5)" />
                <Text className="text-[rgba(15,23,42,0.7)] text-xs">
                  Tap to add a cover image (required)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Event Title */}
        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Event Title</Text>
          <Input
            placeholder="Give your event a catchy name"
            className="border-0 placeholder:text-xs bg-[rgba(240,239,255,1)]"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Description</Text>
          <Textarea
            placeholder="Tell people what your event is all about..."
            className="min-h-[85px] text-xs border-0 bg-[rgba(240,239,255,1)]"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Event Category */}
        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Event Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row flex-nowrap items-center gap-2.5"
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              const asset = EVENT_CATEGORY_ICONS[category];

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`shrink-0 flex-row items-center gap-1.5 rounded-full border border-primary px-4 py-2 ${
                    isSelected ? 'bg-primary' : 'bg-transparent'
                  }`}
                >
                  <View className="size-4 shrink-0 items-center justify-center">
                    <Image
                      source={asset}
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                    />
                  </View>
                  <Text className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-primary'}`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date & Time */}
        <CreateEventDateTimeRow
          dateValue={eventDate}
          timeValue={eventTime}
          onDateChange={setEventDate}
          onTimeChange={setEventTime}
        />

        {/* Location */}
        <View className="gap-1">
          <Text className="font-semibold text-foreground text-sm">Location</Text>
          <View className="relative justify-center">
            <View className="absolute left-3 z-10 pointer-events-none">
              <Image
                source={require('@/assets/images/create/location.svg')}
                style={{ width: 12, height: 12 }}
                contentFit="contain"
              />
            </View>
            <LocationField onLocationChange={setPickedLocation} />
          </View>
        </View>

        {/* Ticket Price */}
        <View className="gap-1">
          <Text className="font-medium text-foreground text-xs">Ticket Price</Text>
          <View className="relative justify-center">
            <View className="absolute left-3 z-10 pointer-events-none">
              <Image
                source={require('@/assets/images/create/cash.svg')}
                style={{ width: 12, height: 12 }}
                contentFit="contain"
              />
            </View>
            <Input
              placeholder="Keep it 0 for free events"
              className="pl-9 border-0 bg-[rgba(240,239,255,1)] text-xs"
              keyboardType="numeric"
              value={priceText}
              onChangeText={setPriceText}
            />
          </View>
        </View>
        <View className="p-4  items-center">
          <Button
            className="bg-primary px-10  rounded-xl"
            disabled={!canSubmit || isBusy}
            onPress={() => {
              void onSubmitCreate();
            }}
          >
            <Text className="text-white text-sm font-bold ">
              {isUploadingCover
                ? 'Uploading…'
                : createMutation.isPending
                  ? 'Creating…'
                  : 'Create Event'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
